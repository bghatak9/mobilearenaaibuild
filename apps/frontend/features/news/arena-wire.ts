import type { NewsArticle } from "@/lib/api";

export type ArenaWireTopic = {
  label: string;
  tone: "cyan" | "blue" | "purple" | "gold" | "rose";
};

const TOPIC_RULES: { pattern: RegExp; topic: ArenaWireTopic }[] = [
  { pattern: /\bsamsung\b|\bgalaxy\b/i, topic: { label: "Samsung", tone: "blue" } },
  { pattern: /\bapple\b|\biphone\b|\bipad\b/i, topic: { label: "Apple", tone: "purple" } },
  { pattern: /\bgoogle\b|\bpixel\b|\bandroid\b/i, topic: { label: "Google", tone: "cyan" } },
  { pattern: /\barticles\b|\bguide\b|\btips\b/i, topic: { label: "Articles", tone: "blue" } },
  { pattern: /\bapps\b|\bapp\b/i, topic: { label: "Apps", tone: "cyan" } },
  { pattern: /\bxiaomi\b|\bredmi\b|\bpoco\b/i, topic: { label: "Xiaomi", tone: "gold" } },
  { pattern: /\boneplus\b|\boppo\b|\brealme\b/i, topic: { label: "OnePlus", tone: "rose" } },
  { pattern: /\bev\b|\belectric vehicle\b|\bcharging\b/i, topic: { label: "EV", tone: "cyan" } },
  { pattern: /\bcompare\b|\bversus\b|\bvs\b/i, topic: { label: "Compare", tone: "purple" } },
  { pattern: /\bleak\b|\brumor\b|\bconfirmed\b/i, topic: { label: "Leaks", tone: "gold" } },
];

export function inferArenaWireTopic(article: NewsArticle): ArenaWireTopic {
  const haystack = `${article.title} ${article.excerpt ?? ""}`;
  for (const rule of TOPIC_RULES) {
    if (rule.pattern.test(haystack)) return rule.topic;
  }
  return article.featured
    ? { label: "Spotlight", tone: "gold" }
    : { label: "Arena Desk", tone: "cyan" };
}

function articleTimestamp(article: NewsArticle): number {
  const raw = article.publishedAt ?? article.createdAt;
  const time = new Date(raw).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export function sortArenaWireArticles(articles: NewsArticle[]): NewsArticle[] {
  return [...articles].sort((a, b) => articleTimestamp(b) - articleTimestamp(a));
}

export type ArenaWireLayout = {
  hero: NewsArticle | null;
  mosaic: NewsArticle[];
  pulse: NewsArticle[];
};

export function buildArenaWireLayout(articles: NewsArticle[]): ArenaWireLayout {
  const sorted = sortArenaWireArticles(articles);
  if (!sorted.length) {
    return { hero: null, mosaic: [], pulse: [] };
  }

  const hero = sorted.find((item) => item.featured) ?? sorted[0];
  const rest = sorted.filter((item) => item.id !== hero.id);

  const mosaic = rest.slice(0, 3);
  const pulse =
    rest.length > 0
      ? rest.slice(0, 8)
      : sorted.slice(0, 8);

  return { hero, mosaic, pulse };
}
