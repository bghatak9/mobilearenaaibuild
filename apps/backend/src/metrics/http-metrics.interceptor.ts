import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

import { MetricsService } from './metrics.service';

const SILENT_PATHS = new Set(['/health', '/health/ready', '/metrics']);

/**
 * Records Prometheus metrics for every HTTP request and emits a structured
 * access log line. Uses the matched route pattern (e.g. `/devices/:id`) for
 * labels to keep metric cardinality bounded.
 */
@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const start = process.hrtime.bigint();
    const method = req.method;

    const finish = (status: number) => {
      const route = this.resolveRoute(req);
      const seconds = Number(process.hrtime.bigint() - start) / 1e9;
      this.metrics.record(method, route, status, seconds);

      if (!SILENT_PATHS.has(req.path)) {
        const ms = (seconds * 1000).toFixed(1);
        this.logger.log(`${method} ${req.originalUrl} ${status} ${ms}ms`);
      }
    };

    return next.handle().pipe(
      tap({
        next: () => finish(res.statusCode),
        error: (err: { status?: number }) => finish(err?.status ?? 500),
      }),
    );
  }

  private resolveRoute(req: Request): string {
    const route = (req.route as { path?: string } | undefined)?.path;
    return route ?? 'unknown';
  }
}
