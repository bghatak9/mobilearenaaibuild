import { Injectable } from '@nestjs/common';
import {
  Counter,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from 'prom-client';

@Injectable()
export class MetricsService {
  readonly registry = new Registry();
  readonly httpRequestsTotal: Counter<string>;
  readonly httpRequestDuration: Histogram<string>;

  constructor() {
    this.registry.setDefaultLabels({ app: 'mobilearena-api' });
    collectDefaultMetrics({ register: this.registry });

    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
      registers: [this.registry],
    });
  }

  record(method: string, route: string, status: number, seconds: number) {
    const labels = { method, route, status: String(status) };
    this.httpRequestsTotal.inc(labels);
    this.httpRequestDuration.observe(labels, seconds);
  }

  contentType() {
    return this.registry.contentType;
  }

  metrics() {
    return this.registry.metrics();
  }
}
