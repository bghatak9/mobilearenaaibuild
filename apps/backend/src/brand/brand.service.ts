import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { catalogDeviceWhere } from '../common/catalog-mode';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BrandService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findAll() {
    return this.prisma.brand.findMany({
      where: { deletedAt: null },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findAllGrouped() {
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
      const key = category.slug;
      if (!groups.has(key)) {
        groups.set(key, { category, brands: new Map() });
      }
      groups.get(key)!.brands.set(brand.id, {
        ...brand,
        logo: brand.logo ?? null,
      });
    }

    const importedBrandIds = new Set(
      importedBrandItems
        .map((item) => item.brandId)
        .filter((id): id is number => id != null),
    );

    const orphanBrands = allBrands.filter(
      (b) => !brandsWithDevices.has(b.id) && importedBrandIds.has(b.id),
    );
    if (orphanBrands.length > 0) {
      groups.set('uploaded-brands', {
        category: { id: 0, name: 'Brands', slug: 'brands' },
        brands: new Map(
          orphanBrands.map((b) => [
            b.id,
            { id: b.id, name: b.name, slug: b.slug, logo: b.logo ?? null },
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
  }

  async findOne(id: number) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found.`);
    }

    return brand;
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