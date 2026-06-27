import { Logger } from '@nestjs/common';
import * as Sentry from '@sentry/node';

const logger = new Logger('Sentry');
let enabled = false;

/**
 * Initialise Sentry only when a DSN is configured. Without `SENTRY_DSN` this is
 * a no-op, so local/dev runs need no Sentry account.
 */
export function initSentry(): boolean {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return false;

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0),
  });
  enabled = true;
  logger.log('Sentry error tracking enabled');
  return true;
}

export function isSentryEnabled(): boolean {
  return enabled;
}

export function captureException(error: unknown): void {
  if (enabled) {
    Sentry.captureException(error);
  }
}
