import { Injectable, NotFoundException } from '@nestjs/common';
import { PostStatus, Prisma } from '@prisma/client';

import { isImportedOnlyCatalog, catalogNewsWhere } from '../common/catalog-mode';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { slugify } from '../common/slug';
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
  ) {}

  findAll(
    params?: { status?: PostStatus; featured?: boolean },
    options?: { includeCatalogHidden?: boolean },
  ) {
    const scope = options?.includeCatalogHidden
      ? 'admin'
      : catalogCacheScope();
    const key = `${CACHE_PREFIX}list:${scope}:${params?.status ?? 'any'}:${
      params?.featured ?? 'any'
    }`;

    return this.cache.wrap(key, CACHE_TTL, () => {
      const where: Prisma.NewsWhereInput = options?.includeCatalogHidden
        ? {}
        : catalogNewsWhere();
      if (params?.status) where.status = params.status;
      if (params?.featured !== undefined) where.featured = params.featured;

      return this.prisma.news.findMany({
        where,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      });
    });
  }

  async findBySlug(slug: string, options?: { includeCatalogHidden?: boolean }) {
    const scope = options?.includeCatalogHidden
      ? 'admin'
      : catalogCacheScope();

    return this.cache.wrap(
      `${CACHE_PREFIX}slug:${scope}:${slug}`,
      CACHE_TTL,
      async () => {
        const article = await this.prisma.news.findFirst({
          where: options?.includeCatalogHidden
            ? { slug }
            : catalogNewsWhere({ slug }),
        });
        if (!article) {
          throw new NotFoundException(`News article "${slug}" not found.`);
        }
        return article;
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
      // Auto-stamp publish time when transitioning to PUBLISHED.
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
