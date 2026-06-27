import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

type ComponentStatus = {
  status: 'up' | 'down' | 'disabled';
  latencyMs?: number;
  error?: string;
};

export type ReadinessReport = {
  status: 'ok' | 'error';
  info: {
    db: ComponentStatus;
    cache: ComponentStatus;
  };
  timestamp: string;
};

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async check(): Promise<ReadinessReport> {
    const db = await this.checkDb();
    const cache = this.checkCache();

    // The database is required; the cache degrades gracefully, so a down/
    // disabled cache does not fail readiness.
    const status = db.status === 'up' ? 'ok' : 'error';

    return {
      status,
      info: { db, cache },
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDb(): Promise<ComponentStatus> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'up', latencyMs: Date.now() - start };
    } catch (error) {
      return { status: 'down', error: (error as Error).message };
    }
  }

  private checkCache(): ComponentStatus {
    if (!this.cache.isEnabled()) return { status: 'disabled' };
    return { status: this.cache.isHealthy() ? 'up' : 'down' };
  }
}
