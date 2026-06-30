import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserRole } from '@prisma/client';

import { PasswordResetService } from '../auth/password-reset.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuditService } from '../audit/audit.service';
import { UserService } from './user.service';
import { CreateUserDto, SendPasswordResetDto, UpdateUserDto } from './dto/user.dto';

interface AuthRequest extends Request {
  user: { userId: number; email: string; role: UserRole };
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class UserController {
  constructor(
    private readonly users: UserService,
    private readonly passwordReset: PasswordResetService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.users.findAll(req.user.role);
  }

  @Post(':id/send-password-reset')
  @Roles(UserRole.SUPER_ADMIN)
  async sendPasswordReset(
    @Param('id') id: string,
    @Body() dto: SendPasswordResetDto,
    @Req() req: AuthRequest,
  ) {
    const result = await this.passwordReset.adminSendEmailReset(
      +id,
      req.user.role,
    );

    try {
      await this.audit.log({
        userId: req.user.userId,
        action: 'Sent email password reset OTP',
        entity: 'User',
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
    } catch {
      /* non-blocking */
    }

    return result;
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.users.findOne(+id, req.user.role);
  }

  @Post()
  create(@Body() dto: CreateUserDto, @Req() req: AuthRequest) {
    return this.users.create(dto, req.user, this.meta(req));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: AuthRequest,
  ) {
    return this.users.update(+id, dto, req.user, this.meta(req));
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.users.remove(+id, req.user, this.meta(req));
  }

  private meta(req: AuthRequest) {
    return {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };
  }
}
