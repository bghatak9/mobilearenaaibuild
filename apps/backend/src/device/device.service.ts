import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/slug';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

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
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string) {
    const cleanSearch = search?.trim();

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
  }

  async findOne(id: number) {
    const device = await this.prisma.device.findUnique({
      where: { id },
      include: detailInclude,
    });
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found.`);
    }
    return device;
  }

  async findBySlug(slug: string) {
    const device = await this.prisma.device.findUnique({
      where: { slug },
      include: detailInclude,
    });
    if (!device) {
      throw new NotFoundException(`Device "${slug}" not found.`);
    }
    return device;
  }

  async create(data: CreateDeviceDto) {
    return this.prisma.device.create({
      data: {
        ...data,
        slug: data.slug ?? slugify(data.name),
      },
      include: listInclude,
    });
  }

  async update(id: number, data: UpdateDeviceDto) {
    return this.prisma.device.update({
      where: { id },
      data,
      include: listInclude,
    });
  }

  async remove(id: number) {
    return this.prisma.device.delete({
      where: { id },
    });
  }
}
