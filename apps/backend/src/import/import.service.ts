import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/slug';
import * as XLSX from 'xlsx';

type ImportRow = {
  name?: string;
  brand?: string;
  category?: string;
  manufacturer?: string;
  price?: number | string;
};

@Injectable()
export class ImportService {
  constructor(private readonly prisma: PrismaService) {}

  async importDevices(file: Express.Multer.File) {
    if (!file) {
      return { success: false, message: 'No file uploaded' };
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<ImportRow>(sheet);

    let inserted = 0;
    let skipped = 0;

    const errors: { row: ImportRow; reason: string }[] = [];

    for (const row of rows) {
      try {
        if (!row.name || !row.brand || !row.category) {
          skipped++;
          errors.push({ row, reason: 'Missing required fields' });
          continue;
        }

        const price = Number(row.price ?? 0);
        if (isNaN(price) || price < 0) {
          skipped++;
          errors.push({ row, reason: 'Invalid price' });
          continue;
        }

        const existing = await this.prisma.device.findFirst({
          where: { name: row.name },
        });

        if (existing) {
          skipped++;
          errors.push({ row, reason: 'Duplicate device' });
          continue;
        }

        const brand = await this.prisma.brand.upsert({
          where: { name: row.brand },
          update: {},
          create: { name: row.brand, slug: slugify(row.brand) },
        });

        const category = await this.prisma.category.upsert({
          where: { name: row.category },
          update: {},
          create: { name: row.category, slug: slugify(row.category) },
        });

        const manufacturerName = row.manufacturer ?? 'Unknown';
        const manufacturer = await this.prisma.manufacturer.upsert({
          where: { name: manufacturerName },
          update: {},
          create: { name: manufacturerName, slug: slugify(manufacturerName) },
        });

        await this.prisma.device.create({
          data: {
            name: row.name,
            slug: slugify(row.name),
            price,
            brandId: brand.id,
            categoryId: category.id,
            manufacturerId: manufacturer.id,
          },
        });

        inserted++;
      } catch {
        skipped++;
        errors.push({ row, reason: 'Unexpected error' });
      }
    }

    return {
      success: true,
      totalRows: rows.length,
      inserted,
      skipped,
      errors,
    };
  }
}
