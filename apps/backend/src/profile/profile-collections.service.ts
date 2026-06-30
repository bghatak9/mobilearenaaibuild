import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  BookmarkEntityType,
  UserRole,
} from '@prisma/client';

import {
  assertPasswordMeetsPolicy,
} from '../auth/password-policy';
import {
  hashPassword,
  verifyPassword,
} from '../auth/password-crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto } from './dto/bookmark.dto';
import { UpsertWishlistDto } from './dto/wishlist.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

export const REPLY_ALERT_NOTIFICATION_TYPES = [
  'reply',
  'comment_reply',
  'price_alert',
  'alert',
] as const;

export type NotificationScope = 'all' | 'replies';

const DEVICE_SELECT = {
  id: true,
  name: true,
  slug: true,
  price: true,
  rating: true,
  brand: { select: { id: true, name: true, slug: true, logo: true } },
  images: { take: 1, select: { url: true, thumbnail: true } },
} as const;

@Injectable()
export class ProfileCollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getComments(userId: number, limit = 50) {
    return this.prisma.comment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        device: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async getRatings(userId: number, limit = 50) {
    return this.prisma.rating.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        device: {
          select: {
            id: true,
            name: true,
            slug: true,
            brand: { select: { name: true } },
          },
        },
      },
    });
  }

  async getBookmarks(userId: number) {
    return this.prisma.userBookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addBookmark(userId: number, dto: CreateBookmarkDto) {
    const meta = await this.resolveBookmarkMeta(dto.entityType, dto.entityId);
    try {
      return await this.prisma.userBookmark.create({
        data: {
          userId,
          entityType: dto.entityType,
          entityId: dto.entityId,
          title: dto.title?.trim() || meta.title,
          slug: dto.slug?.trim() || meta.slug,
        },
      });
    } catch {
      throw new ConflictException('Already bookmarked');
    }
  }

  async removeBookmark(
    userId: number,
    entityType: BookmarkEntityType,
    entityId: number,
  ) {
    const row = await this.prisma.userBookmark.findUnique({
      where: {
        userId_entityType_entityId: { userId, entityType, entityId },
      },
    });
    if (!row) throw new NotFoundException('Bookmark not found');
    await this.prisma.userBookmark.delete({ where: { id: row.id } });
    return { ok: true };
  }

  async getFavoriteDevices(userId: number) {
    const rows = await this.prisma.userFavoriteDevice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { device: { select: DEVICE_SELECT } },
    });
    return rows.map((r) => ({
      ...r.device,
      favoritedAt: r.createdAt,
    }));
  }

  async addFavoriteDevice(userId: number, deviceId: number) {
    const device = await this.prisma.device.findFirst({
      where: { id: deviceId, deletedAt: null },
    });
    if (!device) throw new NotFoundException('Device not found');
    try {
      await this.prisma.userFavoriteDevice.create({
        data: { userId, deviceId },
      });
    } catch {
      throw new ConflictException('Device already in favorites');
    }
    return this.getFavoriteDevices(userId);
  }

  async removeFavoriteDevice(userId: number, deviceId: number) {
    const row = await this.prisma.userFavoriteDevice.findUnique({
      where: { userId_deviceId: { userId, deviceId } },
    });
    if (!row) throw new NotFoundException('Favorite not found');
    await this.prisma.userFavoriteDevice.delete({ where: { id: row.id } });
    return this.getFavoriteDevices(userId);
  }

  async getWishlist(userId: number) {
    return this.prisma.userWishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { device: { select: DEVICE_SELECT } },
    });
  }

  async addWishlistItem(
    userId: number,
    deviceId: number,
    dto: UpsertWishlistDto,
  ) {
    const device = await this.prisma.device.findFirst({
      where: { id: deviceId, deletedAt: null },
    });
    if (!device) throw new NotFoundException('Device not found');

    return this.prisma.userWishlistItem.upsert({
      where: { userId_deviceId: { userId, deviceId } },
      create: {
        userId,
        deviceId,
        targetPrice: dto.targetPrice ?? null,
        alertEnabled: dto.alertEnabled ?? true,
      },
      update: {
        ...(dto.targetPrice !== undefined
          ? { targetPrice: dto.targetPrice }
          : {}),
        ...(dto.alertEnabled !== undefined
          ? { alertEnabled: dto.alertEnabled }
          : {}),
      },
      include: { device: { select: DEVICE_SELECT } },
    });
  }

  async updateWishlistItem(
    userId: number,
    deviceId: number,
    dto: UpsertWishlistDto,
  ) {
    const row = await this.prisma.userWishlistItem.findUnique({
      where: { userId_deviceId: { userId, deviceId } },
    });
    if (!row) throw new NotFoundException('Wishlist item not found');
    return this.prisma.userWishlistItem.update({
      where: { id: row.id },
      data: {
        ...(dto.targetPrice !== undefined
          ? { targetPrice: dto.targetPrice }
          : {}),
        ...(dto.alertEnabled !== undefined
          ? { alertEnabled: dto.alertEnabled }
          : {}),
      },
      include: { device: { select: DEVICE_SELECT } },
    });
  }

  async removeWishlistItem(userId: number, deviceId: number) {
    const row = await this.prisma.userWishlistItem.findUnique({
      where: { userId_deviceId: { userId, deviceId } },
    });
    if (!row) throw new NotFoundException('Wishlist item not found');
    await this.prisma.userWishlistItem.delete({ where: { id: row.id } });
    return { ok: true };
  }

  async getNotifications(
    userId: number,
    limit = 50,
    scope: NotificationScope = 'all',
  ) {
    return this.prisma.userNotification.findMany({
      where: {
        userId,
        ...(scope === 'replies'
          ? { type: { in: [...REPLY_ALERT_NOTIFICATION_TYPES] } }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async markNotificationRead(userId: number, id: number) {
    const row = await this.prisma.userNotification.findFirst({
      where: { id, userId },
    });
    if (!row) throw new NotFoundException('Notification not found');
    return this.prisma.userNotification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllNotificationsRead(
    userId: number,
    scope: NotificationScope = 'all',
  ) {
    await this.prisma.userNotification.updateMany({
      where: {
        userId,
        read: false,
        ...(scope === 'replies'
          ? { type: { in: [...REPLY_ALERT_NOTIFICATION_TYPES] } }
          : {}),
      },
      data: { read: true },
    });
    return { ok: true };
  }

  async deleteNotification(userId: number, id: number) {
    const row = await this.prisma.userNotification.findFirst({
      where: { id, userId },
    });
    if (!row) throw new NotFoundException('Notification not found');
    await this.prisma.userNotification.delete({ where: { id } });
    return { ok: true };
  }

  async clearAllNotifications(userId: number) {
    const result = await this.prisma.userNotification.deleteMany({
      where: { userId },
    });
    return { ok: true, cleared: result.count };
  }

  async getPollVotes(userId: number) {
    return this.prisma.userPollVote.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateSettings(userId: number, dto: UpdateSettingsDto) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.headline !== undefined
          ? { headline: dto.headline?.trim() || null }
          : {}),
        ...(dto.notifyReplies !== undefined
          ? { notifyReplies: dto.notifyReplies }
          : {}),
        ...(dto.notifyPriceAlerts !== undefined
          ? { notifyPriceAlerts: dto.notifyPriceAlerts }
          : {}),
        ...(dto.notifyNewsletter !== undefined
          ? { notifyNewsletter: dto.notifyNewsletter }
          : {}),
        ...(dto.profilePublic !== undefined
          ? { profilePublic: dto.profilePublic }
          : {}),
      },
    });
    return { ok: true };
  }

  async setTwoFactor(userId: number, enabled: boolean, currentPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true, role: true, twoFactorEnabled: true },
    });
    if (!user?.passwordHash) {
      throw new BadRequestException(
        'Set a password before enabling two-factor authentication.',
      );
    }
    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: enabled },
    });
    return { ok: true, twoFactorEnabled: enabled };
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true, role: true },
    });
    if (!user?.passwordHash) {
      throw new BadRequestException(
        'This account uses Google Sign-In. Set a password via forgot-password first.',
      );
    }
    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    assertPasswordMeetsPolicy(newPassword, user.role ?? UserRole.USER);
    const passwordHash = await hashPassword(newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return { ok: true };
  }

  async ensureWelcomeNotification(userId: number) {
    await this.prisma.$transaction(async (tx) => {
      await tx.userNotification.updateMany({
        where: {
          userId,
          type: 'system',
          title: 'Welcome to MobileArena',
          link: '/profile',
        },
        data: { link: '/phones' },
      });

      const count = await tx.userNotification.count({ where: { userId } });
      if (count > 0) return;
      await tx.userNotification.create({
        data: {
          userId,
          type: 'system',
          title: 'Welcome to MobileArena',
          body: 'Your profile is ready. Explore phones, save bookmarks, and earn reputation badges.',
          link: '/phones',
        },
      });
    });
  }

  async countStats(userId: number) {
    const [
      bookmarks,
      favoriteDevices,
      wishlist,
      notificationsUnread,
      pollVotes,
      savedComparisons,
    ] = await Promise.all([
      this.prisma.userBookmark.count({ where: { userId } }),
      this.prisma.userFavoriteDevice.count({ where: { userId } }),
      this.prisma.userWishlistItem.count({ where: { userId } }),
      this.prisma.userNotification.count({
        where: { userId, read: false },
      }),
      this.prisma.userPollVote.count({ where: { userId } }),
      this.prisma.userSavedComparison.count({ where: { userId } }),
    ]);
    return {
      bookmarks,
      favoriteDevices,
      wishlist,
      notificationsUnread,
      pollVotes,
      savedComparisons,
    };
  }

  async getSavedComparisons(userId: number) {
    return this.prisma.userSavedComparison.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async saveComparison(
    userId: number,
    deviceSlugs: string[],
    name?: string,
  ) {
    const sorted = [...deviceSlugs].sort();
    const compareSlug = sorted.join('-vs-');
    const existing = await this.prisma.userSavedComparison.findUnique({
      where: { userId_compareSlug: { userId, compareSlug } },
    });
    if (existing) {
      return this.prisma.userSavedComparison.update({
        where: { id: existing.id },
        data: { name: name ?? existing.name, deviceSlugs: sorted },
      });
    }
    return this.prisma.userSavedComparison.create({
      data: {
        userId,
        compareSlug,
        deviceSlugs: sorted,
        name: name ?? null,
      },
    });
  }

  async deleteSavedComparison(userId: number, id: number) {
    const row = await this.prisma.userSavedComparison.findFirst({
      where: { id, userId },
    });
    if (!row) throw new NotFoundException('Saved comparison not found');
    await this.prisma.userSavedComparison.delete({ where: { id } });
    return { ok: true };
  }

  async getSearchHistory(userId: number, limit = 20) {
    const rows = await this.prisma.userSearchHistory.findMany({
      where: { userId },
      orderBy: { searchedAt: 'desc' },
      take: limit,
    });
    return rows.map((row) => ({
      id: String(row.id),
      query: row.query,
      searchedAt: row.searchedAt.toISOString(),
    }));
  }

  async addSearchHistory(userId: number, query: string) {
    const trimmed = query.trim();
    if (!trimmed) return [];

    await this.prisma.userSearchHistory.deleteMany({
      where: { userId, query: { equals: trimmed, mode: 'insensitive' } },
    });

    await this.prisma.userSearchHistory.create({
      data: { userId, query: trimmed },
    });

    const overflow = await this.prisma.userSearchHistory.findMany({
      where: { userId },
      orderBy: { searchedAt: 'desc' },
      skip: 20,
      select: { id: true },
    });
    if (overflow.length > 0) {
      await this.prisma.userSearchHistory.deleteMany({
        where: { id: { in: overflow.map((r) => r.id) } },
      });
    }

    return this.getSearchHistory(userId);
  }

  async removeSearchHistory(userId: number, id: number) {
    await this.prisma.userSearchHistory.deleteMany({
      where: { id, userId },
    });
    return this.getSearchHistory(userId);
  }

  async clearSearchHistory(userId: number) {
    await this.prisma.userSearchHistory.deleteMany({ where: { userId } });
    return [];
  }

  private async resolveBookmarkMeta(
    entityType: BookmarkEntityType,
    entityId: number,
  ): Promise<{ title: string; slug: string | null }> {
    switch (entityType) {
      case BookmarkEntityType.DEVICE: {
        const d = await this.prisma.device.findFirst({
          where: { id: entityId, deletedAt: null },
        });
        if (!d) throw new NotFoundException('Device not found');
        return { title: d.name, slug: d.slug };
      }
      case BookmarkEntityType.NEWS: {
        const n = await this.prisma.news.findUnique({
          where: { id: entityId },
        });
        if (!n) throw new NotFoundException('Article not found');
        return { title: n.title, slug: n.slug };
      }
      case BookmarkEntityType.REVIEW: {
        const r = await this.prisma.review.findUnique({
          where: { id: entityId },
        });
        if (!r) throw new NotFoundException('Review not found');
        return { title: r.title, slug: r.slug };
      }
      default:
        throw new BadRequestException('Invalid bookmark type');
    }
  }
}
