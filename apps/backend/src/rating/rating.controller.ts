import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';

import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';

@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  rate(@Body() dto: CreateRatingDto) {
    return this.ratingService.rate(dto);
  }

  @Get('device/:deviceId')
  findByDevice(@Param('deviceId', ParseIntPipe) deviceId: number) {
    return this.ratingService.findByDevice(deviceId);
  }
}
