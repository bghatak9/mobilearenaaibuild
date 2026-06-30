import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PollType, UserRole } from '@prisma/client';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import {
  CreateCommunityReviewDto,
  ReplyCommunityReviewDto,
} from './dto/create-community-review.dto';
import { CreateDiscussionDto, CreateReportDto, VotePollDto } from './dto/vote-poll.dto';
import { CommunityService } from './community.service';

interface AuthRequest {
  user: { userId: number; email: string; role: UserRole };
}

@Controller('community')
export class CommunityController {
  constructor(private readonly community: CommunityService) {}

  @Get('polls/active')
  getActivePoll() {
    return this.community.getActivePollWithResults();
  }

  @Get('polls')
  listPolls(@Query('type') type?: PollType) {
    return this.community.listPolls(type);
  }

  @Post('polls/vote')
  @UseGuards(JwtAuthGuard)
  votePoll(@Req() req: AuthRequest, @Body() dto: VotePollDto) {
    return this.community.votePoll(req.user.userId, dto);
  }

  @Get('reviews')
  listReviews(@Query('deviceId') deviceId?: string) {
    return this.community.listCommunityReviews(
      deviceId ? +deviceId : undefined,
    );
  }

  @Get('reviews/top-reviewers')
  topReviewers() {
    return this.community.topReviewers();
  }

  @Post('reviews')
  @UseGuards(JwtAuthGuard)
  createReview(@Req() req: AuthRequest, @Body() dto: CreateCommunityReviewDto) {
    return this.community.createCommunityReview(req.user.userId, dto);
  }

  @Post('reviews/:id/replies')
  @UseGuards(JwtAuthGuard)
  replyToReview(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReplyCommunityReviewDto,
  ) {
    return this.community.replyToReview(req.user.userId, id, dto);
  }

  @Post('reviews/:id/helpful')
  @UseGuards(JwtAuthGuard)
  voteHelpful(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.community.voteReviewHelpful(req.user.userId, id);
  }

  @Post('reports')
  @UseGuards(JwtAuthGuard)
  createReport(@Req() req: AuthRequest, @Body() dto: CreateReportDto) {
    return this.community.createReport(req.user.userId, dto);
  }

  @Get('reports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MODERATOR,
  )
  listReports() {
    return this.community.listOpenReports();
  }

  @Post('reports/:id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MODERATOR,
  )
  reviewReport(
    @Param('id') id: string,
    @Body() body: { status: 'REVIEWED' | 'DISMISSED'; notes?: string },
  ) {
    return this.community.reviewReport(+id, body.status, body.notes);
  }

  @Get('discussions')
  listDiscussions() {
    return this.community.listDiscussions();
  }

  @Post('discussions')
  @UseGuards(JwtAuthGuard)
  createDiscussion(@Req() req: AuthRequest, @Body() dto: CreateDiscussionDto) {
    return this.community.createDiscussion(req.user.userId, dto);
  }
}
