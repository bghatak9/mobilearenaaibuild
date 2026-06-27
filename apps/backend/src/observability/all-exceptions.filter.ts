import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { captureException } from './sentry';

/**
 * Catches every unhandled error, returns a consistent JSON shape, logs 5xx
 * errors with their stack, and forwards them to Sentry when configured.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(`${req.method} ${req.url} -> ${status}`, stack);
      captureException(exception);
    }

    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      res
        .status(status)
        .json(
          typeof body === 'string'
            ? { statusCode: status, message: body, path: req.url }
            : body,
        );
      return;
    }

    res.status(status).json({
      statusCode: status,
      message: 'Internal server error',
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  }
}
