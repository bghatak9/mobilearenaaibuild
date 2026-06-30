import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';

import { AdvertisementService } from './advertisement.service';
import { TrackImpressionDto } from './dto/track-impression.dto';

@Controller('advertisements')
export class AdvertisementController {
  constructor(private readonly advertisementService: AdvertisementService) {}

  @Get('catalog')
  getCatalog() {
    return this.advertisementService.getCatalog();
  }

  @Get('active')
  findActive(
    @Query('placement') placement?: string,
    @Query('adType') adType?: string,
  ) {
    return this.advertisementService.findActive({ placement, adType });
  }

  @Post(':id/impression')
  recordImpression(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TrackImpressionDto,
  ) {
    return this.advertisementService.recordImpression(id, dto);
  }

  @Get('click/:id')
  async trackClick(
    @Param('id', ParseIntPipe) id: number,
    @Query('placement') placement: string | undefined,
    @Query('countryCode') countryCode: string | undefined,
    @Res() res: Response,
  ) {
    const link = await this.advertisementService.recordClick(
      id,
      placement,
      countryCode,
    );
    return res.redirect(302, link);
  }
}
