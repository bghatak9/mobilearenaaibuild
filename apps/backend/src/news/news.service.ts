import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentEntityType, PostStatus, Prisma } from '@prisma/client';

import { isImportedOnlyCatalog, catalogNewsWhere } from '../common/catalog-mode';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { slugify } from '../common/slug';
import { ContentTranslationService } from '../content-translation/content-translation.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

const CACHE_PREFIX = 'news:';
const CACHE_TTL = 60;

function catalogCacheScope() {
  return isImportedOnlyCatalog() ? 'imported' : 'all';
}

@Injectable()
export class NewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly translations: ContentTranslationService,
  ) {}

  async findAll(
    params?: {
      status?: PostStatus;
      featured?: boolean;
      locale?: string;
      search?: string;
    },
    options?: { includeCatalogHidden?: boolean },
  ) {
    const scope = options?.includeCatalogHidden
      ? 'admin'
      : catalogCacheScope();
    const locale = params?.locale ?? 'en';
    const cleanSearch = params?.search?.trim();
    const key = `${CACHE_PREFIX}list:${scope}:${locale}:${params?.status ?? 'any'}:${
      params?.featured ?? 'any'
    }:${cleanSearch || 'all'}`;

    return this.cache.wrap(key, CACHE_TTL, async () => {
      const where: Prisma.NewsWhereInput = options?.includeCatalogHidden
        ? {}
        : catalogNewsWhere();
      if (params?.status) where.status = params.status;
      if (params?.featured !== undefined) where.featured = params.featured;

      if (cleanSearch) {
        const translationIds = await this.translations.searchEntityIds(
          ContentEntityType.NEWS,
          cleanSearch,
          locale,
        );
        where.OR = [
          { title: { contains: cleanSearch, mode: 'insensitive' } },
          { content: { contains: cleanSearch, mode: 'insensitive' } },
          { excerpt: { contains: cleanSearch, mode: 'insensitive' } },
          { seoTitle: { contains: cleanSearch, mode: 'insensitive' } },
          { keywords: { contains: cleanSearch, mode: 'insensitive' } },
          ...(translationIds.length
            ? [{ id: { in: translationIds } }]
            : []),
        ];
      }

      const rows = await this.prisma.news.findMany({
        where,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      });
      return this.translations.localizeMany(
        ContentEntityType.NEWS,
        rows,
        locale,
      );
    });
  }

  async findBySlug(
    slug: string,
    options?: { includeCatalogHidden?: boolean; locale?: string },
  ) {
    const scope = options?.includeCatalogHidden
      ? 'admin'
      : catalogCacheScope();
    const locale = options?.locale ?? 'en';

    return this.cache.wrap(
      `${CACHE_PREFIX}slug:${scope}:${locale}:${slug}`,
      CACHE_TTL,
      async () => {
        let article = await this.prisma.news.findFirst({
          where: options?.includeCatalogHidden
            ? { slug }
            : catalogNewsWhere({ slug }),
        });

        if (!article) {
          const translatedId =
            await this.translations.resolveEntityIdByLocalizedSlug(
              ContentEntityType.NEWS,
              slug,
              locale,
            );
          if (translatedId) {
            article = await this.prisma.news.findFirst({
              where: options?.includeCatalogHidden
                ? { id: translatedId }
                : catalogNewsWhere({ id: translatedId }),
            });
          }
        }

        if (!article) {
          throw new NotFoundException(`News article "${slug}" not found.`);
        }
        const localized = await this.translations.localizeOne(
          ContentEntityType.NEWS,
          article,
          locale,
        );
        const localeSlugs = await this.translations.localeSlugMap(
          ContentEntityType.NEWS,
          article.id,
          article.slug,
        );
        return { ...localized, localeSlugs };
      },
    );
  }

  async create(dto: CreateNewsDto) {
    const status = dto.status ?? PostStatus.DRAFT;
    const publishedAt = dto.publishedAt
      ? new Date(dto.publishedAt)
      : status === PostStatus.PUBLISHED
        ? new Date()
        : null;

    const article = await this.prisma.news.create({
      data: {
        title: dto.title,
        slug: dto.slug ?? slugify(dto.title),
        content: dto.content,
        excerpt: dto.excerpt ?? null,
        thumbnail: dto.thumbnail ?? null,
        featured: dto.featured ?? false,
        status,
        publishedAt,
      },
    });
    await this.cache.delByPrefix(CACHE_PREFIX);
    return article;
  }

  async update(id: number, dto: UpdateNewsDto) {
    await this.ensureExists(id);

    const data: Prisma.NewsUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.excerpt !== undefined) data.excerpt = dto.excerpt;
    if (dto.thumbnail !== undefined) data.thumbnail = dto.thumbnail;
    if (dto.featured !== undefined) data.featured = dto.featured;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.publishedAt !== undefined) {
      data.publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : null;
    } else if (dto.status === PostStatus.PUBLISHED) {
      data.publishedAt = new Date();
    }

    const article = await this.prisma.news.update({ where: { id }, data });
    await this.cache.delByPrefix(CACHE_PREFIX);
    return article;
  }

  async remove(id: number) {
    await this.ensureExists(id);
    const article = await this.prisma.news.delete({ where: { id } });
    await this.cache.delByPrefix(CACHE_PREFIX);
    return article;
  }

  private async ensureExists(id: number) {
    const article = await this.prisma.news.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException(`News article with ID ${id} not found.`);
    }
  }
}
