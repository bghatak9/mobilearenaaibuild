import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ContentTranslationModule } from '../content-translation/content-translation.module';

@Module({
  imports: [PrismaModule, ContentTranslationModule],
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule {}
