import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PollType, ReportEntityType, ReportStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/slug';
import {
  CreateCommunityReviewDto,
  ReplyCommunityReviewDto,
} from './dto/create-community-review.dto';
import { CreateDiscussionDto, CreateReportDto, VotePollDto } from './dto/vote-poll.dto';

type PollChoice = { id: string; label: string };

type PollSeed = {
  slug: string;
  question: string;
  pollType: PollType;
  choices: PollChoice[];
};

const COMMUNITY_POLLS: PollSeed[] = [
  {
    slug: 'best-camera-2026',
    question: 'Best Camera Phone 2026?',
    pollType: PollType.DEVICE,
    choices: [
      { id: 'nimbus-arc-ultra', label: 'Nimbus Arc Ultra' },
      { id: 'volt-stride-pro', label: 'Volt Stride Pro' },
      { id: 'prism-horizon', label: 'Prism Horizon' },
      { id: 'orbit-prism-mini', label: 'Orbit Prism Mini' },
    ],
  },
  {
    slug: 'best-gaming-under-30k',
    question: 'Best Gaming Phone Under ₹30K?',
    pollType: PollType.DEVICE,
    choices: [
      { id: 'volt-spark', label: 'Volt Spark' },
      { id: 'nimbus-play', label: 'Nimbus Play' },
      { id: 'orbit-edge', label: 'Orbit Edge' },
      { id: 'prism-rush', label: 'Prism Rush' },
    ],
  },
  {
    slug: 'best-battery-champion',
    question: 'Best Battery Champion?',
    pollType: PollType.DEVICE,
    choices: [
      { id: 'volt-endura', label: 'Volt Endura' },
      { id: 'nimbus-dayshift', label: 'Nimbus Dayshift' },
      { id: 'orbit-marathon', label: 'Orbit Marathon' },
      { id: 'prism-cellmax', label: 'Prism CellMax' },
    ],
  },
  {
    slug: 'best-foldable-device',
    question: 'Best Foldable Device?',
    pollType: PollType.DEVICE,
    choices: [
      { id: 'echo-slate-fold', label: 'Echo Slate Fold' },
      { id: 'orbit-prism-fold', label: 'Orbit Prism Fold' },
      { id: 'nimbus-duo', label: 'Nimbus Duo' },
      { id: 'volt-flex', label: 'Volt Flex' },
    ],
  },
  {
    slug: 'phone-of-the-week',
    question: 'Phone of the Week',
    pollType: PollType.WEEKLY,
    choices: [
      { id: 'volt-stride-pro', label: 'Volt Stride Pro' },
      { id: 'nimbus-arc-ultra', label: 'Nimbus Arc Ultra' },
      { id: 'prism-horizon', label: 'Prism Horizon' },
      { id: 'orbit-prism-mini', label: 'Orbit Prism Mini' },
    ],
  },
  {
    slug: 'brand-of-the-month',
    question: 'Brand of the Month',
    pollType: PollType.WEEKLY,
    choices: [
      { id: 'volt-mobile', label: 'Volt Mobile' },
      { id: 'nimbus-tech', label: 'Nimbus Tech' },
      { id: 'orbit-devices', label: 'Orbit Devices' },
      { id: 'prism-labs', label: 'Prism Labs' },
    ],
  },
  {
    slug: 'favorite-android-skin',
    question: 'Favorite ArenaOS Skin',
    pollType: PollType.WEEKLY,
    choices: [
      { id: 'arenaos', label: 'ArenaOS Pure' },
      { id: 'volt-ui', label: 'Volt UI' },
      { id: 'nimbus-skin', label: 'Nimbus Skin' },
      { id: 'prism-flow', label: 'Prism Flow' },
    ],
  },
  {
    slug: 'most-anticipated-launch',
    question: 'Most Anticipated Launch',
    pollType: PollType.WEEKLY,
    choices: [
      { id: 'prism-horizon-max', label: 'Prism Horizon Max' },
      { id: 'echo-slate-fold', label: 'Echo Slate Fold' },
      { id: 'volt-ember-lite', label: 'Volt Ember Lite' },
      { id: 'nimbus-arc-2', label: 'Nimbus Arc 2' },
    ],
  },
  {
    slug: 'volt-stride-vs-nimbus-arc',
    question: 'Volt Stride Pro vs Nimbus Arc Ultra',
    pollType: PollType.COMPARISON,
    choices: [
      { id: 'volt-stride-pro', label: 'Volt Stride Pro' },
      { id: 'nimbus-arc-ultra', label: 'Nimbus Arc Ultra' },
    ],
  },
];

export const REVIEW_CATEGORIES = [
  'camera',
  'battery',
  'performance',
  'display',
  'audio',
  'build',
  'software',
  'value',
] as const;

@Injectable()
export class CommunityService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    for (const poll of COMMUNITY_POLLS) {
      await this.prisma.poll.upsert({
        where: { slug: poll.slug },
        create: {
          slug: poll.slug,
          question: poll.question,
          pollType: poll.pollType,
          choices: poll.choices,
          active: true,
        },
        update: {
          question: poll.question,
          pollType: poll.pollType,
          choices: poll.choices,
          active: true,
        },
      });
    }
  }

  private async pollResults(slug: string) {
    const poll = await this.prisma.poll.findUnique({ where: { slug } });
    if (!poll) return null;

    const choices = poll.choices as PollChoice[];
    const votes = await this.prisma.userPollVote.groupBy({
      by: ['choice'],
      where: { pollSlug: poll.slug },
      _count: { choice: true },
    });

    const total = votes.reduce((sum, v) => sum + v._count.choice, 0);
    const counts = new Map(votes.map((v) => [v.choice, v._count.choice]));

    return {
      slug: poll.slug,
      question: poll.question,
      pollType: poll.pollType,
      choices: choices.map((c) => {
        const count = counts.get(c.id) ?? 0;
        return {
          ...c,
          votes: count,
          pct: total > 0 ? Math.round((count / total) * 100) : 0,
        };
      }),
      totalVotes: total,
    };
  }

  async getActivePollWithResults() {
    const poll = await this.prisma.poll.findFirst({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });
    if (!poll) return null;
    return this.pollResults(poll.slug);
  }

  async listPolls(type?: PollType) {
    const polls = await this.prisma.poll.findMany({
      where: { active: true, ...(type ? { pollType: type } : {}) },
      orderBy: { createdAt: 'asc' },
    });

    const results = await Promise.all(
      polls.map((p) => this.pollResults(p.slug)),
    );
    return results.filter(Boolean);
  }

  async votePoll(userId: number, dto: VotePollDto) {
    const poll = await this.prisma.poll.findUnique({
      where: { slug: dto.pollSlug },
    });
    if (!poll || !poll.active) {
      throw new NotFoundException('Poll not found');
    }

    const choices = poll.choices as PollChoice[];
    if (!choices.some((c) => c.id === dto.choiceId)) {
      throw new BadRequestException('Invalid poll choice');
    }

    const existing = await this.prisma.userPollVote.findUnique({
      where: { userId_pollSlug: { userId, pollSlug: poll.slug } },
    });
    if (existing) {
      throw new ConflictException('You already voted on this poll');
    }

    await this.prisma.userPollVote.create({
      data: {
        userId,
        pollSlug: poll.slug,
        pollTitle: poll.question,
        choice: dto.choiceId,
      },
    });

    return this.pollResults(poll.slug);
  }

  async listCommunityReviews(deviceId?: number) {
    return this.prisma.communityReview.findMany({
      where: {
        parentId: null,
        ...(deviceId ? { deviceId } : {}),
      },
      orderBy: [{ helpfulCount: 'desc' }, { createdAt: 'desc' }],
      take: 50,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        device: { select: { id: true, name: true, slug: true } },
        replies: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async createCommunityReview(userId: number, dto: CreateCommunityReviewDto) {
    const device = await this.prisma.device.findFirst({
      where: { id: dto.deviceId, deletedAt: null },
    });
    if (!device) throw new NotFoundException('Device not found');

    for (const key of REVIEW_CATEGORIES) {
      const score = dto.categoryScores[key];
      if (score == null || score < 1 || score > 5) {
        throw new BadRequestException(`Invalid score for ${key}`);
      }
    }

    try {
      const existing = await this.prisma.communityReview.findFirst({
        where: { userId, deviceId: dto.deviceId, parentId: null },
      });
      if (existing) {
        throw new ConflictException('You already reviewed this device');
      }

      return await this.prisma.communityReview.create({
        data: {
          userId,
          deviceId: dto.deviceId,
          overallStars: dto.overallStars,
          categoryScores: dto.categoryScores,
          body: dto.body.trim(),
          verifiedOwner: dto.verifiedOwner ?? false,
          photoUrls: dto.photoUrls ?? [],
          videoUrls: dto.videoUrls ?? [],
        },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          device: { select: { id: true, name: true, slug: true } },
        },
      });
    } catch (err) {
      if (err instanceof ConflictException) throw err;
      throw new BadRequestException('Could not create review');
    }
  }

  async replyToReview(
    userId: number,
    reviewId: number,
    dto: ReplyCommunityReviewDto,
  ) {
    const parent = await this.prisma.communityReview.findUnique({
      where: { id: reviewId },
    });
    if (!parent || parent.parentId) {
      throw new NotFoundException('Review not found');
    }

    return this.prisma.communityReview.create({
      data: {
        userId,
        deviceId: parent.deviceId,
        overallStars: parent.overallStars,
        categoryScores: parent.categoryScores as object,
        body: dto.body.trim(),
        parentId: parent.id,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });
  }

  async voteReviewHelpful(userId: number, reviewId: number) {
    const review = await this.prisma.communityReview.findUnique({
      where: { id: reviewId },
    });
    if (!review) throw new NotFoundException('Review not found');

    try {
      await this.prisma.communityReviewHelpful.create({
        data: { userId, reviewId },
      });
      await this.prisma.communityReview.update({
        where: { id: reviewId },
        data: { helpfulCount: { increment: 1 } },
      });
    } catch {
      throw new ConflictException('You already marked this review helpful');
    }

    return { helpfulCount: review.helpfulCount + 1 };
  }

  async topReviewers(limit = 10) {
    const rows = await this.prisma.communityReview.groupBy({
      by: ['userId'],
      where: { parentId: null },
      _count: { id: true },
      _sum: { helpfulCount: true },
      orderBy: { _sum: { helpfulCount: 'desc' } },
      take: limit,
    });

    const users = await this.prisma.user.findMany({
      where: { id: { in: rows.map((r) => r.userId) } },
      select: { id: true, name: true, avatar: true, reputationPoints: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    return rows.map((r, i) => ({
      rank: i + 1,
      reviewCount: r._count.id,
      helpfulTotal: r._sum.helpfulCount ?? 0,
      user: userMap.get(r.userId) ?? null,
    }));
  }

  async createReport(reporterId: number, dto: CreateReportDto) {
    return this.prisma.contentReport.create({
      data: {
        reporterId,
        entityType: dto.entityType as ReportEntityType,
        entityId: dto.entityId,
        reason: dto.reason.trim(),
      },
    });
  }

  async listOpenReports() {
    return this.prisma.contentReport.findMany({
      where: { status: ReportStatus.OPEN },
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { id: true, email: true, name: true } },
      },
    });
  }

  async reviewReport(
    id: number,
    status: 'REVIEWED' | 'DISMISSED',
    notes?: string,
  ) {
    const report = await this.prisma.contentReport.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('Report not found');

    return this.prisma.contentReport.update({
      where: { id },
      data: {
        status: status as ReportStatus,
        notes: notes?.trim() || null,
      },
    });
  }

  async listDiscussions() {
    return this.prisma.discussion.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        device: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async createDiscussion(userId: number, dto: CreateDiscussionDto) {
    const base = slugify(dto.title);
    let slug = base;
    let n = 1;
    while (await this.prisma.discussion.findUnique({ where: { slug } })) {
      slug = `${base}-${n++}`;
    }

    return this.prisma.discussion.create({
      data: {
        slug,
        title: dto.title.trim(),
        body: dto.body.trim(),
        userId,
        deviceId: dto.deviceId ?? null,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        device: { select: { id: true, name: true, slug: true } },
      },
    });
  }
}
