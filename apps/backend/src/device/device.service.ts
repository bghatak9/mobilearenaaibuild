import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentEntityType, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import {
  catalogDeviceWhere,
  bulkUpcomingDeviceWhere,
  isImportedOnlyCatalog,
  skipSyntheticDeviceData,
} from '../common/catalog-mode';
import {
  isUpcomingByDates,
  upcomingLaunchTimestamp,
} from '../common/device-upcoming';
import { slugify } from '../common/slug';
import { ContentTranslationService } from '../content-translation/content-translation.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

const CACHE_PREFIX = 'devices:';
const CACHE_TTL = 120;

function catalogCacheScope() {
  return isImportedOnlyCatalog() ? 'imported' : 'all';
}

type IntelligenceRelation = { payload: Prisma.JsonValue } | null;

function flattenDeviceIntelligence<
  T extends { intelligence?: IntelligenceRelation },
>(device: T) {
  const { intelligence, ...rest } = device;
  return {
    ...rest,
    intelligence:
      intelligence?.payload &&
      typeof intelligence.payload === 'object' &&
      !Array.isArray(intelligence.payload)
        ? (intelligence.payload as Record<string, unknown>)
        : {},
  };
}

const affiliateOfferInclude = {
  where: { active: true },
  orderBy: [{ priority: 'desc' as const }, { price: 'asc' as const }],
};

const listInclude = {
  brand: true,
  category: true,
  manufacturer: true,
  images: { take: 1 },
  display: true,
  battery: true,
  chipset: true,
  cameras: true,
  countryAvailability: true,
  affiliateOffers: affiliateOfferInclude,
  priceHistory: { orderBy: { recordedAt: 'desc' }, take: 8 },
  intelligence: true,
} satisfies Prisma.DeviceInclude;

const detailInclude = {
  brand: true,
  category: true,
  manufacturer: true,
  display: true,
  battery: true,
  chipset: true,
  cameras: true,
  images: true,
  reviews: { orderBy: { publishedAt: 'desc' } },
  priceHistory: { orderBy: { recordedAt: 'asc' }, take: 24 },
  countryAvailability: { orderBy: { countryCode: 'asc' } },
  affiliateOffers: affiliateOfferInclude,
  intelligence: true,
} satisfies Prisma.DeviceInclude;

@Injectable()
export class DeviceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly translations: ContentTranslationService,
  ) {}

  async findAll(search?: string, locale?: string) {
    const cleanSearch = search?.trim();
    const loc = locale ?? 'en';
    const cacheKey = `${CACHE_PREFIX}list:${catalogCacheScope()}:${loc}:${cleanSearch || 'all'}`;

    return this.cache.wrap(cacheKey, CACHE_TTL, async () => {
      const [translationIds, brandTranslationIds] = cleanSearch
        ? await Promise.all([
            this.translations.searchEntityIds(
              ContentEntityType.DEVICE,
              cleanSearch,
              loc,
            ),
            this.translations.searchEntityIds(
              ContentEntityType.BRAND,
              cleanSearch,
              loc,
            ),
          ])
        : [[], []];

      const where = catalogDeviceWhere(
        cleanSearch
          ? {
              OR: [
                {
                  name: {
                    contains: cleanSearch,
                    mode: 'insensitive',
                  },
                },
                {
                  brand: {
                    is: {
                      name: {
                        contains: cleanSearch,
                        mode: 'insensitive',
                      },
                    },
                  },
                },
                ...(translationIds.length
                  ? [{ id: { in: translationIds } }]
                  : []),
                ...(brandTranslationIds.length
                  ? [{ brandId: { in: brandTranslationIds } }]
                  : []),
              ],
            }
          : undefined,
      );

      const rows = await this.prisma.device.findMany({
        where,
        include: listInclude,
      });

      if (!isImportedOnlyCatalog()) {
        await Promise.all(
          rows
            .filter(
              (d) =>
                !skipSyntheticDeviceData(d) &&
                d.price != null &&
                d.affiliateOffers.length === 0,
            )
            .map((d) =>
              this.ensureAffiliateSamples(d.id, d.name, d.slug, d.price),
            ),
        );
      }

      const withOffers =
        !isImportedOnlyCatalog() &&
        rows.some(
          (d) =>
            !skipSyntheticDeviceData(d) &&
            d.price != null &&
            d.affiliateOffers.length === 0,
        )
          ? await this.prisma.device.findMany({ where, include: listInclude })
          : rows;

      const enriched = withOffers.map((d) =>
        skipSyntheticDeviceData(d)
          ? flattenDeviceIntelligence(d)
          : this.enrichDeviceSpecs(d),
      );
      const localized = await this.translations.localizeMany(
        ContentEntityType.DEVICE,
        enriched,
        loc,
      );
      return this.withLocalizedRelations(localized, loc);
    });
  }

  async findBulkUpcoming(locale?: string) {
    const loc = locale ?? 'en';
    const cacheKey = `${CACHE_PREFIX}upcoming:${catalogCacheScope()}:${loc}`;

    return this.cache.wrap(cacheKey, CACHE_TTL, async () => {
      const rows = await this.prisma.device.findMany({
        where: bulkUpcomingDeviceWhere(),
        include: listInclude,
      });

      const upcoming = rows
        .filter((d) => isUpcomingByDates(d.announcedDate, d.releasedDate))
        .sort(
          (a, b) =>
            (upcomingLaunchTimestamp(a.announcedDate, a.releasedDate) ??
              Number.MAX_SAFE_INTEGER) -
            (upcomingLaunchTimestamp(b.announcedDate, b.releasedDate) ??
              Number.MAX_SAFE_INTEGER),
        );

      const enriched = upcoming.map((d) =>
        skipSyntheticDeviceData(d)
          ? flattenDeviceIntelligence(d)
          : this.enrichDeviceSpecs(d),
      );
      const localized = await this.translations.localizeMany(
        ContentEntityType.DEVICE,
        enriched,
        loc,
      );
      return this.withLocalizedRelations(localized, loc);
    });
  }

  /** Localize nested brand + category so cards don't mix EN brand with localized device name. */
  private async withLocalizedRelations<
    T extends {
      brand?: {
        id: number;
        name: string;
        slug: string;
        logo?: string | null;
      } | null;
      category?: { id: number; name: string; slug: string } | null;
    },
  >(devices: T[], locale: string): Promise<T[]> {
    if (devices.length === 0) return devices;

    const brandRows = Array.from(
      new Map(
        devices
          .map((d) => d.brand)
          .filter(Boolean)
          .map((b) => [b!.id, b!] as const),
      ).values(),
    );
    const categoryRows = Array.from(
      new Map(
        devices
          .map((d) => d.category)
          .filter(Boolean)
          .map((c) => [c!.id, c!] as const),
      ).values(),
    );

    const [brands, categories] = await Promise.all([
      brandRows.length
        ? this.translations.localizeMany(
            ContentEntityType.BRAND,
            brandRows,
            locale,
          )
        : Promise.resolve([]),
      categoryRows.length
        ? this.translations.localizeMany(
            ContentEntityType.CATEGORY,
            categoryRows,
            locale,
          )
        : Promise.resolve([]),
    ]);

    const brandById = new Map(brands.map((b) => [b.id, b]));
    const categoryById = new Map(categories.map((c) => [c.id, c]));

    return devices.map((d) => ({
      ...d,
      brand: d.brand ? (brandById.get(d.brand.id) ?? d.brand) : d.brand,
      category: d.category
        ? (categoryById.get(d.category.id) ?? d.category)
        : d.category,
    }));
  }

  private estimateRamGb(price: number | null): number {
    const p = price ?? 500;
    if (p >= 1100) return 12;
    if (p >= 700) return 8;
    if (p >= 400) return 6;
    return 4;
  }

  private estimateStorageGb(price: number | null): number {
    const p = price ?? 500;
    if (p >= 1100) return 256;
    if (p >= 700) return 128;
    if (p >= 400) return 64;
    return 32;
  }

  private enrichDeviceSpecs<
    T extends {
      price: number | null;
      ramGb: number | null;
      storageGb: number | null;
      intelligence?: IntelligenceRelation;
    },
  >(device: T) {
    return flattenDeviceIntelligence({
      ...device,
      ramGb: device.ramGb ?? this.estimateRamGb(device.price),
      storageGb: device.storageGb ?? this.estimateStorageGb(device.price),
    });
  }

  async findOne(id: number, locale?: string) {
    const loc = locale ?? 'en';
    return this.cache.wrap(
      `${CACHE_PREFIX}id:${catalogCacheScope()}:${loc}:${id}`,
      CACHE_TTL,
      async () => {
        const device = await this.prisma.device.findFirst({
          where: catalogDeviceWhere({ id }),
          include: detailInclude,
        });
        if (!device) {
          throw new NotFoundException(`Device with ID ${id} not found.`);
        }
        const enriched = skipSyntheticDeviceData(device)
          ? flattenDeviceIntelligence(device)
          : this.enrichDeviceSpecs(device);
        const localized = await this.translations.localizeOne(
          ContentEntityType.DEVICE,
          enriched,
          loc,
        );
        const [withRelations] = await this.withLocalizedRelations(
          [localized],
          loc,
        );
        return withRelations;
      },
    );
  }

  async findBySlug(slug: string, locale?: string) {
    const loc = locale ?? 'en';
    return this.cache.wrap(
      `${CACHE_PREFIX}slug:${catalogCacheScope()}:${loc}:${slug}`,
      CACHE_TTL,
      async () => {
        let device = await this.prisma.device.findFirst({
          where: catalogDeviceWhere({ slug }),
          include: detailInclude,
        });

        if (!device) {
          const translatedId =
            await this.translations.resolveEntityIdByLocalizedSlug(
              ContentEntityType.DEVICE,
              slug,
              loc,
            );
          if (translatedId) {
            device = await this.prisma.device.findFirst({
              where: catalogDeviceWhere({ id: translatedId }),
              include: detailInclude,
            });
          }
        }

        if (!device) {
          throw new NotFoundException(`Device "${slug}" not found.`);
        }
        if (!skipSyntheticDeviceData(device)) {
          await this.ensurePricingSamples(device.id, device.price);
          await this.ensureAffiliateSamples(
            device.id,
            device.name,
            device.slug,
            device.price,
          );
        }
        const fresh = await this.prisma.device.findFirstOrThrow({
          where: catalogDeviceWhere({ id: device.id }),
          include: detailInclude,
        });
        const enriched = skipSyntheticDeviceData(fresh)
          ? flattenDeviceIntelligence(fresh)
          : this.enrichDeviceSpecs(fresh);
        const localized = await this.translations.localizeOne(
          ContentEntityType.DEVICE,
          enriched,
          loc,
        );
        const [withRelations] = await this.withLocalizedRelations(
          [localized],
          loc,
        );
        const localeSlugs = await this.translations.localeSlugMap(
          ContentEntityType.DEVICE,
          fresh.id,
          fresh.slug,
        );
        return { ...withRelations, localeSlugs };
      },
    );
  }

  /** Seed illustrative price/availability rows when a device has none yet. */
  private async ensurePricingSamples(deviceId: number, price: number | null) {
    const historyCount = await this.prisma.devicePriceHistory.count({
      where: { deviceId },
    });
    if (historyCount === 0 && price != null) {
      const now = Date.now();
      const samples = [90, 60, 30, 0].map((daysAgo) => ({
        deviceId,
        price: Math.round(price * (1 + daysAgo * 0.002)),
        currency: 'USD',
        recordedAt: new Date(now - daysAgo * 86400000),
      }));
      await this.prisma.devicePriceHistory.createMany({ data: samples });
    }

    const availCount = await this.prisma.deviceCountryAvailability.count({
      where: { deviceId },
    });
    if (availCount === 0) {
      await this.prisma.deviceCountryAvailability.createMany({
        data: [
          {
            deviceId,
            countryCode: 'US',
            available: true,
            price,
            currency: 'USD',
          },
          {
            deviceId,
            countryCode: 'GB',
            available: true,
            price: price != null ? Math.round(price * 0.92) : null,
            currency: 'GBP',
          },
          {
            deviceId,
            countryCode: 'DE',
            available: true,
            price: price != null ? Math.round(price * 0.95) : null,
            currency: 'EUR',
          },
          {
            deviceId,
            countryCode: 'IN',
            available: true,
            price: price != null ? Math.round(price * 83) : null,
            currency: 'INR',
          },
          {
            deviceId,
            countryCode: 'JP',
            available: price != null,
            price: price != null ? Math.round(price * 148) : null,
            currency: 'JPY',
          },
        ],
      });
    }
  }

  /** Seed partner affiliate buy-link prices when a device has none yet. */
  private async ensureAffiliateSamples(
    deviceId: number,
    name: string,
    slug: string,
    price: number | null,
  ) {
    const offerCount = await this.prisma.deviceAffiliateOffer.count({
      where: { deviceId },
    });
    if (offerCount > 0 || price == null) return;

    const inRow = await this.prisma.deviceCountryAvailability.findFirst({
      where: { deviceId, countryCode: 'IN' },
    });
    const inPrice = inRow?.price ?? Math.round(price * 83);
    const query = encodeURIComponent(name);

    await this.prisma.deviceAffiliateOffer.createMany({
      data: [
        {
          deviceId,
          partner: 'Amazon',
          price: Math.round(price * 0.98),
          currency: 'USD',
          affiliateUrl: `https://www.amazon.com/s?k=${query}`,
          priority: 10,
        },
        {
          deviceId,
          partner: 'Best Buy',
          price,
          currency: 'USD',
          affiliateUrl: `https://www.bestbuy.com/site/searchpage.jsp?st=${query}`,
          priority: 5,
        },
        {
          deviceId,
          partner: 'Flipkart',
          price: inPrice,
          currency: 'INR',
          affiliateUrl: `https://www.flipkart.com/search?q=${query}`,
          priority: 10,
        },
        {
          deviceId,
          partner: 'Amazon India',
          price: Math.round(inPrice * 0.97),
          currency: 'INR',
          affiliateUrl: `https://www.amazon.in/s?k=${encodeURIComponent(slug)}`,
          priority: 8,
        },
      ],
    });
  }

  async create(data: CreateDeviceDto) {
    const device = await this.prisma.device.create({
      data: {
        ...data,
        slug: data.slug ?? slugify(data.name),
      },
      include: listInclude,
    });
    await this.cache.delByPrefix(CACHE_PREFIX);
    return device;
  }

  async update(id: number, data: UpdateDeviceDto) {
    const device = await this.prisma.device.update({
      where: { id },
      data,
      include: listInclude,
    });
    await this.cache.delByPrefix(CACHE_PREFIX);
    return device;
  }

  async remove(id: number) {
    const device = await this.prisma.device.delete({
      where: { id },
    });
    await this.cache.delByPrefix(CACHE_PREFIX);
    return device;
  }
}
