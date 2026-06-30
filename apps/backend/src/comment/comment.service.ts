import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentStatus, UserRole } from '@prisma/client';

import { AuditService } from '../audit/audit.service';
import { CommentModerationService } from './comment-moderation.service';
import { CommentSpamService } from './comment-spam.service';
import { PrismaService } from '../prisma/prisma.service';

const MODERATOR_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.EDITOR,
  UserRole.MODERATOR,
];

const PUBLIC_STATUSES: CommentStatus[] = [
  CommentStatus.PUBLISHED,
  CommentStatus.APPROVED,
];

@Injectable()
export class CommentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly spam: CommentSpamService,
    private readonly moderation: CommentModerationService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: { body: string; userId: number; deviceId: number }) {
    const author = await this.spam.loadAuthor(dto.userId);
    const trust = this.spam.getTrustLevel(author);

    await this.spam.enforceRateLimits(dto.userId, trust);
    await this.spam.checkDuplicate(dto.userId, dto.body);

    const analysis = await this.spam.analyze(dto.body, author);
    if (analysis.hardBlock) {
      if (analysis.aiRemoved) {
        await this.prisma.comment.create({
          data: {
            body: dto.body,
            userId: dto.userId,
            deviceId: dto.deviceId,
            status: CommentStatus.SPAM,
            spamScore: analysis.score,
            aiSpamScore: analysis.aiSpamScore ?? null,
            spamReason: analysis.reasons.join('; ') || analysis.hardBlock,
            isDeleted: true,
          },
        });
      }

      await this.audit.log({
        userId: dto.userId,
        action: analysis.aiRemoved
          ? 'comment.spam.ai_removed'
          : 'comment.spam.blocked',
        entity: 'comment',
        entityId: String(dto.deviceId),
      });
      throw new BadRequestException(analysis.hardBlock);
    }

    const status = this.spam.resolveStatus(analysis, trust);
    const isDeleted = status === CommentStatus.SPAM;

    if (status === CommentStatus.SPAM) {
      await this.prisma.comment.create({
        data: {
          body: dto.body,
          userId: dto.userId,
          deviceId: dto.deviceId,
          status,
          spamScore: analysis.score,
          aiSpamScore: analysis.aiSpamScore ?? null,
          spamReason: analysis.reasons.join('; ') || 'Auto-detected spam',
          isDeleted: true,
        },
      });

      await this.audit.log({
        userId: dto.userId,
        action: analysis.aiSpamScore != null
          ? 'comment.spam.ai_removed'
          : 'comment.spam.auto_removed',
        entity: 'comment',
        entityId: String(dto.deviceId),
      });

      throw new BadRequestException(
        this.spam.userMessageForStatus(status) ??
          'Your comment was rejected as spam.',
      );
    }

    const comment = await this.prisma.comment.create({
      data: {
        body: dto.body,
        userId: dto.userId,
        deviceId: dto.deviceId,
        status,
        spamScore: analysis.score,
        aiSpamScore: analysis.aiSpamScore ?? null,
        spamReason: analysis.reasons.length
          ? analysis.reasons.join('; ')
          : null,
        isDeleted,
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    if (
      status === CommentStatus.PENDING_REVIEW ||
      status === CommentStatus.HIDDEN
    ) {
      await this.audit.log({
        userId: dto.userId,
        action: 'comment.spam.queued',
        entity: 'comment',
        entityId: String(comment.id),
      });
    }

    const moderationMessage = this.spam.userMessageForStatus(status);

    return {
      ...comment,
      moderationMessage,
      visible: PUBLIC_STATUSES.includes(status),
    };
  }

  findByDevice(deviceId: number) {
    return this.prisma.comment.findMany({
      where: {
        deviceId,
        isDeleted: false,
        status: { in: PUBLIC_STATUSES },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });
  }

  findAll() {
    return this.prisma.comment.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            reputationPoints: true,
            role: true,
          },
        },
        device: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async remove(id: number, actor: { userId: number; role: UserRole }) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found.`);
    }
    const isModerator = MODERATOR_ROLES.includes(actor.role);
    if (!isModerator && comment.userId !== actor.userId) {
      throw new ForbiddenException('You can only delete your own comments.');
    }

    const updated = await this.prisma.comment.update({
      where: { id },
      data: {
        isDeleted: true,
        status: isModerator ? CommentStatus.REMOVED : comment.status,
        moderatedById: isModerator ? actor.userId : undefined,
        moderatedAt: isModerator ? new Date() : undefined,
      },
    });

    await this.audit.log({
      userId: actor.userId,
      action: isModerator ? 'comment.moderation.reject' : 'comment.deleted',
      entity: 'comment',
      entityId: String(id),
    });

    return updated;
  }

  async update(id: number, userId: number, body: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found.`);
    }
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only edit your own comments.');
    }
    if (comment.isDeleted) {
      throw new BadRequestException('This comment can no longer be edited.');
    }

    const author = await this.spam.loadAuthor(userId);
    const trust = this.spam.getTrustLevel(author);
    const analysis = await this.spam.analyze(body, author);

    if (analysis.hardBlock) {
      throw new BadRequestException(analysis.hardBlock);
    }

    const status = this.spam.resolveStatus(analysis, trust);
    if (status === CommentStatus.SPAM) {
      throw new BadRequestException('Edited comment was rejected as spam.');
    }

    return this.prisma.comment.update({
      where: { id },
      data: {
        body,
        status,
        spamScore: analysis.score,
        aiSpamScore: analysis.aiSpamScore ?? null,
        spamReason: analysis.reasons.length
          ? analysis.reasons.join('; ')
          : null,
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        device: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  getModerationService() {
    return this.moderation;
  }

  isAiSpamConfigured(): boolean {
    return this.spam.isAiConfigured();
  }
}
