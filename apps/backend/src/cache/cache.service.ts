import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Thin, fail-safe wrapper around Redis. Every operation degrades gracefully:
 * if Redis is unreachable, reads return a miss and writes are no-ops, so the
 * API keeps serving straight from the database.
 */
@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client: Redis | null = null;
  private healthy = false;
  private readonly prefix = 'ma:';
  readonly defaultTtl = 60; // seconds

  onModuleInit() {
    const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
    try {
      this.client = new Redis(url, {
        enableOfflineQueue: false,
        maxRetriesPerRequest: 1,
        // Stop hammering a dead Redis after a few attempts.
        retryStrategy: (times) =>
          times > 5 ? null : Math.min(times * 200, 2000),
      });

      this.client.on('ready', () => {
        this.healthy = true;
        this.logger.log('Redis cache connected');
      });
      this.client.on('end', () => {
        this.healthy = false;
      });
      this.client.on('error', (err: Error) => {
        if (this.healthy) {
          this.logger.warn(`Redis error, caching disabled: ${err.message}`);
        }
        this.healthy = false;
      });
    } catch {
      this.logger.warn('Redis init failed; caching disabled');
      this.client = null;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit().catch(() => undefined);
    }
  }

  private withPrefix(key: string) {
    return `${this.prefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client || !this.healthy) return null;
    try {
      const raw = await this.client.get(this.withPrefix(key));
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = this.defaultTtl) {
    if (!this.client || !this.healthy) return;
    try {
      await this.client.set(
        this.withPrefix(key),
        JSON.stringify(value),
        'EX',
        ttlSeconds,
      );
    } catch {
      // ignore — cache writes are best-effort
    }
  }

  async delByPrefix(prefix: string) {
    if (!this.client || !this.healthy) return;
    const match = `${this.withPrefix(prefix)}*`;
    try {
      const stream = this.client.scanStream({ match, count: 100 });
      const pipeline = this.client.pipeline();
      let count = 0;
      for await (const keys of stream as AsyncIterable<string[]>) {
        for (const key of keys) {
          pipeline.del(key);
          count += 1;
        }
      }
      if (count > 0) await pipeline.exec();
    } catch {
      // ignore
    }
  }

  /**
   * Cache-aside helper: return the cached value or run `producer`, cache its
   * result, and return it. A thrown producer (e.g. NotFound) is never cached.
   */
  async wrap<T>(
    key: string,
    ttlSeconds: number,
    producer: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const fresh = await producer();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }
}
