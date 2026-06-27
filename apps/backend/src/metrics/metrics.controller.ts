import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';

import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  /** Prometheus scrape endpoint. */
  @Get()
  async scrape(@Res() res: Response) {
    res.setHeader('Content-Type', this.metrics.contentType());
    res.send(await this.metrics.metrics());
  }
}
