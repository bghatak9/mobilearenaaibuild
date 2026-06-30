import { Injectable, Logger } from '@nestjs/common';

import type { TrustLevel } from './comment-spam.service';

export type AiSpamResult = {
  configured: boolean;
  score: number;
  categories: string[];
  reason: string;
  shouldRemove: boolean;
};

type OpenAiChatResponse = {
  choices?: {
    message?: {
      content?: string;
    };
  }[];
};

const SYSTEM_PROMPT = `You are a spam and abuse classifier for MobileArena, a mobile phone community forum.
Score user comments for spam, scams, promotion, toxicity, bot-like text, and off-topic abuse.

Legitimate comments discuss phones, specs, cameras, battery, price, comparisons, or personal experience.
Short genuine praise ("Great phone!", "Love the camera") should score 0-15.

Return ONLY valid JSON with this shape:
{
  "spamScore": <integer 0-100>,
  "categories": [<zero or more of: "promotional", "scam", "toxicity", "bot", "off-topic", "gambling", "adult", "phishing", "none">],
  "reason": "<one short sentence>",
  "shouldRemove": <true if clearly spam/scam/abuse and should be auto-removed>
}

Scoring guide:
- 0-20: clean community comment
- 21-49: suspicious but possibly OK
- 50-79: likely spam — review recommended
- 80-100: clear spam/scam — auto-remove`;

@Injectable()
export class CommentAiSpamService {
  private readonly logger = new Logger(CommentAiSpamService.name);
  private readonly apiKey = process.env.OPENAI_API_KEY?.trim();
  private readonly model =
    process.env.AI_SPAM_MODEL?.trim() || 'gpt-4o-mini';
  private readonly enabled = process.env.AI_SPAM_ENABLED !== 'false';
  private readonly autoRemoveThreshold = this.readThreshold(
    'AI_SPAM_AUTO_REMOVE_THRESHOLD',
    85,
  );

  isConfigured(): boolean {
    return Boolean(this.apiKey) && this.enabled;
  }

  getAutoRemoveThreshold(trust: TrustLevel): number {
    switch (trust) {
      case 'NEW':
        return Math.min(this.autoRemoveThreshold, 75);
      case 'MEMBER':
        return Math.min(this.autoRemoveThreshold, 82);
      case 'TRUSTED':
        return Math.min(this.autoRemoveThreshold, 88);
      case 'EXPERT':
        return Math.min(this.autoRemoveThreshold, 92);
      default:
        return this.autoRemoveThreshold;
    }
  }

  async scoreComment(
    text: string,
    context?: { trustLevel?: TrustLevel },
  ): Promise<AiSpamResult | null> {
    if (!this.isConfigured()) return null;

    const comment = text.trim().slice(0, 2000);
    if (!comment) return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: JSON.stringify({
                comment,
                userTrustLevel: context?.trustLevel ?? 'NEW',
              }),
            },
          ],
        }),
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        this.logger.warn(
          `OpenAI spam scoring failed (${res.status}): ${detail.slice(0, 160)}`,
        );
        return null;
      }

      const payload = (await res.json()) as OpenAiChatResponse;
      const raw = payload.choices?.[0]?.message?.content;
      if (!raw) return null;

      const parsed = JSON.parse(raw) as {
        spamScore?: number;
        categories?: string[];
        reason?: string;
        shouldRemove?: boolean;
      };

      const score = Math.min(
        100,
        Math.max(0, Math.round(Number(parsed.spamScore) || 0)),
      );
      const categories = Array.isArray(parsed.categories)
        ? parsed.categories
            .map((c) => String(c).trim().toLowerCase())
            .filter((c) => c && c !== 'none')
        : [];
      const reason = String(parsed.reason ?? 'AI spam analysis').trim();
      const shouldRemove = Boolean(parsed.shouldRemove) || score >= 90;

      return {
        configured: true,
        score,
        categories,
        reason,
        shouldRemove,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown error';
      this.logger.warn(`AI spam scoring skipped: ${message}`);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  private readThreshold(key: string, fallback: number): number {
    const raw = process.env[key]?.trim();
    if (!raw) return fallback;
    const value = Number(raw);
    if (!Number.isFinite(value)) return fallback;
    return Math.min(100, Math.max(50, Math.round(value)));
  }
}
