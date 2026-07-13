import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import {
  BADGE_CATALOG,
  badgeSlugsToAward,
  computeReputationPoints,
} from './badge-catalog';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileCollectionsService } from './profile-collections.service';
import { displayHeadline } from './profile-headline';
import { NotificationsService } from '../notifications/notifications.service';

const PROFILE_SELECT = {
  id: true,
  email: true,
  name: true,
  avatar: true,
  bio: true,
  headline: true,
  role: true,
  reputationPoints: true,
  notifyReplies: true,
  notifyPriceAlerts: true,
  notifyNewsletter: true,
  profilePublic: true,
  twoFactorEnabled: true,
  passwordHash: true,
  createdAt: true,
} as const;

@Injectable()
export class ProfileService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly collections: ProfileCollectionsService,
    private readonly notifications: NotificationsService,
  ) {}

  /** Prevent concurrent gamification sync races for the same user. */
  private readonly gamificationInflight = new Map<number, Promise<void>>();

  async onModuleInit() {
    await this.ensureBadgesSeeded();
  }

  async ensureBadgesSeeded() {
    for (const badge of BADGE_CATALOG) {
      await this.prisma.badge.upsert({
        where: { slug: badge.slug },
        create: badge,
        update: {
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          pointsRequired: badge.pointsRequired,
          category: badge.category,
        },
      });
    }
  }

  async getProfile(userId: number) {
    await this.syncGamification(userId);
    await this.notifications.ensureWelcomeNotification(userId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...PROFILE_SELECT,
        favoriteBrands: {
          orderBy: { createdAt: 'desc' },
          include: {
            brand: { select: { id: true, name: true, slug: true, logo: true } },
          },
        },
        badges: {
          orderBy: { earnedAt: 'desc' },
          include: {
            badge: {
              select: {
                id: true,
                slug: true,
                name: true,
                description: true,
                icon: true,
                category: true,
                pointsRequired: true,
              },
            },
          },
        },
        _count: {
          select: { comments: true, ratings: true, favoriteBrands: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const activity = await this.getActivity(userId, 10);
    const extraStats = await this.collections.countStats(userId);
    const allBadges = await this.prisma.badge.findMany({
      orderBy: { pointsRequired: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        icon: true,
        category: true,
        pointsRequired: true,
      },
    });

    const earnedSlugs = new Set(user.badges.map((ub) => ub.badge.slug));
    const earnedAtBySlug = new Map(
      user.badges.map((ub) => [ub.badge.slug, ub.earnedAt]),
    );

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      headline: displayHeadline(user.headline, user.reputationPoints),
      role: user.role,
      reputationPoints: user.reputationPoints,
      memberSince: user.createdAt,
      settings: {
        headline: user.headline,
        notifyReplies: user.notifyReplies,
        notifyPriceAlerts: user.notifyPriceAlerts,
        notifyNewsletter: user.notifyNewsletter,
        profilePublic: user.profilePublic,
        twoFactorEnabled: user.twoFactorEnabled,
        hasPassword: Boolean(user.passwordHash),
      },
      stats: {
        comments: user._count.comments,
        ratings: user._count.ratings,
        favoriteBrands: user._count.favoriteBrands,
        bookmarks: extraStats.bookmarks,
        favoriteDevices: extraStats.favoriteDevices,
        wishlist: extraStats.wishlist,
        notificationsUnread: extraStats.notificationsUnread,
        pollVotes: extraStats.pollVotes,
        savedComparisons: extraStats.savedComparisons,
      },
      favoriteBrands: user.favoriteBrands.map((f) => ({
        ...f.brand,
        favoritedAt: f.createdAt,
      })),
      badges: {
        earned: user.badges.map((ub) => ({
          ...ub.badge,
          earnedAt: ub.earnedAt,
        })),
        available: allBadges.map((b) => ({
          ...b,
          earned: earnedSlugs.has(b.slug),
          earnedAt: earnedAtBySlug.get(b.slug),
        })),
      },
      activity,
    };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const data: {
      name?: string | null;
      bio?: string | null;
      avatar?: string | null;
      headline?: string | null;
    } = {};

    if (dto.name !== undefined) data.name = dto.name.trim() || null;
    if (dto.bio !== undefined) data.bio = dto.bio.trim() || null;
    if (dto.headline !== undefined) {
      data.headline = dto.headline?.trim() || null;
    }
    if (dto.avatar !== undefined) {
      data.avatar = dto.avatar?.trim() || null;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    return this.getProfile(userId);
  }

  async addFavoriteBrand(userId: number, brandId: number) {
    const brand = await this.prisma.brand.findUnique({ where: { id: brandId } });
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${brandId} not found`);
    }

    try {
      await this.prisma.userFavoriteBrand.create({
        data: { userId, brandId },
      });
    } catch {
      throw new ConflictException('Brand is already in your favorites');
    }

    await this.syncGamification(userId);
    return this.getProfile(userId);
  }

  async removeFavoriteBrand(userId: number, brandId: number) {
    const existing = await this.prisma.userFavoriteBrand.findUnique({
      where: { userId_brandId: { userId, brandId } },
    });
    if (!existing) {
      throw new NotFoundException('Favorite brand not found');
    }

    await this.prisma.userFavoriteBrand.delete({
      where: { userId_brandId: { userId, brandId } },
    });

    await this.syncGamification(userId);
    return this.getProfile(userId);
  }

  async getActivity(userId: number, limit = 20) {
    const [comments, ratings] = await Promise.all([
      this.prisma.comment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          device: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.rating.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          device: { select: { id: true, name: true, slug: true } },
        },
      }),
    ]);

    const items = [
      ...comments.map((c) => ({
        type: 'comment' as const,
        id: c.id,
        createdAt: c.createdAt,
        device: c.device,
        body: c.body,
      })),
      ...ratings.map((r) => ({
        type: 'rating' as const,
        id: r.id,
        createdAt: r.createdAt,
        device: r.device,
        score: r.score,
      })),
    ];

    items.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    return items.slice(0, limit);
  }

  private async syncGamification(userId: number) {
    const inflight = this.gamificationInflight.get(userId);
    if (inflight) {
      await inflight;
      return;
    }

    const job = this.runSyncGamification(userId).finally(() => {
      this.gamificationInflight.delete(userId);
    });
    this.gamificationInflight.set(userId, job);
    await job;
  }

  private async runSyncGamification(userId: number) {
    const [commentCount, ratingCount, favoriteBrandCount] = await Promise.all([
      this.prisma.comment.count({ where: { userId } }),
      this.prisma.rating.count({ where: { userId } }),
      this.prisma.userFavoriteBrand.count({ where: { userId } }),
    ]);

    const reputationPoints = computeReputationPoints({
      commentCount,
      ratingCount,
      favoriteBrandCount,
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { reputationPoints },
    });

    const slugs = badgeSlugsToAward({
      commentCount,
      ratingCount,
      favoriteBrandCount,
      reputationPoints,
    });

    const badges = await this.prisma.badge.findMany({
      where: { slug: { in: slugs } },
      select: { id: true, slug: true },
    });

    if (badges.length > 0) {
      await this.prisma.userBadge.createMany({
        data: badges.map((badge) => ({ userId, badgeId: badge.id })),
        skipDuplicates: true,
      });
    }
  }
}
