import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentStatus, UserRole } from '@prisma/client';

import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';

export type ModerationAction = 'approve' | 'reject' | 'spam';

@Injectable()
export class CommentModerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getQueue(status?: CommentStatus) {
    return this.prisma.comment.findMany({
      where: {
        isDeleted: false,
        status: status ?? {
          in: [
            CommentStatus.PENDING_REVIEW,
            CommentStatus.HIDDEN,
            CommentStatus.SPAM,
          ],
        },
      },
      orderBy: [{ spamScore: 'desc' }, { createdAt: 'desc' }],
      take: 200,
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

  async getStats() {
    const [pending, hidden, spam, published, removed, reported, autoRemovedToday, aiRemovedToday] =
      await Promise.all([
        this.prisma.comment.count({
          where: { status: CommentStatus.PENDING_REVIEW, isDeleted: false },
        }),
        this.prisma.comment.count({
          where: { status: CommentStatus.HIDDEN, isDeleted: false },
        }),
        this.prisma.comment.count({
          where: { status: CommentStatus.SPAM, isDeleted: false },
        }),
        this.prisma.comment.count({
          where: {
            status: { in: [CommentStatus.PUBLISHED, CommentStatus.APPROVED] },
            isDeleted: false,
          },
        }),
        this.prisma.comment.count({
          where: { status: CommentStatus.REMOVED },
        }),
        this.prisma.contentReport.count({ where: { status: 'OPEN', entityType: 'COMMENT' } }),
        this.prisma.comment.count({
          where: {
            status: CommentStatus.SPAM,
            createdAt: { gte: new Date(Date.now() - 86_400_000) },
          },
        }),
        this.prisma.auditLog.count({
          where: {
            action: 'comment.spam.ai_removed',
            createdAt: { gte: new Date(Date.now() - 86_400_000) },
          },
        }),
      ]);

    return {
      pending,
      hidden,
      spam,
      published,
      removed,
      reported,
      autoRemovedToday,
      aiRemovedToday,
    };
  }

  async getAuditLogs(limit = 50) {
    return this.prisma.auditLog.findMany({
      where: {
        entity: 'comment',
        action: { startsWith: 'comment.' },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  async moderateOne(
    id: number,
    action: ModerationAction,
    moderatorId: number,
    notes?: string,
  ) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found.`);
    }

    const data = this.actionToUpdate(action, moderatorId, notes);
    const updated = await this.prisma.comment.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, email: true, name: true } },
        device: { select: { id: true, name: true, slug: true } },
      },
    });

    await this.audit.log({
      userId: moderatorId,
      action: `comment.moderation.${action}`,
      entity: 'comment',
      entityId: String(id),
    });

    if (action === 'spam' && comment.userId) {
      await this.applyHighRiskRestriction(comment.userId, moderatorId);
    }

    return updated;
  }

  async moderateBulk(
    ids: number[],
    action: ModerationAction,
    moderatorId: number,
  ) {
    const results: Awaited<ReturnType<typeof this.moderateOne>>[] = [];
    for (const id of ids) {
      results.push(await this.moderateOne(id, action, moderatorId));
    }
    return { count: results.length, items: results };
  }

  private actionToUpdate(
    action: ModerationAction,
    moderatorId: number,
    notes?: string,
  ) {
    const moderatedAt = new Date();
    const base = {
      moderatedById: moderatorId,
      moderatedAt,
      spamReason: notes?.trim() || undefined,
    };

    switch (action) {
      case 'approve':
        return {
          ...base,
          status: CommentStatus.APPROVED,
          isDeleted: false,
        };
      case 'reject':
        return {
          ...base,
          status: CommentStatus.REMOVED,
          isDeleted: true,
        };
      case 'spam':
        return {
          ...base,
          status: CommentStatus.SPAM,
          isDeleted: true,
          spamScore: 100,
        };
      default:
        return base;
    }
  }

  private async applyHighRiskRestriction(userId: number, moderatorId: number) {
    const recentSpam = await this.prisma.comment.count({
      where: {
        userId,
        status: CommentStatus.SPAM,
        createdAt: { gte: new Date(Date.now() - 86_400_000) },
      },
    });

    if (recentSpam >= 3) {
      const until = new Date(Date.now() + 24 * 3_600_000);
      await this.prisma.user.update({
        where: { id: userId },
        data: { commentRestrictedUntil: until },
      });
      await this.audit.log({
        userId: moderatorId,
        action: 'comment.user.restricted',
        entity: 'user',
        entityId: String(userId),
      });
    }
  }
}

export const MODERATOR_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.EDITOR,
  UserRole.MODERATOR,
];
