import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AdvertisementService } from './advertisement.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';
import { RevenueReportQueryDto } from './dto/revenue-query.dto';
import { UpdateAdvertisementDto } from './dto/update-ad.dto';

type AuthRequest = { user: { userId: number; role: UserRole } };

@Controller('advertisements/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class AdvertisementAdminController {
  constructor(private readonly advertisementService: AdvertisementService) {}

  @Get('campaigns')
  listCampaigns() {
    return this.advertisementService.listCampaigns();
  }

  @Post('campaigns')
  createCampaign(@Body() dto: CreateCampaignDto, @Req() req: AuthRequest) {
    return this.advertisementService.createCampaign(dto, req.user.userId);
  }

  @Patch('campaigns/:id')
  updateCampaign(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.advertisementService.updateCampaign(id, dto);
  }

  @Delete('campaigns/:id')
  deleteCampaign(@Param('id', ParseIntPipe) id: number) {
    return this.advertisementService.deleteCampaign(id);
  }

  @Get('ads')
  listAds() {
    return this.advertisementService.listManagedAds();
  }

  @Patch('ads/:id')
  updateAd(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdvertisementDto,
  ) {
    return this.advertisementService.updateAdvertisement(id, dto);
  }

  @Get('reports/revenue')
  @Roles(UserRole.SUPER_ADMIN)
  revenueReport(@Query() query: RevenueReportQueryDto) {
    return this.advertisementService.getRevenueReport(query);
  }
}
