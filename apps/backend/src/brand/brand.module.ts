import { Module } from '@nestjs/common';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ContentTranslationModule } from '../content-translation/content-translation.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [PrismaModule, ContentTranslationModule, CacheModule],
  controllers: [BrandController],
  providers: [BrandService],
  exports: [BrandService],
})
export class BrandModule {}
