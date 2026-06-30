import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { ContactMessageDto } from './dto/contact-message.dto';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: ContactMessageDto) {
    return this.prisma.contactMessage.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.trim().toLowerCase(),
        subject: dto.subject?.trim() || null,
        message: dto.message.trim(),
      },
      select: { id: true, createdAt: true },
    });
  }
}
