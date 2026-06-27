import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { slugify } from '../common/slug';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

const CACHE_PREFIX = 'devices:';
const CACHE_TTL = 120;

const listInclude = {
  brand: true,
  category: true,
  manufacturer: true,
  images: { take: 1 },
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
} satisfies Prisma.DeviceInclude;

@Injectable()
export class DeviceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async findAll(search?: string) {
    const cleanSearch = search?.trim();
    const cacheKey = `${CACHE_PREFIX}list:${cleanSearch || 'all'}`;

    return this.cache.wrap(cacheKey, CACHE_TTL, () => {
      const where: Prisma.DeviceWhereInput = cleanSearch
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
            ],
          }
        : {};

      return this.prisma.device.findMany({
        where,
        include: listInclude,
      });
    });
  }

  async findOne(id: number) {
    return this.cache.wrap(`${CACHE_PREFIX}id:${id}`, CACHE_TTL, async () => {
      const device = await this.prisma.device.findUnique({
        where: { id },
        include: detailInclude,
      });
      if (!device) {
        throw new NotFoundException(`Device with ID ${id} not found.`);
      }
      return device;
    });
  }

  async findBySlug(slug: string) {
    return this.cache.wrap(
      `${CACHE_PREFIX}slug:${slug}`,
      CACHE_TTL,
      async () => {
        const device = await this.prisma.device.findUnique({
          where: { slug },
          include: detailInclude,
        });
        if (!device) {
          throw new NotFoundException(`Device "${slug}" not found.`);
        }
        return device;
      },
    );
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
