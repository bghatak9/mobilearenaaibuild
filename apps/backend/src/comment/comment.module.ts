import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentAiSpamService } from './comment-ai-spam.service';
import { CommentModerationService } from './comment-moderation.service';
import { CommentService } from './comment.service';
import { CommentSpamService } from './comment-spam.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CommentController],
  providers: [
    CommentService,
    CommentSpamService,
    CommentAiSpamService,
    CommentModerationService,
  ],
})
export class CommentModule {}
