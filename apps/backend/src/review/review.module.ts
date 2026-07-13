import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ContentTranslationModule } from '../content-translation/content-translation.module';

@Module({
  imports: [PrismaModule, ContentTranslationModule],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
