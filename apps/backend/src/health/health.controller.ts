import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';

import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  /** Liveness: the process is up and the event loop is responsive. */
  @Get()
  liveness() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  /** Readiness: dependencies (database, cache) are reachable. */
  @Get('ready')
  async readiness(@Res({ passthrough: true }) res: Response) {
    const report = await this.health.check();
    res.status(report.status === 'ok' ? 200 : 503);
    return report;
  }
}
