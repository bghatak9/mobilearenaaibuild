import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ContentEntityType, Prisma } from '@prisma/client';

import { catalogDeviceWhere } from '../common/catalog-mode';
import { CacheService } from '../cache/cache.service';
import { ContentTranslationService } from '../content-translation/content-translation.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

const CACHE_TTL = 60;

@Injectable()
export class BrandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly translations: ContentTranslationService,
    private readonly cache: CacheService,
  ) {}

  async create(createBrandDto: CreateBrandDto) {
    try {
      return await this.prisma.brand.create({
        data: createBrandDto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Brand already exists.');
      }
      throw error;
    }
  }

  async findAll(locale?: string) {
    const loc = locale ?? 'en';
    return this.cache.wrap(`brands:list:${loc}`, CACHE_TTL, async () => {
      const rows = await this.prisma.brand.findMany({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
      });
      return this.translations.localizeMany(ContentEntityType.BRAND, rows, loc);
    });
  }

  async findAllGrouped(locale?: string) {
    const loc = locale ?? 'en';
    return this.cache.wrap(`brands:grouped:${loc}`, CACHE_TTL, async () => {
      const [allBrands, devices, importedBrandItems] = await Promise.all([
        this.prisma.brand.findMany({
          where: { deletedAt: null },
          select: { id: true, name: true, slug: true, logo: true },
        }),
        this.prisma.device.findMany({
          where: catalogDeviceWhere(),
          select: {
            brand: { select: { id: true, name: true, slug: true, logo: true } },
            category: { select: { id: true, name: true, slug: true } },
          },
        }),
        this.prisma.importBatchItem.findMany({
          where: {
            entityType: 'brand',
            brandId: { not: null },
            deletedAt: null,
            batch: {
              deletedAt: null,
              purgedAt: null,
              kind: 'brands',
            },
            brand: { deletedAt: null },
          },
          select: { brandId: true },
        }),
      ]);

      const localizedBrands = await this.translations.localizeMany(
        ContentEntityType.BRAND,
        allBrands,
        loc,
      );
      const byId = new Map(localizedBrands.map((b) => [b.id, b]));

      const categoryRows = Array.from(
        new Map(
          devices
            .map((d) => d.category)
            .filter(Boolean)
            .map((c) => [c!.id, c!] as const),
        ).values(),
      );
      const localizedCategories = await this.translations.localizeMany(
        ContentEntityType.CATEGORY,
        categoryRows,
        loc,
      );
      const categoryById = new Map(localizedCategories.map((c) => [c.id, c]));

      const groups = new Map<
        string,
        {
          category: { id: number; name: string; slug: string };
          brands: Map<
            number,
            { id: number; name: string; slug: string; logo: string | null }
          >;
        }
      >();
      const brandsWithDevices = new Set<number>();

      for (const device of devices) {
        const { brand, category } = device;
        if (!brand || !category) continue;

        brandsWithDevices.add(brand.id);
        const localized = byId.get(brand.id) ?? brand;
        const localizedCategory = categoryById.get(category.id) ?? category;
        const key = localizedCategory.slug;
        if (!groups.has(key)) {
          groups.set(key, {
            category: {
              id: localizedCategory.id,
              name: localizedCategory.name,
              slug: localizedCategory.slug,
            },
            brands: new Map(),
          });
        }
        groups.get(key)!.brands.set(brand.id, {
          id: localized.id,
          name: localized.name,
          slug: localized.slug,
          logo: localized.logo ?? null,
        });
      }

      const importedBrandIds = new Set(
        importedBrandItems
          .map((item) => item.brandId)
          .filter((id): id is number => id != null),
      );

      const orphanBrands = localizedBrands.filter(
        (b) => !brandsWithDevices.has(b.id) && importedBrandIds.has(b.id),
      );
      if (orphanBrands.length > 0) {
        groups.set('uploaded-brands', {
          category: { id: 0, name: 'Brands', slug: 'brands' },
          brands: new Map(
            orphanBrands.map((b) => [
              b.id,
              {
                id: b.id,
                name: b.name,
                slug: b.slug,
                logo: b.logo ?? null,
              },
            ]),
          ),
        });
      }

      return Array.from(groups.values())
        .map((group) => ({
          category: group.category,
          brands: Array.from(group.brands.values()).sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        }))
        .filter((group) => group.brands.length > 0)
        .sort((a, b) => a.category.name.localeCompare(b.category.name));
    });
  }

  async findBySlug(slug: string, locale?: string) {
    const loc = locale ?? 'en';
    return this.cache.wrap(
      `brands:slug:${loc}:${slug}`,
      CACHE_TTL,
      async () => {
        let brand = await this.prisma.brand.findFirst({
          where: { slug, deletedAt: null },
        });

        if (!brand) {
          const translatedId =
            await this.translations.resolveEntityIdByLocalizedSlug(
              ContentEntityType.BRAND,
              slug,
              loc,
            );
          if (translatedId) {
            brand = await this.prisma.brand.findFirst({
              where: { id: translatedId, deletedAt: null },
            });
          }
        }

        if (!brand) {
          throw new NotFoundException(`Brand "${slug}" not found.`);
        }

        const localized = await this.translations.localizeOne(
          ContentEntityType.BRAND,
          brand,
          loc,
        );
        const localeSlugs = await this.translations.localeSlugMap(
          ContentEntityType.BRAND,
          brand.id,
          brand.slug,
        );

        const devices = await this.prisma.device.findMany({
          where: catalogDeviceWhere({ brandId: brand.id }),
          orderBy: { name: 'asc' },
          include: {
            brand: { select: { id: true, name: true, slug: true, logo: true } },
            images: { take: 1 },
          },
        });

        const localizedDevices = await this.translations.localizeMany(
          ContentEntityType.DEVICE,
          devices,
          loc,
        );

        return {
          ...localized,
          localeSlugs,
          devices: localizedDevices,
        };
      },
    );
  }

  async findOne(id: number, locale?: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found.`);
    }

    return this.translations.localizeOne(
      ContentEntityType.BRAND,
      brand,
      locale,
    );
  }

  async update(id: number, updateBrandDto: UpdateBrandDto) {
    await this.findOne(id);

    try {
      return await this.prisma.brand.update({
        where: { id },
        data: updateBrandDto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Brand already exists.');
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.brand.delete({
      where: { id },
    });
  }
}
