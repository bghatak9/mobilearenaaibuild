import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  assignableRoles,
  canManageUser,
  canManageUsers,
} from '../auth/role-permissions';
import { CreateUserDto, ResetPasswordDto, UpdateUserDto } from './dto/user.dto';

const publicSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  isVerified: true,
  isBlocked: true,
  lastLogin: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  findAll(actorRole: UserRole) {
    const where =
      actorRole === UserRole.SUPER_ADMIN
        ? {}
        : { role: { notIn: [UserRole.SUPER_ADMIN, UserRole.ADMIN] } };

    return this.prisma.user.findMany({
      where,
      select: publicSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, actorRole: UserRole) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: publicSelect,
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    if (!canManageUser(actorRole, user.role)) {
      throw new ForbiddenException(
        'You do not have permission to view this user',
      );
    }
    return user;
  }

  async create(
    dto: CreateUserDto,
    actor: { userId: number; role: UserRole },
    meta?: { ipAddress?: string; userAgent?: string },
  ) {
    if (!canManageUsers(actor.role)) {
      throw new ForbiddenException('You cannot create users');
    }
    if (!assignableRoles(actor.role).includes(dto.role)) {
      throw new ForbiddenException(`You cannot assign the ${dto.role} role`);
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new UnauthorizedException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name ?? dto.email.split('@')[0],
        passwordHash,
        role: dto.role,
        createdById: actor.userId,
        isVerified: dto.role !== UserRole.USER,
      },
      select: publicSelect,
    });

    await this.audit.log({
      userId: actor.userId,
      action: `Created ${dto.role}`,
      entity: 'User',
      entityId: String(user.id),
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return user;
  }

  async update(
    id: number,
    dto: UpdateUserDto,
    actor: { userId: number; role: UserRole },
    meta?: { ipAddress?: string; userAgent?: string },
  ) {
    const existing = await this.ensureManageable(id, actor.role);

    if (dto.role !== undefined) {
      if (!assignableRoles(actor.role).includes(dto.role)) {
        throw new ForbiddenException(`You cannot assign the ${dto.role} role`);
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.role !== undefined ? { role: dto.role } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.isVerified !== undefined ? { isVerified: dto.isVerified } : {}),
        ...(dto.isBlocked !== undefined ? { isBlocked: dto.isBlocked } : {}),
      },
      select: publicSelect,
    });

    const changes = [
      dto.role !== undefined && dto.role !== existing.role
        ? `role -> ${dto.role}`
        : null,
      dto.isBlocked !== undefined && dto.isBlocked !== existing.isBlocked
        ? dto.isBlocked
          ? 'blocked'
          : 'unblocked'
        : null,
    ]
      .filter(Boolean)
      .join(', ');

    await this.audit.log({
      userId: actor.userId,
      action: changes ? `Updated user (${changes})` : 'Updated user',
      entity: 'User',
      entityId: String(id),
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return user;
  }

  async resetPassword(
    id: number,
    dto: ResetPasswordDto,
    actor: { userId: number; role: UserRole },
    meta?: { ipAddress?: string; userAgent?: string },
  ) {
    await this.ensureManageable(id, actor.role);
    const passwordHash = await bcrypt.hash(dto.password, 10);

    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    await this.audit.log({
      userId: actor.userId,
      action: 'Reset password',
      entity: 'User',
      entityId: String(id),
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return { message: 'Password reset successfully' };
  }

  async remove(
    id: number,
    actor: { userId: number; role: UserRole },
    meta?: { ipAddress?: string; userAgent?: string },
  ) {
    const existing = await this.ensureManageable(id, actor.role);

    if (existing.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('SUPER_ADMIN accounts cannot be deleted');
    }

    await this.prisma.user.delete({ where: { id } });

    await this.audit.log({
      userId: actor.userId,
      action: `Deleted ${existing.role}`,
      entity: 'User',
      entityId: String(id),
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return { message: 'User deleted successfully' };
  }

  private async ensureManageable(id: number, actorRole: UserRole) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    if (!canManageUser(actorRole, user.role)) {
      throw new ForbiddenException(
        'You do not have permission to manage this user',
      );
    }
    return user;
  }
}
