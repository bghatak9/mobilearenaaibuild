import {
  Body,
  Controller,
  Get,
  Header,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AnalyticsService } from './analytics.service';
import {
  AnalyticsQueryDto,
  parseAnalyticsFilters,
} from './dto/analytics-query.dto';
import { TrackPageViewDto } from './dto/track-pageview.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Post('track')
  track(@Body() dto: TrackPageViewDto, @Req() req: Request) {
    return this.analytics.track(dto, req);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  dashboard(@Query() query: AnalyticsQueryDto) {
    return this.analytics.getDashboard(parseAnalyticsFilters(query));
  }

  @Get('countries/export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="country-traffic.csv"')
  async exportCountries(@Query() query: AnalyticsQueryDto) {
    return this.analytics.exportCountryCsv(parseAnalyticsFilters(query));
  }
}
