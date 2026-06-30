import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { catalogDeviceWhere } from '../common/catalog-mode';
import { PrismaService } from '../prisma/prisma.service';

const deviceInclude = {
  brand: true,
  category: true,
  manufacturer: true,
  display: true,
  battery: true,
  chipset: true,
  cameras: true,
  images: true,
} satisfies Prisma.DeviceInclude;

type ComparedDevice = Prisma.DeviceGetPayload<{ include: typeof deviceInclude }>;

const MIN_DEVICES = 2;
const MAX_DEVICES = 4;

@Injectable()
export class CompareService {
  constructor(private readonly prisma: PrismaService) {}

  async compare(slug: string) {
    const slugs = slug.split('-vs-').filter(Boolean);

    if (slugs.length < MIN_DEVICES || slugs.length > MAX_DEVICES) {
      throw new NotFoundException(
        `Compare ${MIN_DEVICES} to ${MAX_DEVICES} devices, e.g. "device-a-vs-device-b".`,
      );
    }

    const found = await Promise.all(
      slugs.map((s) =>
        this.prisma.device.findFirst({
          where: catalogDeviceWhere({ slug: s }),
          include: deviceInclude,
        }),
      ),
    );

    const missing = slugs.filter((_, i) => !found[i]);
    if (missing.length) {
      throw new NotFoundException(
        `Device(s) not found: ${missing.join(', ')}.`,
      );
    }

    const devices = found as ComparedDevice[];

    const ratingAgg = await Promise.all(
      devices.map((d) =>
        this.prisma.rating.aggregate({
          where: { deviceId: d.id },
          _avg: { score: true },
          _count: { score: true },
        }),
      ),
    );

    const enriched = devices.map((d, i) => {
      const avg = ratingAgg[i]?._avg.score;
      const count = ratingAgg[i]?._count.score ?? 0;
      return {
        ...d,
        rating: avg ?? d.rating,
        communityRatingCount: count,
      };
    });

    return {
      devices: enriched,
      winners: this.computeWinners(enriched),
    };
  }

  /**
   * For each metric, returns the indices of the device(s) that win it.
   * Returns an empty array when fewer than two devices have a comparable value
   * (so the UI knows not to highlight anything).
   */
  private computeWinners(devices: ComparedDevice[]) {
    const maxMegapixel = (d: ComparedDevice) =>
      d.cameras.length ? Math.max(...d.cameras.map((c) => c.megapixel)) : null;

    return {
      price: this.best(devices.map((d) => d.price), 'lower'),
      rating: this.best(devices.map((d) => d.rating), 'higher'),
      weight: this.best(devices.map((d) => d.weight), 'lower'),
      batteryCapacity: this.best(
        devices.map((d) => d.battery?.capacity ?? null),
        'higher',
      ),
      refreshRate: this.best(
        devices.map((d) => d.display?.refreshRate ?? null),
        'higher',
      ),
      brightness: this.best(
        devices.map((d) => d.display?.brightness ?? null),
        'higher',
      ),
      benchmark: this.best(
        devices.map((d) => d.chipset?.benchmark ?? null),
        'higher',
      ),
      mainCamera: this.best(devices.map(maxMegapixel), 'higher'),
    };
  }

  private best(
    values: (number | null)[],
    better: 'higher' | 'lower',
  ): number[] {
    const present = values
      .map((value, index) => ({ value, index }))
      .filter((entry): entry is { value: number; index: number } =>
        entry.value !== null,
      );

    if (present.length < 2) return [];

    const target =
      better === 'higher'
        ? Math.max(...present.map((p) => p.value))
        : Math.min(...present.map((p) => p.value));

    return present.filter((p) => p.value === target).map((p) => p.index);
  }
}
