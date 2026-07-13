import { Module } from '@nestjs/common';
import { CompareController } from './compare.controller';
import { CompareService } from './compare.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ContentTranslationModule } from '../content-translation/content-translation.module';

@Module({
  imports: [PrismaModule, ContentTranslationModule],
  controllers: [CompareController],
  providers: [CompareService],
})
export class CompareModule {}
