import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentEntityType, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { slugify } from '../common/slug';
import { ContentTranslationService } from '../content-translation/content-translation.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

const CACHE_PREFIX = 'reviews:';
const CACHE_TTL = 60;

@Injectable()
export class ReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly translations: ContentTranslationService,
  ) {}

  async findAll(deviceId?: number, locale?: string) {
    const loc = locale ?? 'en';
    return this.cache.wrap(
      `${CACHE_PREFIX}list:${loc}:${deviceId ?? 'all'}`,
      CACHE_TTL,
      async () => {
        const rows = await this.prisma.review.findMany({
          where: deviceId ? { deviceId } : {},
          orderBy: { publishedAt: 'desc' },
          include: {
            device: { select: { id: true, name: true, slug: true } },
          },
        });
        return this.translations.localizeMany(
          ContentEntityType.REVIEW,
          rows,
          loc,
        );
      },
    );
  }

  async findBySlug(slug: string, locale?: string) {
    const loc = locale ?? 'en';
    return this.cache.wrap(
      `${CACHE_PREFIX}slug:${loc}:${slug}`,
      CACHE_TTL,
      async () => {
        let review = await this.prisma.review.findUnique({
          where: { slug },
          include: { device: true },
        });

        if (!review) {
          const translatedId =
            await this.translations.resolveEntityIdByLocalizedSlug(
              ContentEntityType.REVIEW,
              slug,
              loc,
            );
          if (translatedId) {
            review = await this.prisma.review.findUnique({
              where: { id: translatedId },
              include: { device: true },
            });
          }
        }

        if (!review) {
          throw new NotFoundException(`Review "${slug}" not found.`);
        }

        const localized = await this.translations.localizeOne(
          ContentEntityType.REVIEW,
          review,
          loc,
        );
        const localeSlugs = await this.translations.localeSlugMap(
          ContentEntityType.REVIEW,
          review.id,
          review.slug,
        );
        return { ...localized, localeSlugs };
      },
    );
  }

  async create(dto: CreateReviewDto) {
    const review = await this.prisma.review.create({
      data: {
        title: dto.title,
        slug: dto.slug ?? slugify(dto.title),
        content: dto.content,
        score: dto.score,
        pros: (dto.pros ?? []) as Prisma.InputJsonValue,
        cons: (dto.cons ?? []) as Prisma.InputJsonValue,
        deviceId: dto.deviceId,
        ...(dto.publishedAt ? { publishedAt: new Date(dto.publishedAt) } : {}),
      },
    });
    await this.invalidate();
    return review;
  }

  async update(id: number, dto: UpdateReviewDto) {
    await this.ensureExists(id);

    const review = await this.prisma.review.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
        ...(dto.content !== undefined ? { content: dto.content } : {}),
        ...(dto.score !== undefined ? { score: dto.score } : {}),
        ...(dto.pros !== undefined
          ? { pros: dto.pros as Prisma.InputJsonValue }
          : {}),
        ...(dto.cons !== undefined
          ? { cons: dto.cons as Prisma.InputJsonValue }
          : {}),
        ...(dto.publishedAt !== undefined
          ? { publishedAt: new Date(dto.publishedAt) }
          : {}),
      },
    });
    await this.invalidate();
    return review;
  }

  async remove(id: number) {
    await this.ensureExists(id);
    const review = await this.prisma.review.delete({ where: { id } });
    await this.invalidate();
    return review;
  }

  private async invalidate() {
    await this.cache.delByPrefix(CACHE_PREFIX);
    await this.cache.delByPrefix('devices:');
  }

  private async ensureExists(id: number) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found.`);
    }
  }
}
