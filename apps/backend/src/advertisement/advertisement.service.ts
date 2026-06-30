import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AdCampaignStatus,
  AdEventType,
  Prisma,
} from '@prisma/client';

import { slugify } from '../common/slug';
import {
  AD_CATEGORIES,
  AD_PLACEMENTS,
  AD_PRIORITY_MATRIX,
} from './ad-catalog';
import { PrismaService } from '../prisma/prisma.service';
import { countryName } from '../analytics/country-names';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';
import { RevenueReportQueryDto } from './dto/revenue-query.dto';
import { UpdateAdvertisementDto } from './dto/update-ad.dto';
import { TrackImpressionDto } from './dto/track-impression.dto';

type ScheduleWindow = {
  startsAt: Date | null;
  endsAt: Date | null;
};

@Injectable()
export class AdvertisementService {
  constructor(private readonly prisma: PrismaService) {}

  getCatalog() {
    return {
      categories: AD_CATEGORIES,
      placements: AD_PLACEMENTS,
      priorityMatrix: AD_PRIORITY_MATRIX,
    };
  }

  private effectiveSchedule(
    ad: {
      startsAt: Date | null;
      endsAt: Date | null;
      campaign?: { startsAt: Date | null; endsAt: Date | null; status: AdCampaignStatus } | null;
    },
  ): ScheduleWindow {
    const campaign = ad.campaign;
    if (campaign?.status === AdCampaignStatus.PAUSED) {
      return { startsAt: new Date(8640000000000000), endsAt: null };
    }
    return {
      startsAt: ad.startsAt ?? campaign?.startsAt ?? null,
      endsAt: ad.endsAt ?? campaign?.endsAt ?? null,
    };
  }

  private isWithinSchedule(window: ScheduleWindow, now = new Date()): boolean {
    if (window.startsAt && window.startsAt > now) return false;
    if (window.endsAt && window.endsAt < now) return false;
    return true;
  }

  findActive(filters?: { placement?: string; adType?: string }) {
    const now = new Date();
    return this.prisma.paidAdvertisement
      .findMany({
        where: {
          active: true,
          deletedAt: null,
          ...(filters?.placement ? { placement: filters.placement } : {}),
          ...(filters?.adType ? { adType: filters.adType } : {}),
          OR: [
            { campaignId: null },
            {
              campaign: {
                status: { in: [AdCampaignStatus.ACTIVE, AdCampaignStatus.SCHEDULED] },
              },
            },
          ],
        },
        include: {
          campaign: {
            select: {
              id: true,
              name: true,
              status: true,
              startsAt: true,
              endsAt: true,
            },
          },
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      })
      .then((ads) =>
        ads.filter((ad) => this.isWithinSchedule(this.effectiveSchedule(ad), now)),
      );
  }

  async recordImpression(adId: number, dto: TrackImpressionDto) {
    const ad = await this.prisma.paidAdvertisement.findFirst({
      where: { id: adId, deletedAt: null, active: true },
      select: { id: true, campaignId: true },
    });
    if (!ad) return { ok: false };

    const countryCode = dto.countryCode?.trim().toUpperCase() || null;

    await this.prisma.$transaction([
      this.prisma.adEvent.create({
        data: {
          advertisementId: ad.id,
          campaignId: ad.campaignId,
          eventType: AdEventType.IMPRESSION,
          placement: dto.placement?.trim() || null,
          path: dto.path?.trim() || null,
          visitorId: dto.visitorId?.trim() || null,
          countryCode,
        },
      }),
      this.prisma.paidAdvertisement.update({
        where: { id: ad.id },
        data: { impressionCount: { increment: 1 } },
      }),
    ]);

    return { ok: true };
  }

  async recordClick(adId: number, placement?: string, countryCode?: string) {
    const ad = await this.prisma.paidAdvertisement.findFirst({
      where: { id: adId, deletedAt: null },
      select: { id: true, link: true, campaignId: true },
    });
    if (!ad) throw new NotFoundException('Advertisement not found');

    const normalizedCountry =
      countryCode?.trim().toUpperCase().match(/^[A-Z]{2}$/)?.[0] ?? null;

    await this.prisma.$transaction([
      this.prisma.adEvent.create({
        data: {
          advertisementId: ad.id,
          campaignId: ad.campaignId,
          eventType: AdEventType.CLICK,
          placement: placement?.trim() || null,
          countryCode: normalizedCountry,
        },
      }),
      this.prisma.paidAdvertisement.update({
        where: { id: ad.id },
        data: { clickCount: { increment: 1 } },
      }),
    ]);

    return ad.link;
  }

  listCampaigns() {
    return this.prisma.adCampaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { advertisements: true } },
        createdBy: { select: { id: true, email: true } },
      },
    });
  }

  async createCampaign(dto: CreateCampaignDto, createdById: number) {
    const slug = slugify(dto.name);
    const existing = await this.prisma.adCampaign.findUnique({ where: { slug } });
    if (existing) {
      throw new BadRequestException('A campaign with this name already exists');
    }

    return this.prisma.adCampaign.create({
      data: {
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim() || null,
        advertiser: dto.advertiser?.trim() || null,
        budget: dto.budget ?? null,
        cpm: dto.cpm ?? null,
        cpc: dto.cpc ?? null,
        revenueGoal: dto.revenueGoal ?? null,
        status: dto.status ?? AdCampaignStatus.DRAFT,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        createdById,
      },
    });
  }

  async updateCampaign(id: number, dto: UpdateCampaignDto) {
    const campaign = await this.prisma.adCampaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    let slug = campaign.slug;
    if (dto.name && dto.name.trim() !== campaign.name) {
      slug = slugify(dto.name);
      const clash = await this.prisma.adCampaign.findFirst({
        where: { slug, NOT: { id } },
      });
      if (clash) throw new BadRequestException('Campaign name already in use');
    }

    return this.prisma.adCampaign.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim(), slug } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description?.trim() || null }
          : {}),
        ...(dto.advertiser !== undefined
          ? { advertiser: dto.advertiser?.trim() || null }
          : {}),
        ...(dto.budget !== undefined ? { budget: dto.budget } : {}),
        ...(dto.cpm !== undefined ? { cpm: dto.cpm } : {}),
        ...(dto.cpc !== undefined ? { cpc: dto.cpc } : {}),
        ...(dto.revenueGoal !== undefined ? { revenueGoal: dto.revenueGoal } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.startsAt !== undefined
          ? { startsAt: dto.startsAt ? new Date(dto.startsAt) : null }
          : {}),
        ...(dto.endsAt !== undefined
          ? { endsAt: dto.endsAt ? new Date(dto.endsAt) : null }
          : {}),
      },
    });
  }

  async deleteCampaign(id: number) {
    const campaign = await this.prisma.adCampaign.findUnique({
      where: { id },
      include: { _count: { select: { advertisements: true } } },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');

    await this.prisma.$transaction([
      this.prisma.paidAdvertisement.updateMany({
        where: { campaignId: id },
        data: { campaignId: null },
      }),
      this.prisma.adCampaign.delete({ where: { id } }),
    ]);

    return { ok: true };
  }

  listManagedAds() {
    return this.prisma.paidAdvertisement.findMany({
      where: { deletedAt: null },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            status: true,
            startsAt: true,
            endsAt: true,
          },
        },
      },
    });
  }

  async updateAdvertisement(id: number, dto: UpdateAdvertisementDto) {
    const ad = await this.prisma.paidAdvertisement.findFirst({
      where: { id, deletedAt: null },
    });
    if (!ad) throw new NotFoundException('Advertisement not found');

    if (dto.campaignId) {
      const campaign = await this.prisma.adCampaign.findUnique({
        where: { id: dto.campaignId },
      });
      if (!campaign) throw new BadRequestException('Campaign not found');
    }

    return this.prisma.paidAdvertisement.update({
      where: { id },
      data: {
        ...(dto.active !== undefined ? { active: dto.active } : {}),
        ...(dto.startsAt !== undefined
          ? { startsAt: dto.startsAt ? new Date(dto.startsAt) : null }
          : {}),
        ...(dto.endsAt !== undefined
          ? { endsAt: dto.endsAt ? new Date(dto.endsAt) : null }
          : {}),
        ...(dto.campaignId !== undefined ? { campaignId: dto.campaignId } : {}),
        ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
        ...(dto.placement !== undefined ? { placement: dto.placement } : {}),
      },
      include: {
        campaign: {
          select: { id: true, name: true, status: true, startsAt: true, endsAt: true },
        },
      },
    });
  }

  private estimateRevenue(
    impressions: number,
    clicks: number,
    cpm: number | null,
    cpc: number | null,
  ): number {
    const fromImpressions = cpm ? (impressions / 1000) * cpm : 0;
    const fromClicks = cpc ? clicks * cpc : 0;
    return Math.round((fromImpressions + fromClicks) * 100) / 100;
  }

  private revenueCategory(ad: {
    adType: string;
    sponsored: boolean;
    placement: string;
  }): 'affiliate' | 'sponsored' | 'ad' {
    if (ad.adType === 'affiliate' || ad.placement.startsWith('affiliate-')) {
      return 'affiliate';
    }
    if (ad.adType === 'sponsored' || ad.sponsored) {
      return 'sponsored';
    }
    return 'ad';
  }

  private affiliateEarnings(clicks: number, cpc: number | null): number {
    const rate = cpc && cpc > 0 ? cpc : 2.5;
    return Math.round(clicks * rate * 100) / 100;
  }

  private buildRevenueAnalytics(
    ads: {
      id: number;
      title: string;
      placement: string;
      adType: string;
      sponsored: boolean;
      advertiser: string | null;
      budget: number | null;
      impressionCount: number;
      clickCount: number;
      campaign: {
        name: string;
        cpm: number | null;
        cpc: number | null;
        budget: number | null;
        revenueGoal: number | null;
        status: string;
      } | null;
    }[],
    byCampaign: {
      id: number;
      name: string;
      status: string;
      advertiser: string | null;
      budget: number | null;
      revenueGoal: number | null;
      impressions: number;
      clicks: number;
      ctr: number;
      estimatedRevenue: number;
      goalProgress: number | null;
    }[],
  ) {
    type Bucket = {
      impressions: number;
      clicks: number;
      revenue: number;
      adCount: number;
    };
    const adBucket: Bucket = { impressions: 0, clicks: 0, revenue: 0, adCount: 0 };
    const affiliateBucket: Bucket = { impressions: 0, clicks: 0, revenue: 0, adCount: 0 };
    const sponsoredBucket: Bucket = {
      impressions: 0,
      clicks: 0,
      revenue: 0,
      adCount: 0,
    };

    const adByType = new Map<string, Bucket>();
    const affiliateByPlacement = new Map<string, Bucket & { placement: string }>();
    const sponsoredByAd: {
      id: number;
      title: string;
      advertiser: string | null;
      impressions: number;
      clicks: number;
      revenue: number;
    }[] = [];

    for (const ad of ads) {
      const category = this.revenueCategory(ad);
      const cpm = ad.campaign?.cpm ?? null;
      const cpc = ad.campaign?.cpc ?? null;

      let revenue: number;
      if (category === 'affiliate') {
        revenue = this.affiliateEarnings(ad.clickCount, cpc);
      } else {
        revenue = this.estimateRevenue(ad.impressionCount, ad.clickCount, cpm, cpc);
      }

      const target =
        category === 'affiliate'
          ? affiliateBucket
          : category === 'sponsored'
            ? sponsoredBucket
            : adBucket;

      target.impressions += ad.impressionCount;
      target.clicks += ad.clickCount;
      target.revenue += revenue;
      target.adCount += 1;

      if (category === 'ad') {
        const typeKey = ad.adType || 'display';
        const row = adByType.get(typeKey) ?? {
          impressions: 0,
          clicks: 0,
          revenue: 0,
          adCount: 0,
        };
        row.impressions += ad.impressionCount;
        row.clicks += ad.clickCount;
        row.revenue += revenue;
        row.adCount += 1;
        adByType.set(typeKey, row);
      } else if (category === 'affiliate') {
        const key = ad.placement;
        const row = affiliateByPlacement.get(key) ?? {
          placement: key,
          impressions: 0,
          clicks: 0,
          revenue: 0,
          adCount: 0,
        };
        row.impressions += ad.impressionCount;
        row.clicks += ad.clickCount;
        row.revenue += revenue;
        row.adCount += 1;
        affiliateByPlacement.set(key, row);
      } else {
        sponsoredByAd.push({
          id: ad.id,
          title: ad.title,
          advertiser: ad.advertiser,
          impressions: ad.impressionCount,
          clicks: ad.clickCount,
          revenue,
        });
      }
    }

    const ctr = (b: Bucket) =>
      b.impressions > 0 ? Math.round((b.clicks / b.impressions) * 10000) / 100 : 0;

    const campaignPerformance = byCampaign.map((c) => {
      const budgetUsedPct =
        c.budget && c.budget > 0
          ? Math.round((c.estimatedRevenue / c.budget) * 10000) / 100
          : null;
      const performanceScore = Math.min(
        100,
        Math.round(
          ((c.goalProgress ?? 0) * 0.5 +
            Math.min(c.ctr, 10) * 5 +
            (budgetUsedPct != null ? Math.min(budgetUsedPct, 100) * 0.3 : 0)) *
            10,
        ) / 10,
      );
      return {
        ...c,
        budgetUsedPct,
        performanceScore,
        roi:
          c.budget && c.budget > 0
            ? Math.round((c.estimatedRevenue / c.budget) * 10000) / 100
            : null,
      };
    });

    return {
      adRevenue: {
        total: Math.round(adBucket.revenue * 100) / 100,
        impressions: adBucket.impressions,
        clicks: adBucket.clicks,
        ctr: ctr(adBucket),
        adCount: adBucket.adCount,
        byAdType: [...adByType.entries()]
          .map(([adType, stats]) => ({
            adType,
            ...stats,
            revenue: Math.round(stats.revenue * 100) / 100,
            ctr: ctr(stats),
          }))
          .sort((a, b) => b.revenue - a.revenue),
      },
      affiliateEarnings: {
        total: Math.round(affiliateBucket.revenue * 100) / 100,
        impressions: affiliateBucket.impressions,
        clicks: affiliateBucket.clicks,
        ctr: ctr(affiliateBucket),
        adCount: affiliateBucket.adCount,
        byPlacement: [...affiliateByPlacement.values()]
          .map((row) => ({
            ...row,
            revenue: Math.round(row.revenue * 100) / 100,
            ctr: ctr(row),
          }))
          .sort((a, b) => b.revenue - a.revenue),
      },
      sponsoredContentIncome: {
        total: Math.round(sponsoredBucket.revenue * 100) / 100,
        impressions: sponsoredBucket.impressions,
        clicks: sponsoredBucket.clicks,
        ctr: ctr(sponsoredBucket),
        activeDeals: sponsoredBucket.adCount,
        byAd: sponsoredByAd.sort((a, b) => b.revenue - a.revenue),
      },
      campaignPerformance: campaignPerformance.sort(
        (a, b) => b.performanceScore - a.performanceScore,
      ),
    };
  }

  async getRevenueReport(query: RevenueReportQueryDto = {}) {
    const fromDate = query.from
      ? new Date(`${query.from}T00:00:00.000Z`)
      : undefined;
    const toDate = query.to
      ? new Date(`${query.to}T23:59:59.999Z`)
      : undefined;
    const country =
      query.country && query.country.toUpperCase() !== 'ALL'
        ? query.country.toUpperCase()
        : undefined;

    const eventWhere: Prisma.AdEventWhereInput = {};
    if (fromDate || toDate) {
      eventWhere.createdAt = {
        ...(fromDate ? { gte: fromDate } : {}),
        ...(toDate ? { lte: toDate } : {}),
      };
    }
    if (country) {
      eventWhere.countryCode = country;
    }

    const useEventStats = !!(fromDate || toDate || country);

    const [campaigns, ads, events, allCountryEvents] = await Promise.all([
      this.prisma.adCampaign.findMany({
        include: {
          advertisements: {
            where: { deletedAt: null },
            select: {
              id: true,
              title: true,
              impressionCount: true,
              clickCount: true,
            },
          },
        },
      }),
      this.prisma.paidAdvertisement.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          title: true,
          placement: true,
          adType: true,
          sponsored: true,
          advertiser: true,
          budget: true,
          impressionCount: true,
          clickCount: true,
          campaignId: true,
          campaign: {
            select: {
              name: true,
              cpm: true,
              cpc: true,
              budget: true,
              revenueGoal: true,
              status: true,
            },
          },
        },
      }),
      useEventStats
        ? this.prisma.adEvent.findMany({
            where: eventWhere,
            select: {
              advertisementId: true,
              eventType: true,
              createdAt: true,
            },
          })
        : Promise.resolve([]),
      this.prisma.adEvent.findMany({
        where: {
          ...(fromDate || toDate
            ? {
                createdAt: {
                  ...(fromDate ? { gte: fromDate } : {}),
                  ...(toDate ? { lte: toDate } : {}),
                },
              }
            : {}),
        },
        select: { eventType: true, countryCode: true },
      }),
    ]);

    const metricsByAd = new Map<number, { impressions: number; clicks: number }>();
    const dailyMap = new Map<string, { impressions: number; clicks: number }>();

    for (const ev of events) {
      const row = metricsByAd.get(ev.advertisementId) ?? {
        impressions: 0,
        clicks: 0,
      };
      if (ev.eventType === AdEventType.IMPRESSION) row.impressions++;
      else row.clicks++;
      metricsByAd.set(ev.advertisementId, row);

      const day = ev.createdAt.toISOString().slice(0, 10);
      const daily = dailyMap.get(day) ?? { impressions: 0, clicks: 0 };
      if (ev.eventType === AdEventType.IMPRESSION) daily.impressions++;
      else daily.clicks++;
      dailyMap.set(day, daily);
    }

    const resolveMetrics = (adId: number, impressions: number, clicks: number) =>
      useEventStats
        ? (metricsByAd.get(adId) ?? { impressions: 0, clicks: 0 })
        : { impressions, clicks };

    const adsForAnalytics = ads.map((ad) => {
      const metrics = resolveMetrics(
        ad.id,
        ad.impressionCount,
        ad.clickCount,
      );
      return {
        ...ad,
        impressionCount: metrics.impressions,
        clickCount: metrics.clicks,
      };
    });

    const byCampaign = campaigns.map((c) => {
      let impressions = 0;
      let clicks = 0;
      for (const ad of c.advertisements) {
        const metrics = resolveMetrics(
          ad.id,
          ad.impressionCount,
          ad.clickCount,
        );
        impressions += metrics.impressions;
        clicks += metrics.clicks;
      }
      const estimatedRevenue = this.estimateRevenue(
        impressions,
        clicks,
        c.cpm,
        c.cpc,
      );
      return {
        id: c.id,
        name: c.name,
        status: c.status,
        advertiser: c.advertiser,
        budget: c.budget,
        revenueGoal: c.revenueGoal,
        cpm: c.cpm,
        cpc: c.cpc,
        startsAt: c.startsAt,
        endsAt: c.endsAt,
        adCount: c.advertisements.length,
        impressions,
        clicks,
        ctr:
          impressions > 0
            ? Math.round((clicks / impressions) * 10000) / 100
            : 0,
        estimatedRevenue,
        goalProgress:
          c.revenueGoal && c.revenueGoal > 0
            ? Math.round((estimatedRevenue / c.revenueGoal) * 10000) / 100
            : null,
      };
    });

    const byAd = adsForAnalytics.map((a) => {
      const cpm = a.campaign?.cpm ?? null;
      const cpc = a.campaign?.cpc ?? null;
      const category = this.revenueCategory(a);
      const estimatedRevenue =
        category === 'affiliate'
          ? this.affiliateEarnings(a.clickCount, cpc)
          : this.estimateRevenue(
              a.impressionCount,
              a.clickCount,
              cpm,
              cpc,
            );
      return {
        id: a.id,
        title: a.title,
        placement: a.placement,
        adType: a.adType,
        advertiser: a.advertiser,
        campaignName: a.campaign?.name ?? null,
        impressions: a.impressionCount,
        clicks: a.clickCount,
        ctr:
          a.impressionCount > 0
            ? Math.round((a.clickCount / a.impressionCount) * 10000) / 100
            : 0,
        estimatedRevenue,
        revenueCategory: category,
      };
    });

    const totalImpressions = adsForAnalytics.reduce(
      (s, a) => s + a.impressionCount,
      0,
    );
    const totalClicks = adsForAnalytics.reduce((s, a) => s + a.clickCount, 0);
    const ctr =
      totalImpressions > 0
        ? Math.round((totalClicks / totalImpressions) * 10000) / 100
        : 0;

    const daily =
      useEventStats && dailyMap.size > 0
        ? [...dailyMap.entries()].map(([date, stats]) => ({ date, ...stats }))
        : [];

    const countryAgg = new Map<string, { impressions: number; clicks: number }>();
    for (const ev of allCountryEvents) {
      const code = ev.countryCode ?? 'Unknown';
      const row = countryAgg.get(code) ?? { impressions: 0, clicks: 0 };
      if (ev.eventType === AdEventType.IMPRESSION) row.impressions++;
      else row.clicks++;
      countryAgg.set(code, row);
    }
    const byCountry = [...countryAgg.entries()]
      .map(([code, stats]) => ({
        code,
        name: countryName(code),
        impressions: stats.impressions,
        clicks: stats.clicks,
      }))
      .sort((a, b) => b.impressions + b.clicks - (a.impressions + a.clicks));

    const totalEstimatedRevenue = byCampaign.reduce(
      (s, c) => s + c.estimatedRevenue,
      0,
    );

    const revenueAnalytics = this.buildRevenueAnalytics(
      adsForAnalytics,
      byCampaign,
    );

    return {
      summary: {
        totalImpressions,
        totalClicks,
        ctr,
        estimatedRevenue: Math.round(totalEstimatedRevenue * 100) / 100,
        activeCampaigns: campaigns.filter(
          (c) => c.status === AdCampaignStatus.ACTIVE,
        ).length,
        scheduledCampaigns: campaigns.filter(
          (c) => c.status === AdCampaignStatus.SCHEDULED,
        ).length,
        totalAds: ads.length,
        adRevenue: revenueAnalytics.adRevenue.total,
        affiliateEarnings: revenueAnalytics.affiliateEarnings.total,
        sponsoredContentIncome: revenueAnalytics.sponsoredContentIncome.total,
      },
      revenueAnalytics,
      byCampaign,
      byAd,
      byCountry,
      daily,
      filters: {
        from: fromDate?.toISOString() ?? null,
        to: toDate?.toISOString() ?? null,
        country: country ?? 'ALL',
      },
      generatedAt: new Date().toISOString(),
    };
  }
}
