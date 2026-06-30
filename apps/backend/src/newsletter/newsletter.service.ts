import { ConflictException, Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(email: string, userId?: number) {
    const normalized = email.trim().toLowerCase();
    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email: normalized },
    });
    if (existing?.active) {
      throw new ConflictException('This email is already subscribed');
    }
    if (existing) {
      return this.prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: { active: true, ...(userId ? { userId } : {}) },
      });
    }
    return this.prisma.newsletterSubscriber.create({
      data: {
        email: normalized,
        ...(userId ? { userId } : {}),
      },
    });
  }
}
