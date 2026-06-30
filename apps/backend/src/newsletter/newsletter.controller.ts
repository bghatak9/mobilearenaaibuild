import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscribeNewsletterDto } from './dto/subscribe.dto';
import { NewsletterService } from './newsletter.service';

type AuthRequest = { user?: { userId: number; role: UserRole } };

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  subscribe(@Body() dto: SubscribeNewsletterDto) {
    return this.newsletterService.subscribe(dto.email);
  }

  @Post('subscribe/authenticated')
  @UseGuards(JwtAuthGuard)
  subscribeAuth(@Body() dto: SubscribeNewsletterDto, @Req() req: AuthRequest) {
    return this.newsletterService.subscribe(dto.email, req.user!.userId);
  }
}
