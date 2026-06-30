import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create or update a user's rating for a device, then refresh the device's
   * cached average rating.
   */
  async rate(dto: CreateRatingDto & { userId: number }) {
    const rating = await this.prisma.rating.upsert({
      where: {
        userId_deviceId: { userId: dto.userId, deviceId: dto.deviceId },
      },
      update: { score: dto.score },
      create: {
        score: dto.score,
        userId: dto.userId,
        deviceId: dto.deviceId,
      },
    });

    await this.refreshDeviceAverage(dto.deviceId);
    return rating;
  }

  async findByDevice(deviceId: number) {
    const [ratings, aggregate] = await Promise.all([
      this.prisma.rating.findMany({
        where: { deviceId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.rating.aggregate({
        where: { deviceId },
        _avg: { score: true },
        _count: true,
      }),
    ]);

    return {
      count: aggregate._count,
      average: aggregate._avg.score ?? 0,
      ratings,
    };
  }

  private async refreshDeviceAverage(deviceId: number) {
    const aggregate = await this.prisma.rating.aggregate({
      where: { deviceId },
      _avg: { score: true },
    });

    await this.prisma.device.update({
      where: { id: deviceId },
      data: { rating: aggregate._avg.score ?? null },
    });
  }
}
