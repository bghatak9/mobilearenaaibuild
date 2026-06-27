import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { BrandModule } from './brand/brand.module';
import { CategoryModule } from './category/category.module';
import { ManufacturerModule } from './manufacturer/manufacturer.module';
import { DeviceModule } from './device/device.module';
import { ImportModule } from './import/import.module';
import { AuthModule } from './auth/auth.module';
import { ReviewModule } from './review/review.module';
import { NewsModule } from './news/news.module';
import { RatingModule } from './rating/rating.module';
import { CommentModule } from './comment/comment.module';
import { CompareModule } from './compare/compare.module';

@Module({
  imports: [
    PrismaModule,
    CacheModule,
    BrandModule,
    CategoryModule,
    ManufacturerModule,
    DeviceModule,
    ImportModule,
    AuthModule,
    ReviewModule,
    NewsModule,
    RatingModule,
    CommentModule,
    CompareModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
