import { Controller, Get, Query } from '@nestjs/common';

import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  /** Site-wide inbox items — available without signing in. */
  @Get('public')
  getPublic(
    @Query('limit') limit?: string,
    @Query('locale') locale?: string,
  ) {
    const parsed = limit ? Number.parseInt(limit, 10) : 24;
    const take = Number.isFinite(parsed)
      ? Math.min(Math.max(parsed, 1), 50)
      : 24;
    return this.notifications.getPublicNotifications(take, locale);
  }
}
