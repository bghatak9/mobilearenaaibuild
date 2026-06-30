import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { Prisma } from '@prisma/client';
import * as geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';

import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { countryName } from './country-names';
import { TrackPageViewDto } from './dto/track-pageview.dto';
import { AnalyticsFilters } from './dto/analytics-query.dto';

export type LabeledCount = { label: string; count: number };

export type CountryStat = {
  code: string;
  name: string;
  visitors: number;
  pageViews: number;
};

export type CountryComparison = {
  code: string;
  name: string;
  visitors: number;
  pageViews: number;
  share: number;
};

export type AnalyticsDashboard = {
  liveNow: number;
  today: number;
  thisMonth: number;
  thisYear: number;
  allTime: number;
  byCountry: CountryStat[];
  topCountries: CountryStat[];
  topCities: LabeledCount[];
  topPages: LabeledCount[];
  devices: LabeledCount[];
  operatingSystems: LabeledCount[];
  browsers: LabeledCount[];
  referrers: LabeledCount[];
  comparison: CountryComparison[];
  filters: {
    from: string | null;
    to: string | null;
    country: string;
  };
  updatedAt: string;
};

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async track(dto: TrackPageViewDto, req: Request) {
    if (dto.path.startsWith('/admin')) {
      return { ok: true, skipped: true };
    }

    const ip = this.resolveIp(req);
    const geo = ip ? geoip.lookup(ip) : null;
    const ua = new UAParser(req.headers['user-agent']).getResult();

    const country =
      geo?.country ??
      this.countryFromHeaders(req) ??
      this.normalizeCountryCode(dto.countryCode) ??
      'Unknown';
    const city =
      geo?.city ??
      dto.city?.trim() ??
      'Unknown';

    const referrer = this.normalizeReferrer(
      dto.referrer ?? req.headers.referer ?? req.headers.referrer,
    );

    await this.prisma.pageView.create({
      data: {
        visitorId: dto.visitorId,
        path: dto.path,
        referrer,
        country,
        city,
        device: ua.device.type ?? 'desktop',
        os: ua.os.name ?? 'Unknown',
        browser: ua.browser.name ?? 'Unknown',
      },
    });

    await this.cache.markActiveVisitor(dto.visitorId);

    return { ok: true };
  }

  async getDashboard(filters: AnalyticsFilters = {}): Promise<AnalyticsDashboard> {
    const now = new Date();
    const where = this.buildWhere(filters);

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [liveFromRedis, today, thisMonth, thisYear, allTime] =
      await Promise.all([
        this.cache.countActiveVisitors(),
        this.countUniqueVisitors({ createdAt: { gte: startOfDay } }),
        this.countUniqueVisitors({ createdAt: { gte: startOfMonth } }),
        this.countUniqueVisitors({ createdAt: { gte: startOfYear } }),
        this.countUniqueVisitors({}),
      ]);

    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const liveFromDb = await this.countUniqueVisitors({
      createdAt: { gte: fiveMinAgo },
    });
    const liveNow = Math.max(liveFromRedis, liveFromDb);

    const [
      byCountry,
      topCities,
      topPages,
      devices,
      operatingSystems,
      browsers,
      referrers,
    ] = await Promise.all([
      this.getCountryStats(where),
      this.groupBy('city', 15, where),
      this.groupBy('path', 15, where),
      this.groupBy('device', 10, where),
      this.groupBy('os', 10, where),
      this.groupBy('browser', 10, where),
      this.groupBy('referrer', 15, where),
    ]);

    const compareA = filters.compareA ?? 'IN';
    const compareB = filters.compareB ?? 'US';
    const comparison = await this.compareCountries(where, compareA, compareB);

    return {
      liveNow,
      today,
      thisMonth,
      thisYear,
      allTime,
      byCountry,
      topCountries: byCountry.slice(0, 10),
      topCities,
      topPages,
      devices,
      operatingSystems,
      browsers,
      referrers,
      comparison,
      filters: {
        from: filters.from?.toISOString() ?? null,
        to: filters.to?.toISOString() ?? null,
        country: filters.country ?? 'ALL',
      },
      updatedAt: now.toISOString(),
    };
  }

  async exportCountryCsv(filters: AnalyticsFilters = {}): Promise<string> {
    const where = this.buildWhere(filters);
    const stats = await this.getCountryStats(where);

    const lines = [
      'Country Code,Country Name,Unique Visitors,Page Views',
      ...stats.map(
        (row) =>
          `${row.code},${this.csvEscape(row.name)},${row.visitors},${row.pageViews}`,
      ),
    ];
    return lines.join('\n');
  }

  private async compareCountries(
    baseWhere: Prisma.PageViewWhereInput,
    codeA: string,
    codeB: string,
  ): Promise<CountryComparison[]> {
    const [a, b] = await Promise.all([
      this.getSingleCountryStats(baseWhere, codeA),
      this.getSingleCountryStats(baseWhere, codeB),
    ]);

    const totalVisitors = a.visitors + b.visitors || 1;

    return [
      { ...a, share: Math.round((a.visitors / totalVisitors) * 1000) / 10 },
      { ...b, share: Math.round((b.visitors / totalVisitors) * 1000) / 10 },
    ];
  }

  private async getSingleCountryStats(
    baseWhere: Prisma.PageViewWhereInput,
    code: string,
  ): Promise<Omit<CountryComparison, 'share'>> {
    const where: Prisma.PageViewWhereInput = {
      ...baseWhere,
      country: code,
    };

    const [pageViews, visitors] = await Promise.all([
      this.prisma.pageView.count({ where }),
      this.countUniqueVisitors(where),
    ]);

    return {
      code,
      name: countryName(code),
      visitors,
      pageViews,
    };
  }

  private async getCountryStats(
    where: Prisma.PageViewWhereInput,
  ): Promise<CountryStat[]> {
    const rows = await this.prisma.pageView.groupBy({
      by: ['country', 'visitorId'],
      where,
      _count: { _all: true },
    });

    const map = new Map<string, { visitors: Set<string>; pageViews: number }>();

    for (const row of rows) {
      const code = row.country ?? 'Unknown';
      if (!map.has(code)) {
        map.set(code, { visitors: new Set(), pageViews: 0 });
      }
      const entry = map.get(code)!;
      entry.visitors.add(row.visitorId);
      entry.pageViews += row._count._all;
    }

    return [...map.entries()]
      .map(([code, data]) => ({
        code,
        name: countryName(code),
        visitors: data.visitors.size,
        pageViews: data.pageViews,
      }))
      .sort((a, b) => b.visitors - a.visitors);
  }

  private buildWhere(filters: AnalyticsFilters): Prisma.PageViewWhereInput {
    const where: Prisma.PageViewWhereInput = {};

    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = filters.from;
      if (filters.to) where.createdAt.lte = filters.to;
    }

    if (filters.country) {
      where.country = filters.country;
    }

    return where;
  }

  private async countUniqueVisitors(
    where: Prisma.PageViewWhereInput,
  ): Promise<number> {
    const rows = await this.prisma.pageView.groupBy({
      by: ['visitorId'],
      where,
    });
    return rows.length;
  }

  private async groupBy(
    field: 'city' | 'path' | 'device' | 'os' | 'browser' | 'referrer',
    limit: number,
    where: Prisma.PageViewWhereInput,
  ): Promise<LabeledCount[]> {
    const rows = await this.prisma.pageView.groupBy({
      by: [field],
      where,
      _count: { _all: true },
    });

    return rows
      .sort((a, b) => b._count._all - a._count._all)
      .slice(0, limit)
      .map((row) => ({
        label: String(row[field] ?? 'Unknown'),
        count: row._count._all,
      }));
  }

  private csvEscape(value: string): string {
    if (value.includes(',') || value.includes('"')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private resolveIp(req: Request): string | null {
    const candidates = [
      this.firstHeader(req, 'cf-connecting-ip'),
      this.firstHeader(req, 'x-real-ip'),
      this.firstHeader(req, 'true-client-ip'),
      this.firstHeader(req, 'x-forwarded-for'),
      req.ip,
      req.socket.remoteAddress,
    ];

    for (const candidate of candidates) {
      const ip = this.normalizeIp(candidate);
      if (ip && !this.isPrivateIp(ip)) {
        return ip;
      }
    }

    return null;
  }

  private firstHeader(req: Request, name: string): string | undefined {
    const value = req.headers[name];
    if (Array.isArray(value)) return value[0]?.trim();
    if (typeof value === 'string') {
      return value.split(',')[0]?.trim();
    }
    return undefined;
  }

  private normalizeIp(value?: string | null): string | null {
    if (!value) return null;
    const ip = value.trim().replace(/^::ffff:/, '');
    return ip || null;
  }

  private isPrivateIp(ip: string): boolean {
    if (ip === '::1' || ip === '127.0.0.1') return true;
    if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('169.254.')) {
      return true;
    }
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true;
    if (ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80:')) {
      return true;
    }
    return false;
  }

  private countryFromHeaders(req: Request): string | null {
    const raw =
      this.firstHeader(req, 'cf-ipcountry') ??
      this.firstHeader(req, 'x-vercel-ip-country');
    return this.normalizeCountryCode(raw);
  }

  private normalizeCountryCode(value?: string | null): string | null {
    if (!value) return null;
    const code = value.trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(code) || code === 'XX' || code === 'T1') {
      return null;
    }
    return code;
  }

  private normalizeReferrer(
    referrer: string | string[] | undefined,
  ): string {
    const value = Array.isArray(referrer) ? referrer[0] : referrer;
    if (!value) return 'Direct';

    try {
      const host = new URL(value).hostname.replace(/^www\./, '').toLowerCase();
      if (host.includes('google.')) return 'Google';
      if (
        host.includes('facebook.') ||
        host === 'fb.com' ||
        host === 'l.facebook.com'
      )
        return 'Facebook';
      if (host.includes('instagram.')) return 'Instagram';
      if (host.includes('twitter.') || host === 't.co' || host === 'x.com')
        return 'Twitter/X';
      if (host.includes('bing.')) return 'Bing';
      if (host.includes('yahoo.')) return 'Yahoo';
      if (host.includes('linkedin.')) return 'LinkedIn';
      if (host.includes('youtube.')) return 'YouTube';
      return host;
    } catch {
      return 'Direct';
    }
  }
}
