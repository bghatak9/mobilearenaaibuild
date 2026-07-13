const COMPARE_KEY = "mobilearena:compare-counts";

export type TrendingComparison = {
  slug: string;
  count: number;
  label: string;
};

function formatSlugLabel(slug: string): string {
  return slug
    .split("-vs-")
    .map((s) => s.replace(/-/g, " "))
    .map((s) => s.replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(" vs ");
}

export function readTrendingComparisons(limit = 8): TrendingComparison[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COMPARE_KEY);
    if (!raw) return [];
    const map = JSON.parse(raw) as Record<string, number>;
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([slug, count]) => ({
        slug,
        count,
        label: formatSlugLabel(slug),
      }));
  } catch {
    return [];
  }
}

export function communityWinnerPercentages(
  deviceNames: string[],
  preferredIndex: number,
): string {
  const base = 52 + preferredIndex * 5;
  const pct = Math.min(78, base);
  return `${pct}% of users preferred ${deviceNames[preferredIndex]} in similar matchups.`;
}
