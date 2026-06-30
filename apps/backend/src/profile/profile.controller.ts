import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BookmarkEntityType, UserRole } from '@prisma/client';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddSearchHistoryDto } from './dto/add-search-history.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ConfirmPasswordDto } from './dto/confirm-password.dto';
import { CreateBookmarkDto } from './dto/bookmark.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SaveComparisonDto } from './dto/save-comparison.dto';
import { UpsertWishlistDto } from './dto/wishlist.dto';
import { ProfileCollectionsService } from './profile-collections.service';
import { ProfileService } from './profile.service';

type AuthRequest = { user: { userId: number; role: UserRole } };

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly collections: ProfileCollectionsService,
  ) {}

  @Get('me')
  getMe(@Req() req: AuthRequest) {
    return this.profileService.getProfile(req.user.userId);
  }

  @Patch('me')
  updateMe(@Req() req: AuthRequest, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(req.user.userId, dto);
  }

  @Patch('me/settings')
  async updateSettings(@Req() req: AuthRequest, @Body() dto: UpdateSettingsDto) {
    await this.collections.updateSettings(req.user.userId, dto);
    return this.profileService.getProfile(req.user.userId);
  }

  @Post('me/change-password')
  changePassword(@Req() req: AuthRequest, @Body() dto: ChangePasswordDto) {
    return this.collections.changePassword(
      req.user.userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Post('me/2fa/enable')
  enableTwoFactor(@Req() req: AuthRequest, @Body() dto: ConfirmPasswordDto) {
    return this.collections.setTwoFactor(
      req.user.userId,
      true,
      dto.currentPassword,
    );
  }

  @Post('me/2fa/disable')
  disableTwoFactor(@Req() req: AuthRequest, @Body() dto: ConfirmPasswordDto) {
    return this.collections.setTwoFactor(
      req.user.userId,
      false,
      dto.currentPassword,
    );
  }

  @Get('me/activity')
  getActivity(
    @Req() req: AuthRequest,
    @Query('limit') limit?: string,
  ) {
    const parsed = limit
      ? Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50)
      : 20;
    return this.profileService.getActivity(req.user.userId, parsed);
  }

  @Get('me/comments')
  getComments(@Req() req: AuthRequest) {
    return this.collections.getComments(req.user.userId);
  }

  @Get('me/ratings')
  getRatings(@Req() req: AuthRequest) {
    return this.collections.getRatings(req.user.userId);
  }

  @Get('me/bookmarks')
  getBookmarks(@Req() req: AuthRequest) {
    return this.collections.getBookmarks(req.user.userId);
  }

  @Post('me/bookmarks')
  addBookmark(@Req() req: AuthRequest, @Body() dto: CreateBookmarkDto) {
    return this.collections.addBookmark(req.user.userId, dto);
  }

  @Delete('me/bookmarks/:entityType/:entityId')
  removeBookmark(
    @Req() req: AuthRequest,
    @Param('entityType', new ParseEnumPipe(BookmarkEntityType))
    entityType: BookmarkEntityType,
    @Param('entityId', ParseIntPipe) entityId: number,
  ) {
    return this.collections.removeBookmark(
      req.user.userId,
      entityType,
      entityId,
    );
  }

  @Get('me/favorite-devices')
  getFavoriteDevices(@Req() req: AuthRequest) {
    return this.collections.getFavoriteDevices(req.user.userId);
  }

  @Post('favorite-devices/:deviceId')
  addFavoriteDevice(
    @Req() req: AuthRequest,
    @Param('deviceId', ParseIntPipe) deviceId: number,
  ) {
    return this.collections.addFavoriteDevice(req.user.userId, deviceId);
  }

  @Delete('favorite-devices/:deviceId')
  removeFavoriteDevice(
    @Req() req: AuthRequest,
    @Param('deviceId', ParseIntPipe) deviceId: number,
  ) {
    return this.collections.removeFavoriteDevice(req.user.userId, deviceId);
  }

  @Get('me/wishlist')
  getWishlist(@Req() req: AuthRequest) {
    return this.collections.getWishlist(req.user.userId);
  }

  @Post('wishlist/:deviceId')
  addWishlist(
    @Req() req: AuthRequest,
    @Param('deviceId', ParseIntPipe) deviceId: number,
    @Body() dto: UpsertWishlistDto,
  ) {
    return this.collections.addWishlistItem(req.user.userId, deviceId, dto);
  }

  @Patch('wishlist/:deviceId')
  updateWishlist(
    @Req() req: AuthRequest,
    @Param('deviceId', ParseIntPipe) deviceId: number,
    @Body() dto: UpsertWishlistDto,
  ) {
    return this.collections.updateWishlistItem(req.user.userId, deviceId, dto);
  }

  @Delete('wishlist/:deviceId')
  removeWishlist(
    @Req() req: AuthRequest,
    @Param('deviceId', ParseIntPipe) deviceId: number,
  ) {
    return this.collections.removeWishlistItem(req.user.userId, deviceId);
  }

  @Get('me/notifications')
  getNotifications(
    @Req() req: AuthRequest,
    @Query('scope') scope?: string,
  ) {
    const normalized: 'all' | 'replies' = scope === 'replies' ? 'replies' : 'all';
    return this.collections.getNotifications(req.user.userId, 50, normalized);
  }

  @Patch('me/notifications/:id/read')
  markNotificationRead(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.collections.markNotificationRead(req.user.userId, id);
  }

  @Post('me/notifications/read-all')
  markAllNotificationsRead(
    @Req() req: AuthRequest,
    @Query('scope') scope?: string,
  ) {
    const normalized: 'all' | 'replies' = scope === 'replies' ? 'replies' : 'all';
    return this.collections.markAllNotificationsRead(req.user.userId, normalized);
  }

  @Delete('me/notifications/:id')
  deleteNotification(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.collections.deleteNotification(req.user.userId, id);
  }

  @Delete('me/notifications')
  clearAllNotifications(@Req() req: AuthRequest) {
    return this.collections.clearAllNotifications(req.user.userId);
  }

  @Get('me/polls')
  getPolls(@Req() req: AuthRequest) {
    return this.collections.getPollVotes(req.user.userId);
  }

  @Post('favorite-brands/:brandId')
  addFavoriteBrand(
    @Req() req: AuthRequest,
    @Param('brandId', ParseIntPipe) brandId: number,
  ) {
    return this.profileService.addFavoriteBrand(req.user.userId, brandId);
  }

  @Delete('favorite-brands/:brandId')
  removeFavoriteBrand(
    @Req() req: AuthRequest,
    @Param('brandId', ParseIntPipe) brandId: number,
  ) {
    return this.profileService.removeFavoriteBrand(req.user.userId, brandId);
  }

  @Get('me/comparisons')
  getSavedComparisons(@Req() req: AuthRequest) {
    return this.collections.getSavedComparisons(req.user.userId);
  }

  @Post('me/comparisons')
  saveComparison(@Req() req: AuthRequest, @Body() dto: SaveComparisonDto) {
    return this.collections.saveComparison(
      req.user.userId,
      dto.deviceSlugs,
      dto.name,
    );
  }

  @Delete('me/comparisons/:id')
  deleteSavedComparison(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.collections.deleteSavedComparison(req.user.userId, id);
  }

  @Get('me/search-history')
  getSearchHistory(@Req() req: AuthRequest) {
    return this.collections.getSearchHistory(req.user.userId);
  }

  @Post('me/search-history')
  addSearchHistory(@Req() req: AuthRequest, @Body() dto: AddSearchHistoryDto) {
    return this.collections.addSearchHistory(req.user.userId, dto.query);
  }

  @Delete('me/search-history')
  clearSearchHistory(@Req() req: AuthRequest) {
    return this.collections.clearSearchHistory(req.user.userId);
  }

  @Delete('me/search-history/:id')
  removeSearchHistory(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.collections.removeSearchHistory(req.user.userId, id);
  }
}
