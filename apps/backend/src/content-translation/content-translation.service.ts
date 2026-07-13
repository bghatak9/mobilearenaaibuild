import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentEntityType, Prisma } from '@prisma/client';

import { CacheService } from '../cache/cache.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  DEFAULT_LOCALE,
  LocalizedContent,
  TranslatableContent,
  TranslationUpsertInput,
  mergeLocalizedContent,
  normalizeLocaleParam,
} from './content-locale';

@Injectable()
export class ContentTranslationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async findRows(
    entityType: ContentEntityType,
    entityIds: number[],
    locales: string[],
  ) {
    if (entityIds.length === 0) return [];
    return this.prisma.contentTranslation.findMany({
      where: {
        entityType,
        entityId: { in: entityIds },
        locale: { in: locales },
      },
    });
  }

  /**
   * Resolve a localized slug → parent entity id for the requested locale
   * (exact locale first, then any locale with that slug).
   */
  async resolveEntityIdByLocalizedSlug(
    entityType: ContentEntityType,
    slug: string,
    locale?: string | null,
  ): Promise<number | null> {
    const requested = normalizeLocaleParam(locale);
    const exact = await this.prisma.contentTranslation.findFirst({
      where: {
        entityType,
        slug,
        locale: {
          in: Array.from(
            new Set([requested, requested.split('-')[0] ?? requested]),
          ),
        },
      },
      select: { entityId: true },
    });
    if (exact) return exact.entityId;

    const any = await this.prisma.contentTranslation.findFirst({
      where: { entityType, slug },
      select: { entityId: true },
    });
    return any?.entityId ?? null;
  }

  async localizeOne<T extends TranslatableContent & { id: number }>(
    entityType: ContentEntityType,
    entity: T,
    locale?: string | null,
  ): Promise<LocalizedContent<T>> {
    const requested = normalizeLocaleParam(locale);
    const locales = Array.from(
      new Set([requested, DEFAULT_LOCALE, 'en-US', 'en-GB']),
    );
    const rows = await this.findRows(entityType, [entity.id], locales);
    const localeRow =
      rows.find((r) => r.locale.toLowerCase() === requested.toLowerCase()) ??
      rows.find((r) =>
        requested.toLowerCase().startsWith(r.locale.toLowerCase() + '-'),
      ) ??
      null;
    const enRow =
      rows.find((r) => r.locale.toLowerCase() === 'en') ??
      rows.find((r) => r.locale.toLowerCase().startsWith('en-')) ??
      null;

    return mergeLocalizedContent(entity, requested, localeRow, enRow);
  }

  async localizeMany<T extends TranslatableContent & { id: number }>(
    entityType: ContentEntityType,
    entities: T[],
    locale?: string | null,
  ): Promise<LocalizedContent<T>[]> {
    if (entities.length === 0) return [];
    const requested = normalizeLocaleParam(locale);
    const locales = Array.from(
      new Set([requested, DEFAULT_LOCALE, 'en-US', 'en-GB']),
    );
    const rows = await this.findRows(
      entityType,
      entities.map((e) => e.id),
      locales,
    );

    return entities.map((entity) => {
      const forEntity = rows.filter((r) => r.entityId === entity.id);
      const localeRow =
        forEntity.find(
          (r) => r.locale.toLowerCase() === requested.toLowerCase(),
        ) ?? null;
      const enRow =
        forEntity.find((r) => r.locale.toLowerCase() === 'en') ??
        forEntity.find((r) => r.locale.toLowerCase().startsWith('en-')) ??
        null;
      return mergeLocalizedContent(entity, requested, localeRow, enRow);
    });
  }

  /**
   * Find entity ids whose ContentTranslation fields match `query`.
   * Searches **all locales** so native spellings work from any UI locale
   * (e.g. سامسونج / স্যামসাং / 三星 find Samsung while browsing /en/).
   * `locale` is reserved for future ranking bias toward the active language.
   */
  async searchEntityIds(
    entityType: ContentEntityType,
    query: string,
    locale?: string | null,
  ): Promise<number[]> {
    void locale;
    const q = query.trim();
    if (!q) return [];

    const textMatch = {
      contains: q,
      mode: 'insensitive' as const,
    };

    const rows = await this.prisma.contentTranslation.findMany({
      where: {
        entityType,
        OR: [
          { title: textMatch },
          { summary: textMatch },
          { content: textMatch },
          { description: textMatch },
          { seoTitle: textMatch },
          { seoDescription: textMatch },
          { keywords: textMatch },
          { aliases: textMatch },
          { slug: textMatch },
          { shortName: textMatch },
          { headline: textMatch },
        ],
      },
      select: { entityId: true },
      distinct: ['entityId'],
      take: 250,
    });

    return rows.map((r) => r.entityId);
  }

  /**
   * Locale → slug map for hreflang / sitemap. Falls back to canonical EN slug
   * when a locale has no translated slug.
   */
  async localeSlugMap(
    entityType: ContentEntityType,
    entityId: number,
    canonicalSlug: string,
  ): Promise<Record<string, string>> {
    const rows = await this.prisma.contentTranslation.findMany({
      where: {
        entityType,
        entityId,
        slug: { not: null },
      },
      select: { locale: true, slug: true },
    });

    const map: Record<string, string> = { en: canonicalSlug };
    for (const row of rows) {
      if (row.slug) map[row.locale] = row.slug;
    }
    return map;
  }

  /** Invalidate content caches for an entity type (locale-scoped key prefixes). */
  async invalidateLocaleCaches(entityType: ContentEntityType, locale: string) {
    const loc = normalizeLocaleParam(locale);
    switch (entityType) {
      case ContentEntityType.NEWS:
        // Keys: news:list:{scope}:{locale}:… and news:slug:{scope}:{locale}:…
        await this.cache.delByPrefix(`news:list:imported:${loc}:`);
        await this.cache.delByPrefix(`news:list:all:${loc}:`);
        await this.cache.delByPrefix(`news:list:admin:${loc}:`);
        await this.cache.delByPrefix(`news:slug:imported:${loc}:`);
        await this.cache.delByPrefix(`news:slug:all:${loc}:`);
        await this.cache.delByPrefix(`news:slug:admin:${loc}:`);
        break;
      case ContentEntityType.REVIEW:
        // Keys: reviews:list:{locale}:{deviceId|all} and reviews:slug:{locale}:…
        await this.cache.delByPrefix(`reviews:list:${loc}:`);
        await this.cache.delByPrefix(`reviews:slug:${loc}:`);
        break;
      case ContentEntityType.DEVICE:
        await this.cache.delByPrefix(`devices:list:imported:${loc}:`);
        await this.cache.delByPrefix(`devices:list:all:${loc}:`);
        await this.cache.delByPrefix(`devices:slug:imported:${loc}:`);
        await this.cache.delByPrefix(`devices:slug:all:${loc}:`);
        await this.cache.delByPrefix(`devices:id:imported:${loc}:`);
        await this.cache.delByPrefix(`devices:id:all:${loc}:`);
        await this.cache.delByPrefix(`devices:upcoming:imported:${loc}`);
        await this.cache.delByPrefix(`devices:upcoming:all:${loc}`);
        break;
      case ContentEntityType.BRAND:
        await this.cache.delByPrefix(`brands:list:${loc}`);
        await this.cache.delByPrefix(`brands:slug:${loc}:`);
        await this.cache.delByPrefix(`brands:grouped:${loc}`);
        break;
      case ContentEntityType.CATEGORY:
        await this.cache.delByPrefix(`categories:list:${loc}`);
        await this.cache.delByPrefix(`brands:grouped:${loc}`);
        break;
      default:
        break;
    }
  }

  /**
   * Coverage report for CMS translation progress dashboards.
   * English is always 100% (canonical source).
   */
  async coverageReport(locales: string[]) {
    const [newsTotal, reviewTotal, deviceTotal, brandTotal, categoryTotal] =
      await Promise.all([
        this.prisma.news.count(),
        this.prisma.review.count(),
        this.prisma.device.count({ where: { deletedAt: null } }),
        this.prisma.brand.count(),
        this.prisma.category.count(),
      ]);

    const totals = {
      NEWS: newsTotal,
      REVIEW: reviewTotal,
      DEVICE: deviceTotal,
      BRAND: brandTotal,
      CATEGORY: categoryTotal,
    } as const;

    const rows = await this.prisma.contentTranslation.groupBy({
      by: ['entityType', 'locale'],
      where: {
        entityType: {
          in: [
            ContentEntityType.NEWS,
            ContentEntityType.REVIEW,
            ContentEntityType.DEVICE,
            ContentEntityType.BRAND,
            ContentEntityType.CATEGORY,
          ],
        },
        locale: { in: locales },
        OR: [
          { title: { not: null } },
          { content: { not: null } },
          { description: { not: null } },
          { summary: { not: null } },
          { seoTitle: { not: null } },
          { keywords: { not: null } },
        ],
      },
      _count: { _all: true },
    });

    return locales.map((locale) => {
      const byType = {
        NEWS: 0,
        REVIEW: 0,
        DEVICE: 0,
        BRAND: 0,
        CATEGORY: 0,
      };
      for (const row of rows) {
        if (row.locale.toLowerCase() !== locale.toLowerCase()) continue;
        if (row.entityType === ContentEntityType.NEWS) {
          byType.NEWS = row._count._all;
        } else if (row.entityType === ContentEntityType.REVIEW) {
          byType.REVIEW = row._count._all;
        } else if (row.entityType === ContentEntityType.DEVICE) {
          byType.DEVICE = row._count._all;
        } else if (row.entityType === ContentEntityType.BRAND) {
          byType.BRAND = row._count._all;
        } else if (row.entityType === ContentEntityType.CATEGORY) {
          byType.CATEGORY = row._count._all;
        }
      }

      const isEn =
        locale.toLowerCase() === 'en' || locale.toLowerCase().startsWith('en-');
      const newsDone = isEn ? totals.NEWS : byType.NEWS;
      const reviewDone = isEn ? totals.REVIEW : byType.REVIEW;
      const deviceDone = isEn ? totals.DEVICE : byType.DEVICE;
      const brandDone = isEn ? totals.BRAND : byType.BRAND;
      const categoryDone = isEn ? totals.CATEGORY : byType.CATEGORY;
      const done =
        newsDone + reviewDone + deviceDone + brandDone + categoryDone;
      const total =
        totals.NEWS +
        totals.REVIEW +
        totals.DEVICE +
        totals.BRAND +
        totals.CATEGORY;
      const pct = total === 0 ? 100 : Math.round((done / total) * 1000) / 10;

      return {
        locale,
        percent: isEn ? 100 : pct,
        news: { done: newsDone, total: totals.NEWS },
        reviews: { done: reviewDone, total: totals.REVIEW },
        devices: { done: deviceDone, total: totals.DEVICE },
        brands: { done: brandDone, total: totals.BRAND },
        categories: { done: categoryDone, total: totals.CATEGORY },
      };
    });
  }

  async upsert(
    entityType: ContentEntityType,
    entityId: number,
    locale: string,
    data: TranslationUpsertInput,
  ) {
    const normalized = normalizeLocaleParam(locale);
    const row = await this.prisma.contentTranslation.upsert({
      where: {
        entityType_entityId_locale: {
          entityType,
          entityId,
          locale: normalized,
        },
      },
      create: {
        entityType,
        entityId,
        locale: normalized,
        title: data.title ?? null,
        shortName: data.shortName ?? null,
        headline: data.headline ?? null,
        slug: data.slug ?? null,
        summary: data.summary ?? null,
        content: data.content ?? null,
        description: data.description ?? null,
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
        keywords: data.keywords ?? null,
        aliases: data.aliases ?? null,
        ...(data.status ? { status: data.status as never } : {}),
        source: data.source ?? null,
        pros: data.pros ?? Prisma.JsonNull,
        cons: data.cons ?? Prisma.JsonNull,
      },
      update: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.shortName !== undefined ? { shortName: data.shortName } : {}),
        ...(data.headline !== undefined ? { headline: data.headline } : {}),
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.summary !== undefined ? { summary: data.summary } : {}),
        ...(data.content !== undefined ? { content: data.content } : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
        ...(data.seoTitle !== undefined ? { seoTitle: data.seoTitle } : {}),
        ...(data.seoDescription !== undefined
          ? { seoDescription: data.seoDescription }
          : {}),
        ...(data.keywords !== undefined ? { keywords: data.keywords } : {}),
        ...(data.aliases !== undefined ? { aliases: data.aliases } : {}),
        ...(data.status !== undefined ? { status: data.status as never } : {}),
        ...(data.source !== undefined ? { source: data.source } : {}),
        ...(data.pros !== undefined
          ? { pros: data.pros ?? Prisma.JsonNull }
          : {}),
        ...(data.cons !== undefined
          ? { cons: data.cons ?? Prisma.JsonNull }
          : {}),
      },
    });

    await this.invalidateLocaleCaches(entityType, normalized);
    return row;
  }

  async listForEntity(entityType: ContentEntityType, entityId: number) {
    return this.prisma.contentTranslation.findMany({
      where: { entityType, entityId },
      orderBy: { locale: 'asc' },
    });
  }

  async remove(
    entityType: ContentEntityType,
    entityId: number,
    locale: string,
  ) {
    const normalized = normalizeLocaleParam(locale);
    try {
      const deleted = await this.prisma.contentTranslation.delete({
        where: {
          entityType_entityId_locale: {
            entityType,
            entityId,
            locale: normalized,
          },
        },
      });
      await this.invalidateLocaleCaches(entityType, normalized);
      return deleted;
    } catch {
      throw new NotFoundException(
        `Translation ${entityType}/${entityId}/${normalized} not found.`,
      );
    }
  }
}
