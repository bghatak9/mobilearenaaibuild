import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createToken(userId: number) {
    const token = randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    await this.prisma.emailVerificationToken.upsert({
      where: { userId },
      create: { userId, token, expiresAt },
      update: { token, expiresAt },
    });

    return token;
  }

  async verify(email: string, token: string) {
    const normalized = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalized },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid verification link');
    }
    if (user.isVerified) {
      return { message: 'Email already verified.' };
    }

    const record = await this.prisma.emailVerificationToken.findUnique({
      where: { userId: user.id },
    });
    if (!record || record.token !== token.trim()) {
      throw new UnauthorizedException('Invalid verification link');
    }
    if (record.expiresAt < new Date()) {
      await this.prisma.emailVerificationToken.delete({
        where: { userId: user.id },
      });
      throw new UnauthorizedException('Verification link expired');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      }),
      this.prisma.emailVerificationToken.delete({
        where: { userId: user.id },
      }),
    ]);

    return { message: 'Email verified successfully.' };
  }

  async resend(email: string) {
    const normalized = email.trim().toLowerCase();
    const generic =
      'If your account needs verification, a new link has been sent.';

    const user = await this.prisma.user.findUnique({
      where: { email: normalized },
    });
    if (!user || user.isVerified || !user.isActive || user.isBlocked) {
      return this.buildResponse(generic);
    }

    const token = await this.createToken(user.id);
    this.logger.log(`Verification token refreshed for user ${user.id}`);

    return this.buildResponse(generic, token, this.maskEmail(user.email));
  }

  private buildResponse(message: string, token?: string, masked?: string) {
    const expose = process.env.OTP_DEV_EXPOSE === 'true';
    return {
      message,
      ...(expose && token
        ? {
            devToken: token,
            devNote: `Development only — verify token for ${masked ?? 'email'}`,
          }
        : {}),
    };
  }

  private maskEmail(email: string) {
    const [local, domain] = email.split('@');
    if (!domain) return '***';
    return `${local.slice(0, Math.min(2, local.length))}***@${domain}`;
  }

  async assertCanResend(email: string) {
    const normalized = email.trim().toLowerCase();
    if (!normalized.includes('@')) {
      throw new BadRequestException('Valid email required');
    }
  }
}
