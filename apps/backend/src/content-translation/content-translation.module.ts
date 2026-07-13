import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ContentTranslationController } from './content-translation.controller';
import { ContentTranslationService } from './content-translation.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ContentTranslationController],
  providers: [ContentTranslationService],
  exports: [ContentTranslationService],
})
export class ContentTranslationModule {}
