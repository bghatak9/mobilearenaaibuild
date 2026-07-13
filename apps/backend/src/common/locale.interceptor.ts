import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { normalizeLocaleParam } from '../content-translation/content-locale';

/**
 * Ensures every request has a resolved locale:
 * 1. ?locale= / ?lang=
 * 2. Accept-Language
 * 3. en
 *
 * Attaches `req.locale` for controllers/services.
 */
@Injectable()
export class LocaleInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{
      query?: Record<string, unknown>;
      headers?: Record<string, string | string[] | undefined>;
      locale?: string;
    }>();

    const q = req.query ?? {};
    const fromQuery =
      (typeof q.locale === 'string' && q.locale) ||
      (typeof q.lang === 'string' && q.lang) ||
      undefined;

    const accept = req.headers?.['accept-language'];
    const acceptRaw = Array.isArray(accept) ? accept[0] : accept;
    const fromHeader = acceptRaw?.split(',')[0]?.split(';')[0]?.trim();

    req.locale = normalizeLocaleParam(fromQuery || fromHeader || 'en');

    if (!q.locale && !q.lang) {
      q.locale = req.locale;
    }

    return next.handle();
  }
}
