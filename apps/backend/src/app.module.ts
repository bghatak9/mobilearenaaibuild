import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AllExceptionsFilter } from './observability/all-exceptions.filter';
import { LocaleInterceptor } from './common/locale.interceptor';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { AuditModule } from './audit/audit.module';
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
import { UserModule } from './user/user.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AdvertisementModule } from './advertisement/advertisement.module';
import { ProfileModule } from './profile/profile.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { ContactModule } from './contact/contact.module';
import { CommunityModule } from './community/community.module';
import { TranslateModule } from './translate/translate.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ContentTranslationModule } from './content-translation/content-translation.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    PrismaModule,
    CacheModule,
    HealthModule,
    MetricsModule,
    AuditModule,
    BrandModule,
    CategoryModule,
    ManufacturerModule,
    DeviceModule,
    ImportModule,
    AuthModule,
    ReviewModule,
    NewsModule,
    ContentTranslationModule,
    SearchModule,
    RatingModule,
    CommentModule,
    CompareModule,
    UserModule,
    AnalyticsModule,
    AdvertisementModule,
    ProfileModule,
    NewsletterModule,
    ContactModule,
    CommunityModule,
    TranslateModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LocaleInterceptor },
  ],
})
export class AppModule {}
