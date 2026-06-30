import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentStatus, UserRole } from '@prisma/client';

import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import {
  BulkModerateCommentsDto,
  ModerateCommentDto,
} from './dto/moderate-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

interface AuthRequest {
  user: { userId: number; email: string; role: UserRole };
}

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: AuthRequest, @Body() dto: CreateCommentDto) {
    return this.commentService.create({
      body: dto.body,
      userId: req.user.userId,
      deviceId: dto.deviceId,
    });
  }

  @Get('moderation/ai-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.EDITOR,
    UserRole.MODERATOR,
  )
  aiStatus() {
    return {
      configured: this.commentService.isAiSpamConfigured(),
      model: process.env.AI_SPAM_MODEL?.trim() || 'gpt-4o-mini',
      autoRemoveThreshold:
        Number(process.env.AI_SPAM_AUTO_REMOVE_THRESHOLD) || 85,
    };
  }

  @Get('moderation/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.EDITOR,
    UserRole.MODERATOR,
  )
  moderationStats() {
    return this.commentService.getModerationService().getStats();
  }

  @Get('moderation/queue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.EDITOR,
    UserRole.MODERATOR,
  )
  moderationQueue(@Query('status') status?: CommentStatus) {
    return this.commentService.getModerationService().getQueue(status);
  }

  @Get('moderation/audit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.EDITOR,
    UserRole.MODERATOR,
  )
  moderationAudit(@Query('limit') limit?: string) {
    return this.commentService
      .getModerationService()
      .getAuditLogs(limit ? +limit : 50);
  }

  @Post('moderation/bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.EDITOR,
    UserRole.MODERATOR,
  )
  bulkModerate(@Req() req: AuthRequest, @Body() dto: BulkModerateCommentsDto) {
    return this.commentService
      .getModerationService()
      .moderateBulk(dto.ids, dto.action, req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.EDITOR,
    UserRole.MODERATOR,
  )
  findAll() {
    return this.commentService.findAll();
  }

  @Get('device/:deviceId')
  findByDevice(@Param('deviceId', ParseIntPipe) deviceId: number) {
    return this.commentService.findByDevice(deviceId);
  }

  @Patch(':id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.EDITOR,
    UserRole.MODERATOR,
  )
  moderate(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ModerateCommentDto,
  ) {
    return this.commentService
      .getModerationService()
      .moderateOne(id, dto.action, req.user.userId, dto.notes);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentService.update(id, req.user.userId, dto.body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.commentService.remove(id, req.user);
  }
}
