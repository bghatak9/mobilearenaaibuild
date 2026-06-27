import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCommentDto) {
    return this.prisma.comment.create({
      data: {
        body: dto.body,
        userId: dto.userId,
        deviceId: dto.deviceId,
      },
    });
  }

  findByDevice(deviceId: number) {
    return this.prisma.comment.findMany({
      where: { deviceId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true } },
      },
    });
  }

  async remove(id: number) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found.`);
    }
    return this.prisma.comment.delete({ where: { id } });
  }
}
