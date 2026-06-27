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

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserService } from './user.service';
import { CreateUserDto, ResetPasswordDto, UpdateUserDto } from './dto/user.dto';

interface AuthRequest extends Request {
  user: { userId: number; email: string; role: UserRole };
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class UserController {
  constructor(private readonly users: UserService) {}

  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.users.findAll(req.user.role);
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

  @Post(':id/reset-password')
  resetPassword(
    @Param('id') id: string,
    @Body() dto: ResetPasswordDto,
    @Req() req: AuthRequest,
  ) {
    return this.users.resetPassword(+id, dto, req.user, this.meta(req));
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
