import type { Device } from "@/lib/api";

const RECENT_KEY = "mobilearena:recent-devices";
const COMPARE_KEY = "mobilearena:compare";
const COMPARE_COUNTS_KEY = "mobilearena:compare-counts";

export type RecentDevice = { slug: string; name: string };

export function readBrowsingHistory(): RecentDevice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as RecentDevice[]) : [];
  } catch {
    return [];
  }
}

export function readCompareBasket(): RecentDevice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COMPARE_KEY);
    return raw ? (JSON.parse(raw) as RecentDevice[]) : [];
  } catch {
    return [];
  }
}

export function readCompareCounts(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(COMPARE_COUNTS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function devicesFromSlugs(
  devices: Device[],
  slugs: string[],
): Device[] {
  const set = new Set(slugs);
  return devices.filter((d) => set.has(d.slug));
}

export function topCommunityBrands(devices: Device[], limit = 3): string[] {
  const scores = new Map<string, number>();
  for (const d of devices) {
    const brand = d.brand?.name;
    if (!brand) continue;
    const s =
      (d.rating ?? 0) * 10 + (d.communityRatingCount ?? 0) * 0.05;
    scores.set(brand, (scores.get(brand) ?? 0) + s);
  }
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([b]) => b);
}

export type RecommendationReason =
  | "browsing"
  | "wishlist"
  | "community"
  | "comparisons";

export type ScoredRecommendation = {
  device: Device;
  score: number;
  reasons: RecommendationReason[];
};
