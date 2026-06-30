import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CommentStatus, UserRole } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CommentAiSpamService } from './comment-ai-spam.service';

export type TrustLevel = 'NEW' | 'MEMBER' | 'TRUSTED' | 'EXPERT' | 'MODERATOR';

export type SpamRisk = 'none' | 'low' | 'medium' | 'high';

export type SpamAnalysis = {
  score: number;
  aiSpamScore?: number | null;
  reasons: string[];
  risk: SpamRisk;
  hardBlock?: string;
  aiRemoved?: boolean;
};

export type CommentAuthor = {
  id: number;
  role: UserRole;
  reputationPoints: number;
  createdAt: Date;
  commentRestrictedUntil: Date | null;
};

const MODERATOR_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.EDITOR,
  UserRole.MODERATOR,
];

const TRUST_THRESHOLDS = {
  MEMBER: 50,
  TRUSTED: 200,
  EXPERT: 500,
} as const;

const RATE_LIMITS = {
  perMinute: 5,
  perHour: 30,
  perDay: 200,
} as const;

const URL_PATTERN =
  /(?:https?:\/\/|www\.)[^\s]+|\b[a-z0-9][-a-z0-9]*\.(?:com|net|org|io|co|xyz|info|biz|me|top|click|link|vip|win|bet|casino)\b/gi;

const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

const PHONE_PATTERN =
  /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{4}\b/g;

const HARD_BLOCK_PATTERNS: { pattern: RegExp; reason: string }[] = [
  {
    pattern:
      /\b(bitcoin|crypto\s*wallet|ethereum|usdt|binance\s*giveaway|free\s*btc)\b/i,
    reason: 'Cryptocurrency scam content is not allowed.',
  },
  {
    pattern:
      /\b(casino|bet\s*now|sports\s*betting|online\s*gambling|poker\s*online)\b/i,
    reason: 'Gambling promotions are not allowed.',
  },
  {
    pattern:
      /\b(xxx|porn|adult\s*video|escort|onlyfans\s*free|nude\s*pics)\b/i,
    reason: 'Adult content is not allowed.',
  },
  {
    pattern:
      /\b(click\s*here\s*to\s*win|free\s*iphone|you\s*won|claim\s*your\s*prize|congratulations\s*you\s*won)\b/i,
    reason: 'Fake giveaway content is not allowed.',
  },
  {
    pattern: /\b(earn\s*₹?\s*\d|make\s*\$\d|work\s*from\s*home\s*earn)\b/i,
    reason: 'Promotional money-making scams are not allowed.',
  },
  {
    pattern: /\b(malware|keylogger|phishing|steal\s*password)\b/i,
    reason: 'Malware or phishing content is not allowed.',
  },
];

const SPAM_KEYWORDS: { pattern: RegExp; score: number; label: string }[] = [
  { pattern: /\b(buy\s*now|limited\s*offer|act\s*fast)\b/i, score: 20, label: 'promotional language' },
  { pattern: /\b(whatsapp|telegram\s*me|dm\s*me)\b/i, score: 25, label: 'off-platform contact' },
  { pattern: /\b(giveaway|free\s*gift|winner)\b/i, score: 30, label: 'giveaway language' },
  { pattern: /\b(visit\s*my\s*(site|website|channel))\b/i, score: 25, label: 'self-promotion' },
  { pattern: /\b(earn\s*money|passive\s*income)\b/i, score: 35, label: 'money scam language' },
  { pattern: /\b(viagra|cialis|weight\s*loss\s*pill)\b/i, score: 40, label: 'spam product' },
];

@Injectable()
export class CommentSpamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiSpam: CommentAiSpamService,
  ) {}

  isAiConfigured(): boolean {
    return this.aiSpam.isConfigured();
  }

  getTrustLevel(author: CommentAuthor): TrustLevel {
    if (MODERATOR_ROLES.includes(author.role)) return 'MODERATOR';
    if (author.reputationPoints >= TRUST_THRESHOLDS.EXPERT) return 'EXPERT';
    if (author.reputationPoints >= TRUST_THRESHOLDS.TRUSTED) return 'TRUSTED';
    if (author.reputationPoints >= TRUST_THRESHOLDS.MEMBER) return 'MEMBER';
    return 'NEW';
  }

  maxLinksForTrust(trust: TrustLevel): number {
    switch (trust) {
      case 'MODERATOR':
        return Number.POSITIVE_INFINITY;
      case 'EXPERT':
      case 'TRUSTED':
        return 2;
      case 'MEMBER':
        return 1;
      default:
        return 0;
    }
  }

  async loadAuthor(userId: number): Promise<CommentAuthor> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        reputationPoints: true,
        createdAt: true,
        commentRestrictedUntil: true,
        isBlocked: true,
      },
    });
    if (!user) {
      throw new ForbiddenException('Account not found.');
    }
    if (user.isBlocked) {
      throw new ForbiddenException('Your account is blocked.');
    }
    if (
      user.commentRestrictedUntil &&
      user.commentRestrictedUntil > new Date()
    ) {
      throw new ForbiddenException(
        'Commenting is temporarily restricted on your account.',
      );
    }
    return user;
  }

  async enforceRateLimits(userId: number, trust: TrustLevel) {
    if (trust === 'MODERATOR') return;

    const now = new Date();
    const [minute, hour, day] = await Promise.all([
      this.prisma.comment.count({
        where: { userId, createdAt: { gte: new Date(now.getTime() - 60_000) } },
      }),
      this.prisma.comment.count({
        where: { userId, createdAt: { gte: new Date(now.getTime() - 3_600_000) } },
      }),
      this.prisma.comment.count({
        where: { userId, createdAt: { gte: new Date(now.getTime() - 86_400_000) } },
      }),
    ]);

    const multiplier =
      trust === 'EXPERT' ? 1.5 : trust === 'TRUSTED' ? 1.25 : 1;

    if (minute >= Math.ceil(RATE_LIMITS.perMinute * multiplier)) {
      throw new BadRequestException(
        'You are commenting too quickly. Please wait a moment.',
      );
    }
    if (hour >= Math.ceil(RATE_LIMITS.perHour * multiplier)) {
      throw new BadRequestException(
        'Hourly comment limit reached. Please try again later.',
      );
    }
    if (day >= Math.ceil(RATE_LIMITS.perDay * multiplier)) {
      throw new BadRequestException(
        'Daily comment limit reached. Please try again tomorrow.',
      );
    }
  }

  async checkDuplicate(userId: number, body: string) {
    const normalized = body.trim().toLowerCase();
    if (!normalized) return;

    const recent = await this.prisma.comment.findMany({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 120_000) },
        isDeleted: false,
      },
      select: { body: true },
    });

    const duplicates = recent.filter(
      (c) => c.body.trim().toLowerCase() === normalized,
    ).length;

    if (duplicates >= 2) {
      throw new BadRequestException(
        'Duplicate comment detected. Please avoid repeating the same message.',
      );
    }
  }

  async analyze(body: string, author: CommentAuthor): Promise<SpamAnalysis> {
    const trust = this.getTrustLevel(author);
    const ruleAnalysis = this.analyzeRules(body, author);
    if (ruleAnalysis.hardBlock || trust === 'MODERATOR') {
      return ruleAnalysis;
    }

    const ai = await this.aiSpam.scoreComment(body, { trustLevel: trust });
    if (!ai?.configured) {
      return ruleAnalysis;
    }

    return this.mergeWithAi(ruleAnalysis, ai, trust);
  }

  private analyzeRules(body: string, author: CommentAuthor): SpamAnalysis {
    const trust = this.getTrustLevel(author);
    if (trust === 'MODERATOR') {
      return { score: 0, reasons: [], risk: 'none' };
    }

    const text = body.trim();
    const reasons: string[] = [];
    let score = 0;

    for (const rule of HARD_BLOCK_PATTERNS) {
      if (rule.pattern.test(text)) {
        return {
          score: 100,
          reasons: [rule.reason],
          risk: 'high',
          hardBlock: rule.reason,
        };
      }
    }

    const urls = text.match(URL_PATTERN) ?? [];
    const maxLinks = this.maxLinksForTrust(trust);
    if (urls.length >= 3) {
      return {
        score: 100,
        reasons: ['Too many links (3 or more).'],
        risk: 'high',
        hardBlock: 'Comments with 3 or more links are not allowed.',
      };
    }
    if (urls.length > maxLinks) {
      score += 30 + (urls.length - maxLinks) * 20;
      reasons.push(
        `Too many external links for your trust level (${urls.length}/${maxLinks}).`,
      );
    } else if (urls.length > 0 && trust === 'NEW') {
      score += 35;
      reasons.push('New users cannot include external links.');
    }

    const emails = text.match(EMAIL_PATTERN) ?? [];
    if (emails.length > 0) {
      score += 25;
      reasons.push('Email addresses are not allowed in comments.');
    }

    const phones = text.match(PHONE_PATTERN) ?? [];
    if (phones.length > 0) {
      score += 20;
      reasons.push('Phone numbers are not allowed in comments.');
    }

    if (text.length >= 12 && this.isMostlyCaps(text)) {
      score += 25;
      reasons.push('Excessive ALL CAPS text.');
    }

    if (/(.)\1{4,}/.test(text) || /([!?])\1{3,}/.test(text)) {
      score += 20;
      reasons.push('Repeated characters detected.');
    }

    if (this.hasRepeatedWords(text)) {
      score += 30;
      reasons.push('Repeated words detected.');
    }

    const emojiCount = (text.match(/[\u{1F300}-\u{1FAFF}]/gu) ?? []).length;
    if (emojiCount >= 8) {
      score += 15;
      reasons.push('Excessive emoji usage.');
    }

    for (const keyword of SPAM_KEYWORDS) {
      if (keyword.pattern.test(text)) {
        score += keyword.score;
        reasons.push(`Matched spam pattern: ${keyword.label}.`);
      }
    }

    const accountAgeDays =
      (Date.now() - author.createdAt.getTime()) / 86_400_000;
    if (accountAgeDays < 3 && trust === 'NEW') {
      score += 15;
      reasons.push('New account — stricter spam checks applied.');
    }

    score = this.applyTrustModifier(score, trust);

    if (trust === 'NEW' && score >= 15) {
      score = Math.max(score, 35);
    }

    score = Math.min(100, Math.round(score));

    let risk: SpamRisk = 'none';
    if (score >= 80) risk = 'high';
    else if (score >= 50) risk = 'medium';
    else if (score >= 30) risk = 'low';

    return { score, reasons, risk };
  }

  private mergeWithAi(
    rule: SpamAnalysis,
    ai: {
      score: number;
      categories: string[];
      reason: string;
      shouldRemove: boolean;
    },
    trust: TrustLevel,
  ): SpamAnalysis {
    const threshold = this.aiSpam.getAutoRemoveThreshold(trust);
    const reasons = [...rule.reasons];
    const categoryLabel =
      ai.categories.length > 0 ? ai.categories.join(', ') : 'spam';
    reasons.push(
      `AI score ${ai.score}/100 (${categoryLabel}): ${ai.reason}`,
    );

    let score = rule.score;
    if (rule.score > 0 && ai.score > 0) {
      score = Math.min(
        100,
        Math.round(Math.max(rule.score, ai.score * 0.65 + rule.score * 0.35)),
      );
    } else {
      score = Math.max(rule.score, ai.score);
    }

    if (ai.shouldRemove && ai.score >= threshold) {
      return {
        score: Math.max(score, ai.score, threshold),
        aiSpamScore: ai.score,
        reasons,
        risk: 'high',
        hardBlock: `AI detected spam (${ai.score}/100): ${ai.reason}`,
        aiRemoved: true,
      };
    }

    if (ai.score >= threshold) {
      score = Math.max(score, threshold);
    }

    let risk: SpamRisk = 'none';
    if (score >= 80) risk = 'high';
    else if (score >= 50) risk = 'medium';
    else if (score >= 30) risk = 'low';

    return {
      score,
      aiSpamScore: ai.score,
      reasons,
      risk,
    };
  }

  resolveStatus(analysis: SpamAnalysis, trust: TrustLevel): CommentStatus {
    if (trust === 'MODERATOR' || analysis.risk === 'none') {
      return CommentStatus.PUBLISHED;
    }
    if (trust === 'EXPERT' && analysis.score < 60) {
      return CommentStatus.PUBLISHED;
    }
    if (trust === 'TRUSTED' && analysis.score < 50) {
      return CommentStatus.PUBLISHED;
    }

    switch (analysis.risk) {
      case 'high':
        return CommentStatus.SPAM;
      case 'medium':
        return CommentStatus.PENDING_REVIEW;
      case 'low':
        return CommentStatus.HIDDEN;
      default:
        return CommentStatus.PUBLISHED;
    }
  }

  userMessageForStatus(status: CommentStatus): string | null {
    switch (status) {
      case CommentStatus.PENDING_REVIEW:
        return 'Your comment is in the moderation queue and will appear after review.';
      case CommentStatus.HIDDEN:
        return 'Your comment was flagged for review and is hidden until approved.';
      case CommentStatus.SPAM:
        return 'Your comment was rejected as spam.';
      default:
        return null;
    }
  }

  private applyTrustModifier(score: number, trust: TrustLevel): number {
    switch (trust) {
      case 'EXPERT':
        return score * 0.7;
      case 'TRUSTED':
        return score * 0.8;
      case 'MEMBER':
        return score * 0.9;
      case 'NEW':
        return score * 1.15;
      default:
        return score;
    }
  }

  private isMostlyCaps(text: string): boolean {
    const letters = text.replace(/[^a-zA-Z]/g, '');
    if (letters.length < 10) return false;
    const upper = letters.replace(/[^A-Z]/g, '').length;
    return upper / letters.length >= 0.8;
  }

  private hasRepeatedWords(text: string): boolean {
    const words = text
      .toLowerCase()
      .split(/\s+/)
      .map((w) => w.replace(/[^a-z0-9]/g, ''))
      .filter((w) => w.length >= 3);
    const counts = new Map<string, number>();
    for (const word of words) {
      counts.set(word, (counts.get(word) ?? 0) + 1);
      if ((counts.get(word) ?? 0) >= 5) return true;
    }
    return false;
  }
}
