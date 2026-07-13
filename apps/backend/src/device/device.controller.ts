import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ImportLifecycleService } from '../import/import-lifecycle.service';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

interface AuthRequest {
  user: { userId: number; email: string; role: UserRole };
}

@Controller('devices')
export class DeviceController {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly importLifecycle: ImportLifecycleService,
  ) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('locale') locale?: string,
    @Query('lang') lang?: string,
    @Req() req?: { locale?: string },
  ) {
    return this.deviceService.findAll(
      search,
      locale || lang || req?.locale,
    );
  }

  @Get('upcoming')
  findBulkUpcoming(@Query('locale') locale?: string) {
    return this.deviceService.findBulkUpcoming(locale);
  }

  @Get('slug/:slug')
  findBySlug(
    @Param('slug') slug: string,
    @Query('locale') locale?: string,
  ) {
    return this.deviceService.findBySlug(slug, locale);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('locale') locale?: string,
  ) {
    return this.deviceService.findOne(+id, locale);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  create(@Body() dto: CreateDeviceDto) {
    return this.deviceService.create(dto);
  }

  @Post('bulk-delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  bulkRemove(@Body() body: { ids: number[] }, @Req() req: AuthRequest) {
    return this.importLifecycle.softDeletePhones(body.ids ?? [], {
      userId: req.user.userId,
      role: req.user.role,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateDeviceDto) {
    return this.deviceService.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.importLifecycle.softDeletePhone(+id, {
      userId: req.user.userId,
      role: req.user.role,
    });
  }
}
