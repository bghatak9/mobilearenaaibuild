import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ContentEntityType } from '@prisma/client';
import { MeiliSearch, type Index } from 'meilisearch';

import { PrismaService } from '../prisma/prisma.service';

const DEVICE_INDEX = 'devices';
const BRAND_INDEX = 'brands';
const NEWS_INDEX = 'news';

export type MultilingualSearchHit = {
  id: number;
  entityType: 'DEVICE' | 'BRAND' | 'NEWS';
  slug: string;
  title: string;
  locale: string;
};

/**
 * Optional Meilisearch integration.
 * Disabled when MEILI_HOST is unset — Prisma search remains the fallback.
 */
@Injectable()
export class SearchIndexService implements OnModuleInit {
  private readonly logger = new Logger(SearchIndexService.name);
  private client: MeiliSearch | null = null;
  private enabled = false;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const host = process.env.MEILI_HOST?.trim();
    if (!host) {
      this.logger.log('Meilisearch disabled (MEILI_HOST not set)');
      return;
    }

    try {
      this.client = new MeiliSearch({
        host,
        apiKey: process.env.MEILI_MASTER_KEY || process.env.MEILI_API_KEY,
      });
      await this.client.health();
      this.enabled = true;
      await this.ensureIndexes();
      this.logger.log(`Meilisearch connected at ${host}`);
    } catch (error) {
      this.logger.warn(
        `Meilisearch unavailable — using Prisma search (${error instanceof Error ? error.message : error})`,
      );
      this.client = null;
      this.enabled = false;
    }
  }

  isEnabled() {
    return this.enabled;
  }

  private async ensureIndexes() {
    if (!this.client) return;
    for (const uid of [DEVICE_INDEX, BRAND_INDEX, NEWS_INDEX]) {
      try {
        await this.client.createIndex(uid, { primaryKey: 'id' });
      } catch {
        /* exists */
      }
      const index = this.client.index(uid);
      await index.updateSearchableAttributes([
        'title',
        'titles',
        'aliases',
        'keywords',
        'summary',
        'slug',
        'slugs',
      ]);
      await index.updateFilterableAttributes([
        'locale',
        'brandId',
        'entityType',
      ]);
    }
  }

  /** Upsert one device document with all locale titles/aliases flattened for cross-lingual search. */
  async upsertDevice(deviceId: number) {
    if (!this.client || !this.enabled) return;

    const device = await this.prisma.device.findFirst({
      where: { id: deviceId, deletedAt: null },
      include: { brand: true },
    });
    if (!device) return;

    const translations = await this.prisma.contentTranslation.findMany({
      where: { entityType: ContentEntityType.DEVICE, entityId: deviceId },
    });

    const titles = [
      device.name,
      ...translations.map((t) => t.title).filter(Boolean),
    ];
    const aliases = translations
      .flatMap(
        (t) => [t.aliases, t.keywords, t.title].filter(Boolean) as string[],
      )
      .join(' ');
    const slugs = [
      device.slug,
      ...translations.map((t) => t.slug).filter(Boolean),
    ];

    const index = this.client.index(DEVICE_INDEX);
    await index.addDocuments([
      {
        id: device.id,
        entityType: 'DEVICE',
        slug: device.slug,
        title: device.name,
        titles,
        aliases,
        keywords: aliases,
        summary: device.description?.slice(0, 280) ?? '',
        slugs,
        brandId: device.brandId,
        brandName: device.brand?.name ?? '',
      },
    ]);
  }

  async upsertBrand(brandId: number) {
    if (!this.client || !this.enabled) return;

    const brand = await this.prisma.brand.findUnique({
      where: { id: brandId },
    });
    if (!brand) return;

    const translations = await this.prisma.contentTranslation.findMany({
      where: { entityType: ContentEntityType.BRAND, entityId: brandId },
    });

    const titles = [
      brand.name,
      ...translations.map((t) => t.title).filter(Boolean),
    ];
    const aliases = translations
      .flatMap(
        (t) => [t.aliases, t.keywords, t.title].filter(Boolean) as string[],
      )
      .join(' ');

    await this.client.index(BRAND_INDEX).addDocuments([
      {
        id: brand.id,
        entityType: 'BRAND',
        slug: brand.slug,
        title: brand.name,
        titles,
        aliases,
        keywords: aliases,
        summary: '',
        slugs: [brand.slug, ...translations.map((t) => t.slug).filter(Boolean)],
      },
    ]);
  }

  async searchDevices(query: string, locale?: string, limit = 40) {
    if (!this.client || !this.enabled || !query.trim()) return null;

    const index: Index = this.client.index(DEVICE_INDEX);
    const result = await index.search(query.trim(), {
      limit,
      // Titles from all locales are in `titles`/`aliases` — no locale filter needed for recall.
      attributesToRetrieve: ['id', 'slug', 'title', 'brandName'],
    });

    return result.hits.map((hit) => ({
      id: Number((hit as { id: number }).id),
      slug: String((hit as { slug: string }).slug),
      title: String((hit as { title: string }).title),
      locale: locale ?? 'en',
      entityType: 'DEVICE' as const,
    }));
  }

  /** Full reindex of brands + devices (admin / startup job). */
  async reindexCatalog() {
    if (!this.client || !this.enabled) {
      return { ok: false, reason: 'meilisearch_disabled' };
    }

    const brands = await this.prisma.brand.findMany({ select: { id: true } });
    for (const b of brands) {
      await this.upsertBrand(b.id);
    }

    const devices = await this.prisma.device.findMany({
      where: { deletedAt: null },
      select: { id: true },
      take: 5000,
    });
    for (const d of devices) {
      await this.upsertDevice(d.id);
    }

    return { ok: true, brands: brands.length, devices: devices.length };
  }
}
