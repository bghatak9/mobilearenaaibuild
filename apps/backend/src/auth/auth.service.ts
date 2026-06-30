import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';
import { isStaff, STAFF_ROLES } from './role-permissions';
import { isReservedStaffEmail } from './staff-seed-emails';
import { assertPasswordMeetsPolicy } from './password-policy';
import { EmailVerificationService } from './email-verification.service';
import { hashPassword, verifyPassword } from './password-crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailVerification: EmailVerificationService,
  ) {}

  async register(email: string, password: string, name?: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      throw new UnauthorizedException('User already exists');
    }

    if (isReservedStaffEmail(normalizedEmail)) {
      throw new ForbiddenException(
        'This email is reserved for staff accounts and cannot be used for public registration.',
      );
    }

    assertPasswordMeetsPolicy(password, UserRole.USER);

    const passwordHash = await hashPassword(password);

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name?.trim() || normalizedEmail.split('@')[0],
        passwordHash,
        role: UserRole.USER,
        isVerified: false,
      },
    });

    const verifyToken = await this.emailVerification.createToken(user.id);
    const session = await this.issueSession(user);
    const expose = process.env.OTP_DEV_EXPOSE === 'true';

    return {
      ...session,
      verificationRequired: true,
      ...(expose
        ? {
            devVerifyToken: verifyToken,
            devNote: 'Development only — use on /verify-email',
          }
        : {}),
    };
  }

  async login(identifier: string, password: string, staffOnly = false) {
    const user = staffOnly
      ? await this.findStaffUserByEmailOrId(identifier)
      : await this.findUserByEmailOrId(identifier);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.isBlocked || !user.isActive) {
      throw new ForbiddenException('Account is disabled');
    }
    if (staffOnly && !isStaff(user.role)) {
      if (isReservedStaffEmail(user.email)) {
        throw new ForbiddenException(
          'This staff email was registered as a public account. Ask SUPER_ADMIN to run seed or restore the staff role.',
        );
      }
      throw new ForbiddenException('Staff access required');
    }
    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'This account uses social sign-in or needs a password reset',
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueSession(user);
  }

  async googleSignIn(idToken: string, staffOnly = false) {
    const profile = await this.verifyGoogleIdToken(idToken);
    const email = profile.email.toLowerCase();

    let user = profile.sub
      ? await this.prisma.user.findFirst({
          where: {
            OR: [{ googleId: profile.sub }, { email }],
          },
        })
      : await this.prisma.user.findUnique({ where: { email } });

    if (user) {
      if (user.isBlocked || !user.isActive) {
        throw new ForbiddenException('Account is disabled');
      }
      if (staffOnly && !isStaff(user.role)) {
        throw new ForbiddenException('Staff access required');
      }
      if (!user.googleId && profile.sub) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId: profile.sub, isVerified: true },
        });
      }
    } else {
      if (staffOnly) {
        throw new ForbiddenException('No staff account for this Google user');
      }
      user = await this.prisma.user.create({
        data: {
          email,
          name: profile.name ?? email.split('@')[0],
          googleId: profile.sub,
          role: UserRole.USER,
          isVerified: true,
        },
      });
    }

    return this.issueSession(user);
  }

  async facebookSignIn(accessToken: string, staffOnly = false) {
    const profile = await this.verifyFacebookAccessToken(accessToken);
    const email = profile.email?.toLowerCase();

    let user = profile.id
      ? await this.prisma.user.findFirst({
          where: {
            OR: [
              { facebookId: profile.id },
              ...(email ? [{ email }] : []),
            ],
          },
        })
      : email
        ? await this.prisma.user.findUnique({ where: { email } })
        : null;

    if (user) {
      if (user.isBlocked || !user.isActive) {
        throw new ForbiddenException('Account is disabled');
      }
      if (staffOnly && !isStaff(user.role)) {
        throw new ForbiddenException('Staff access required');
      }
      if (!user.facebookId && profile.id) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            facebookId: profile.id,
            isVerified: true,
            ...(profile.name && !user.name ? { name: profile.name } : {}),
          },
        });
      }
    } else {
      if (staffOnly) {
        throw new ForbiddenException('No staff account for this Facebook user');
      }
      if (!email) {
        throw new BadRequestException(
          'Facebook account must share an email address to sign up',
        );
      }
      user = await this.prisma.user.create({
        data: {
          email,
          name: profile.name ?? email.split('@')[0],
          facebookId: profile.id,
          role: UserRole.USER,
          isVerified: true,
        },
      });
    }

    return this.issueSession(user);
  }

  isSocialAuthDevMode(): boolean {
    return (
      process.env.SOCIAL_AUTH_DEV_MODE === 'true' &&
      process.env.NODE_ENV !== 'production'
    );
  }

  async devSocialSignIn(provider: 'google' | 'facebook', email: string) {
    if (!this.isSocialAuthDevMode()) {
      throw new ForbiddenException('Development social sign-in is disabled');
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      throw new BadRequestException('Email is required');
    }
    if (isReservedStaffEmail(normalizedEmail)) {
      throw new ForbiddenException(
        'This email is reserved for staff accounts.',
      );
    }

    const externalId = `dev:${provider}:${normalizedEmail}`;

    let user =
      provider === 'google'
        ? await this.prisma.user.findFirst({
            where: {
              OR: [{ googleId: externalId }, { email: normalizedEmail }],
            },
          })
        : await this.prisma.user.findFirst({
            where: {
              OR: [{ facebookId: externalId }, { email: normalizedEmail }],
            },
          });

    if (user) {
      if (user.isBlocked || !user.isActive) {
        throw new ForbiddenException('Account is disabled');
      }
      if (provider === 'google' && !user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId: externalId, isVerified: true },
        });
      } else if (provider === 'facebook' && !user.facebookId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { facebookId: externalId, isVerified: true },
        });
      }
    } else {
      user = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          name: normalizedEmail.split('@')[0],
          ...(provider === 'google'
            ? { googleId: externalId }
            : { facebookId: externalId }),
          role: UserRole.USER,
          isVerified: true,
        },
      });
    }

    return this.issueSession(user);
  }

  async setPasswordHash(userId: number, plainPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    assertPasswordMeetsPolicy(plainPassword, user.role);

    const passwordHash = await hashPassword(plainPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async issueSession(user: User) {
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
    };
  }

  async findUserByEmailOrId(identifier: string) {
    const trimmed = identifier.trim();
    if (!trimmed) return null;

    const lower = trimmed.toLowerCase();
    if (lower.includes('@')) {
      return this.prisma.user.findUnique({ where: { email: lower } });
    }

    return this.prisma.user.findFirst({
      where: {
        email: { startsWith: `${lower}@`, mode: 'insensitive' },
      },
    });
  }

  /** Staff login — prefer accounts with staff roles when ID prefix matches multiple emails. */
  async findStaffUserByEmailOrId(identifier: string) {
    const trimmed = identifier.trim();
    if (!trimmed) return null;

    const lower = trimmed.toLowerCase();
    if (lower.includes('@')) {
      return this.prisma.user.findUnique({ where: { email: lower } });
    }

    const staffMatches = await this.prisma.user.findMany({
      where: {
        email: { startsWith: `${lower}@`, mode: 'insensitive' },
        role: { in: STAFF_ROLES },
      },
    });
    if (staffMatches.length === 1) return staffMatches[0]!;
    if (staffMatches.length > 1) {
      const exactLocal = staffMatches.find(
        (u) => u.email.split('@')[0]?.toLowerCase() === lower,
      );
      return exactLocal ?? staffMatches[0]!;
    }

    return this.prisma.user.findFirst({
      where: {
        email: { startsWith: `${lower}@`, mode: 'insensitive' },
      },
    });
  }

  private async verifyGoogleIdToken(idToken: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    if (!clientId) {
      throw new BadRequestException('Google Sign-In is not configured');
    }

    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    );
    if (!res.ok) {
      throw new UnauthorizedException('Invalid Google token');
    }

    const payload = (await res.json()) as {
      aud?: string;
      sub?: string;
      email?: string;
      email_verified?: string;
      name?: string;
    };

    if (payload.aud !== clientId || !payload.email || !payload.sub) {
      throw new UnauthorizedException('Invalid Google token');
    }
    if (payload.email_verified !== 'true') {
      throw new UnauthorizedException('Google email is not verified');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  }

  private async verifyFacebookAccessToken(accessToken: string) {
    const appId = process.env.FACEBOOK_APP_ID?.trim();
    const appSecret = process.env.FACEBOOK_APP_SECRET?.trim();
    if (!appId || !appSecret) {
      throw new BadRequestException('Facebook Sign-In is not configured');
    }

    const debugRes = await fetch(
      `https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(accessToken)}&access_token=${encodeURIComponent(`${appId}|${appSecret}`)}`,
    );
    if (!debugRes.ok) {
      throw new UnauthorizedException('Invalid Facebook token');
    }

    const debug = (await debugRes.json()) as {
      data?: { is_valid?: boolean; app_id?: string; user_id?: string };
    };
    if (
      !debug.data?.is_valid ||
      debug.data.app_id !== appId ||
      !debug.data.user_id
    ) {
      throw new UnauthorizedException('Invalid Facebook token');
    }

    const profileRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`,
    );
    if (!profileRes.ok) {
      throw new UnauthorizedException('Invalid Facebook token');
    }

    const profile = (await profileRes.json()) as {
      id?: string;
      name?: string;
      email?: string;
    };

    if (!profile.id || profile.id !== debug.data.user_id) {
      throw new UnauthorizedException('Invalid Facebook token');
    }

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
    };
  }
}
