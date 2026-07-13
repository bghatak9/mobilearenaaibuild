import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentEntityType } from '@prisma/client';

import { CacheService } from '../cache/cache.service';
import { ContentTranslationService } from '../content-translation/content-translation.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

const CACHE_TTL = 60;

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly translations: ContentTranslationService,
    private readonly cache: CacheService,
  ) {}

  async create(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  async findAll(locale?: string) {
    const loc = locale ?? 'en';
    return this.cache.wrap(`categories:list:${loc}`, CACHE_TTL, async () => {
      const rows = await this.prisma.category.findMany({
        orderBy: { name: 'asc' },
      });
      return this.translations.localizeMany(
        ContentEntityType.CATEGORY,
        rows,
        loc,
      );
    });
  }

  async findOne(id: number, locale?: string) {
    const loc = locale ?? 'en';
    const row = await this.prisma.category.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Category not found');
    return this.translations.localizeOne(ContentEntityType.CATEGORY, row, loc);
  }

  async update(id: number, dto: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
