import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { initSentry } from './observability/sentry';

async function bootstrap() {
  initSentry();

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.getHttpAdapter().getInstance().set('trust proxy', true);

  const explicitOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
  ].filter((origin): origin is string => Boolean(origin));

  const localDevOrigin =
    /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?$/;

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (explicitOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      if (
        process.env.NODE_ENV !== 'production' &&
        localDevOrigin.test(origin)
      ) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  await app.listen(port, '0.0.0.0');

  if (process.env.CATALOG_IMPORTED_ONLY === 'true') {
    console.log('📦 Catalog mode: imported devices only');
  }
  console.log(`🚀 Backend running at http://localhost:${port}`);
}

bootstrap();