import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthRequest {
  user: { userId: number; email: string; role: UserRole };
}

@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  rate(@Req() req: AuthRequest, @Body() dto: CreateRatingDto) {
    return this.ratingService.rate({
      ...dto,
      userId: req.user.userId,
    });
  }

  @Get('device/:deviceId')
  findByDevice(@Param('deviceId', ParseIntPipe) deviceId: number) {
    return this.ratingService.findByDevice(deviceId);
  }
}
