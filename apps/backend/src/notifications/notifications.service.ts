import { Injectable } from '@nestjs/common';
import { PostStatus } from '@prisma/client';

import { catalogNewsWhere } from '../common/catalog-mode';
import { mailCopy } from '../i18n/mail-copy';
import { PrismaService } from '../prisma/prisma.service';

export type PublicNotificationDto = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  createdAt: string;
};

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicNotifications(
    limit = 24,
    locale?: string,
  ): Promise<PublicNotificationDto[]> {
    const copy = mailCopy(locale);
    const announcements = [
      {
        id: 'site-welcome',
        type: 'system',
        title: copy.welcomeTitle,
        body: copy.welcomeBody,
        link: '/phones',
      },
      {
        id: 'site-compare',
        type: 'update',
        title: copy.compareTitle,
        body: copy.compareBody,
        link: '/compare',
      },
      {
        id: 'site-finder',
        type: 'update',
        title: copy.finderTitle,
        body: copy.finderBody,
        link: '/phone-finder',
      },
      {
        id: 'site-community',
        type: 'update',
        title: copy.communityTitle,
        body: copy.communityBody,
        link: '/community',
      },
    ];

    const staticItems: PublicNotificationDto[] = announcements.map(
      (item, index) => ({
        ...item,
        createdAt: new Date(
          Date.now() - (announcements.length - index) * 86_400_000,
        ).toISOString(),
      }),
    );

    const articles = await this.prisma.news.findMany({
      where: {
        ...catalogNewsWhere(),
        status: PostStatus.PUBLISHED,
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: Math.max(0, limit - staticItems.length),
      select: {
        id: true,
        title: true,
        excerpt: true,
        slug: true,
        featured: true,
        publishedAt: true,
        createdAt: true,
      },
    });

    const newsItems: PublicNotificationDto[] = articles.map((article) => ({
      id: `news-${article.id}`,
      type: article.featured ? 'featured' : 'news',
      title: article.title,
      body: article.excerpt?.trim() || copy.welcomeBody,
      link: `/news/${article.slug}`,
      createdAt: (article.publishedAt ?? article.createdAt).toISOString(),
    }));

    return [...staticItems, ...newsItems]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, limit);
  }

  async ensureWelcomeNotification(userId: number, locale?: string) {
    const copy = mailCopy(locale);
    await this.prisma.$transaction(async (tx) => {
      await tx.userNotification.updateMany({
        where: {
          userId,
          type: 'system',
          title: copy.welcomeTitle,
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
          title: copy.welcomeTitle,
          body: copy.welcomeBody,
          link: '/phones',
        },
      });
    });
  }
}
