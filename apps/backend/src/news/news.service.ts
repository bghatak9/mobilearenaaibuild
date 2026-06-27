import { Injectable, NotFoundException } from '@nestjs/common';
import { PostStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/slug';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(params?: { status?: PostStatus; featured?: boolean }) {
    const where: Prisma.NewsWhereInput = {};
    if (params?.status) where.status = params.status;
    if (params?.featured !== undefined) where.featured = params.featured;

    return this.prisma.news.findMany({
      where,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findBySlug(slug: string) {
    const article = await this.prisma.news.findUnique({ where: { slug } });
    if (!article) {
      throw new NotFoundException(`News article "${slug}" not found.`);
    }
    return article;
  }

  create(dto: CreateNewsDto) {
    const status = dto.status ?? PostStatus.DRAFT;
    const publishedAt = dto.publishedAt
      ? new Date(dto.publishedAt)
      : status === PostStatus.PUBLISHED
        ? new Date()
        : null;

    return this.prisma.news.create({
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

    return this.prisma.news.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.ensureExists(id);
    return this.prisma.news.delete({ where: { id } });
  }

  private async ensureExists(id: number) {
    const article = await this.prisma.news.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException(`News article with ID ${id} not found.`);
    }
  }
}
