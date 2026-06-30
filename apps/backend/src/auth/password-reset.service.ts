import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { CacheService } from '../cache/cache.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

type ResetOtpPayload = {
  otp: string;
  userId: number;
  attempts: number;
};

const OTP_TTL_SEC = 600;
const OTP_MAX_ATTEMPTS = 5;

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);
  private readonly memoryStore = new Map<
    string,
    { payload: ResetOtpPayload; expiresAt: number }
  >();

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly auth: AuthService,
  ) {}

  async requestEmailReset(email: string) {
    const normalized = email.trim().toLowerCase();
    const genericMessage =
      'If an account exists, a verification code has been sent to your email.';

    const user = await this.prisma.user.findUnique({
      where: { email: normalized },
    });

    if (!user || user.isBlocked || !user.isActive) {
      return this.buildResponse(genericMessage);
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      return this.buildResponse(genericMessage);
    }

    const otp = this.generateOtp();
    const key = this.otpKey(normalized);
    await this.storeOtp(key, { otp, userId: user.id, attempts: 0 });

    const masked = this.maskEmail(user.email);
    this.logger.log(`Password reset OTP queued for user ${user.id} → ${masked}`);

    return this.buildResponse(genericMessage, otp, masked);
  }

  async resetWithEmailOtp(email: string, otp: string, newPassword: string) {
    const normalized = email.trim().toLowerCase();
    const key = this.otpKey(normalized);
    const payload = await this.loadOtp(key);

    if (!payload) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }
    if (payload.attempts >= OTP_MAX_ATTEMPTS) {
      await this.deleteOtp(key);
      throw new UnauthorizedException(
        'Too many attempts. Request a new verification code.',
      );
    }
    if (payload.otp !== otp.trim()) {
      payload.attempts += 1;
      await this.storeOtp(key, payload);
      throw new UnauthorizedException('Invalid verification code');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user || user.isBlocked || !user.isActive) {
      await this.deleteOtp(key);
      throw new UnauthorizedException('Account is not eligible for reset');
    }

    await this.auth.setPasswordHash(user.id, newPassword);
    await this.deleteOtp(key);

    return { message: 'Password updated successfully. You can sign in now.' };
  }

  async adminSendEmailReset(userId: number, actorRole: UserRole) {
    if (actorRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only SUPER_ADMIN can send password reset');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    if (user.isBlocked || !user.isActive) {
      throw new BadRequestException('Account is not eligible');
    }

    return this.requestEmailReset(user.email);
  }

  private otpKey(email: string) {
    return `pwd-reset:email:${email.trim().toLowerCase()}`;
  }

  private generateOtp(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  private async storeOtp(key: string, payload: ResetOtpPayload) {
    await this.cache.set(key, payload, OTP_TTL_SEC);
    this.memoryStore.set(key, {
      payload,
      expiresAt: Date.now() + OTP_TTL_SEC * 1000,
    });
  }

  private async loadOtp(key: string): Promise<ResetOtpPayload | null> {
    const fromRedis = await this.cache.get<ResetOtpPayload>(key);
    if (fromRedis) return fromRedis;

    const mem = this.memoryStore.get(key);
    if (!mem) return null;
    if (Date.now() > mem.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }
    return mem.payload;
  }

  private async deleteOtp(key: string) {
    this.memoryStore.delete(key);
    await this.cache.del(key);
  }

  private buildResponse(message: string, otp?: string, maskedTarget?: string) {
    const expose = process.env.OTP_DEV_EXPOSE === 'true';

    return {
      message,
      ...(expose && otp
        ? {
            devOtp: otp,
            devNote: `Development only — OTP for ${maskedTarget ?? 'email'}`,
          }
        : {}),
    };
  }

  private maskEmail(email: string) {
    const [local, domain] = email.split('@');
    if (!domain) return '***';
    return `${local.slice(0, Math.min(2, local.length))}***@${domain}`;
  }
}
