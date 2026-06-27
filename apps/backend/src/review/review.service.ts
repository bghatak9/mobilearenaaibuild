import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/slug';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(deviceId?: number) {
    return this.prisma.review.findMany({
      where: deviceId ? { deviceId } : {},
      orderBy: { publishedAt: 'desc' },
      include: {
        device: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async findBySlug(slug: string) {
    const review = await this.prisma.review.findUnique({
      where: { slug },
      include: { device: true },
    });

    if (!review) {
      throw new NotFoundException(`Review "${slug}" not found.`);
    }

    return review;
  }

  create(dto: CreateReviewDto) {
    return this.prisma.review.create({
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
  }

  async update(id: number, dto: UpdateReviewDto) {
    await this.ensureExists(id);

    return this.prisma.review.update({
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
  }

  async remove(id: number) {
    await this.ensureExists(id);
    return this.prisma.review.delete({ where: { id } });
  }

  private async ensureExists(id: number) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found.`);
    }
  }
}
