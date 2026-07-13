import { computeArenaScore } from "@/lib/arena-score";
import type { Device } from "@/lib/api";

import {
  getTrendingArenaDevices,
  getUpcomingDevices,
  hasBatteryAtLeast,
  hasRefreshAtLeast,
  mainCameraMp,
  priceDropPercent,
} from "./device-utils";
import { applyPhoneFinderFilters } from "./filters";
import { parseBuyingAssistantQuery, type ParsedBuyingQuery } from "./nlp";
import {
  devicesFromSlugs,
  readBrowsingHistory,
  readCompareBasket,
  readCompareCounts,
  topCommunityBrands,
  type RecommendationReason,
  type ScoredRecommendation,
} from "./signals";
import type { PhoneFinderFilters } from "./types";

export type AiMatchProfile = {
  budgetMax: number;
  budgetCurrency: "USD" | "INR";
  usage: "gaming" | "photography" | "business" | "social" | "balanced";
  cameraImportance: 1 | 2 | 3 | 4 | 5;
  batteryExpectation: "all-day" | "heavy" | "two-day";
  preferredBrands: string[];
};

export type ScoredMatch = {
  device: Device;
  matchPercent: number;
};

export type BudgetPick = {
  rank: 1 | 2 | 3;
  device: Device;
  medal: "🥇" | "🥈" | "🥉";
};

export type DealCategory = "price-drop" | "limited" | "festival";

export type CategorizedDeal = {
  device: Device;
  category: DealCategory;
  label: string;
  dropPercent?: number;
};

function budgetMaxUsd(profile: AiMatchProfile): number {
  if (profile.budgetCurrency === "INR") {
    return Math.round(profile.budgetMax / 83);
  }
  return profile.budgetMax;
}

export function scoreAiMatch(device: Device, profile: AiMatchProfile): number {
  const maxUsd = budgetMaxUsd(profile);
  let score = 0;
  let weight = 0;

  const price = device.price ?? maxUsd;
  if (price <= maxUsd) {
    const priceFit = 1 - Math.abs(price - maxUsd * 0.85) / maxUsd;
    score += Math.max(0, priceFit) * 25;
  } else {
    score += Math.max(0, 25 - ((price - maxUsd) / maxUsd) * 40);
  }
  weight += 25;

  if (profile.preferredBrands.length) {
    const brand = device.brand?.name ?? "";
    const match = profile.preferredBrands.some(
      (b) => brand.toLowerCase().includes(b.toLowerCase()),
    );
    score += match ? 15 : 0;
  } else {
    score += 10;
  }
  weight += 15;

  const cameraWeight = profile.cameraImportance * 3;
  const mp = mainCameraMp(device) ?? 0;
  score += Math.min(mp / 108, 1) * cameraWeight;
  weight += cameraWeight;

  const batteryTarget =
    profile.batteryExpectation === "two-day"
      ? 6000
      : profile.batteryExpectation === "heavy"
        ? 5000
        : 4500;
  const cap = device.battery?.capacity ?? 0;
  score += Math.min(cap / batteryTarget, 1) * 15;
  weight += 15;

  switch (profile.usage) {
    case "gaming":
      score += hasRefreshAtLeast(device, 120) ? 12 : 0;
      score += (device.chipset?.benchmark ?? 0) >= 800_000 ? 8 : 0;
      weight += 20;
      break;
    case "photography":
      score += mp >= 48 ? 10 : 0;
      score += (device.rating ?? 0) >= 8 ? 10 : 0;
      weight += 20;
      break;
    case "business":
      score += device.nfc ? 8 : 0;
      score += hasBatteryAtLeast(device, 4500) ? 7 : 0;
      weight += 15;
      break;
    case "social":
      score += mp >= 32 ? 8 : 0;
      score += (device.display?.size ?? 0) >= 6 ? 7 : 0;
      weight += 15;
      break;
    default:
      score += computeArenaScore(device) * 0.15;
      weight += 15;
  }

  score += (device.rating ?? 0) * 1.5;
  weight += 15;

  return Math.min(100, Math.max(60, Math.round((score / weight) * 100)));
}

export function aiMatchFromProfile(
  devices: Device[],
  profile: AiMatchProfile,
  limit = 3,
): ScoredMatch[] {
  const maxUsd = budgetMaxUsd(profile);
  const pool = devices.filter((d) => {
    if ((d.price ?? 0) > maxUsd * 1.15) return false;
    if (profile.preferredBrands.length) {
      const brand = d.brand?.name?.toLowerCase() ?? "";
      return profile.preferredBrands.some((b) => brand.includes(b.toLowerCase()));
    }
    return true;
  });

  return pool
    .map((device) => ({
      device,
      matchPercent: scoreAiMatch(device, profile),
    }))
    .sort((a, b) => b.matchPercent - a.matchPercent)
    .slice(0, limit);
}

export function personalizedRecommendationsDetailed(
  devices: Device[],
  wishlistDeviceIds: Set<number>,
  limit = 4,
): ScoredRecommendation[] {
  const browsing = readBrowsingHistory().map((r) => r.slug);
  const compareBasket = readCompareBasket().map((r) => r.slug);
  const communityBrands = new Set(topCommunityBrands(devices));

  const wishlistBrands = new Set<string>();
  for (const d of devices) {
    if (wishlistDeviceIds.has(d.id) && d.brand?.name) {
      wishlistBrands.add(d.brand.name);
    }
  }

  const browsed = devicesFromSlugs(devices, browsing);
  const compared = devicesFromSlugs(devices, compareBasket);

  return devices
    .filter((d) => !wishlistDeviceIds.has(d.id))
    .map((device) => {
      let score = computeArenaScore(device);
      const reasons: RecommendationReason[] = [];

      if (browsed.some((b) => b.brand?.name === device.brand?.name)) {
        score += 12;
        reasons.push("browsing");
      }
      if (device.brand?.name && wishlistBrands.has(device.brand.name)) {
        score += 15;
        reasons.push("wishlist");
      }
      if (device.brand?.name && communityBrands.has(device.brand.name)) {
        score += 8;
        reasons.push("community");
      }
      if (compared.some((c) => c.brand?.name !== device.brand?.name)) {
        score += 6;
        if (!reasons.includes("comparisons")) reasons.push("comparisons");
      }
      if (compared.some((c) => c.slug === device.slug)) {
        score += 10;
        if (!reasons.includes("comparisons")) reasons.push("comparisons");
      }

      return { device, score, reasons };
    })
    .filter((x) => x.reasons.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function comparisonAlternatives(
  devices: Device[],
  anchorSlug: string,
  limit = 3,
): { anchor: Device | null; alternatives: Device[] } {
  const anchor =
    devices.find((d) => d.slug === anchorSlug) ??
    devices.find((d) =>
      d.name.toLowerCase().includes(anchorSlug.toLowerCase()),
    ) ??
    null;

  if (!anchor) return { anchor: null, alternatives: [] };

  const price = anchor.price ?? 800;
  const counts = readCompareCounts();

  const alternatives = devices
    .filter((d) => d.id !== anchor.id)
    .map((d) => {
      let score = 0;
      score += Math.max(0, 20 - Math.abs((d.price ?? price) - price) / 50);
      score += (counts[d.slug] ?? 0) * 2;
      score += computeArenaScore(d) * 0.1;
      if (d.brand?.name !== anchor.brand?.name) score += 5;
      return { d, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.d);

  return { anchor, alternatives };
}

export function upgradeAdvisorDetailed(
  devices: Device[],
  query: string,
): { current: Device | null; upgrades: Device[] } {
  const q = query.trim().toLowerCase();
  if (!q) return { current: null, upgrades: [] };

  const current =
    devices.find((d) => d.name.toLowerCase().includes(q)) ??
    devices.find((d) => d.slug.includes(q.replace(/\s+/g, "-"))) ??
    null;

  if (!current) return { current: null, upgrades: [] };

  const price = current.price ?? 500;
  const brand = current.brand?.name;

  const sameBrand = devices
    .filter(
      (d) =>
        d.id !== current.id &&
        d.brand?.name === brand &&
        (d.price ?? 0) > price &&
        computeArenaScore(d) >= computeArenaScore(current),
    )
    .sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    .slice(0, 2);

  const crossBrand = devices
    .filter(
      (d) =>
        d.id !== current.id &&
        d.brand?.name !== brand &&
        Math.abs((d.price ?? price) - price * 1.2) < price * 0.5 &&
        computeArenaScore(d) > computeArenaScore(current),
    )
    .sort((a, b) => computeArenaScore(b) - computeArenaScore(a))
    .slice(0, 2);

  const upgrades = [...sameBrand, ...crossBrand]
    .filter((d, i, arr) => arr.findIndex((x) => x.id === d.id) === i)
    .slice(0, 3);

  return { current, upgrades };
}

export function budgetOptimizerRanked(
  devices: Device[],
  budgetMax: number,
  currency: "USD" | "INR" = "USD",
): BudgetPick[] {
  const maxUsd = currency === "INR" ? Math.round(budgetMax / 83) : budgetMax;
  const matched = devices.filter((d) => (d.price ?? Infinity) <= maxUsd);

  const medals: BudgetPick["medal"][] = ["🥇", "🥈", "🥉"];
  return [...matched]
    .sort(
      (a, b) =>
        computeArenaScore(b) - computeArenaScore(a) ||
        (b.rating ?? 0) - (a.rating ?? 0),
    )
    .slice(0, 3)
    .map((device, i) => ({
      rank: (i + 1) as 1 | 2 | 3,
      device,
      medal: medals[i],
    }));
}

export function dailyDealsCategorized(
  devices: Device[],
  limit = 6,
): CategorizedDeal[] {
  const deals: CategorizedDeal[] = [];

  for (const d of devices) {
    const drop = priceDropPercent(d);
    if (drop != null && drop >= 5) {
      deals.push({
        device: d,
        category: "price-drop",
        label: "Price drop",
        dropPercent: drop,
      });
    }
  }

  const highRated = [...devices]
    .filter((d) => (d.rating ?? 0) >= 8.5 && (d.price ?? 0) < 700)
    .slice(0, 2);
  for (const d of highRated) {
    deals.push({ device: d, category: "limited", label: "Limited offer" });
  }

  const festival = [...devices]
    .filter((d) => (d.price ?? 0) <= 500 && (d.rating ?? 0) >= 7)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 2);
  for (const d of festival) {
    deals.push({ device: d, category: "festival", label: "Festival deal" });
  }

  return deals
    .sort(
      (a, b) =>
        (b.dropPercent ?? 0) - (a.dropPercent ?? 0) ||
        computeArenaScore(b.device) - computeArenaScore(a.device),
    )
    .slice(0, limit);
}

export function buyingAssistantSuggestions(
  devices: Device[],
  rawQuery: string,
): { parsed: ParsedBuyingQuery; suggestions: Device[] } {
  const parsed = parseBuyingAssistantQuery(rawQuery);

  let pool = devices;
  if (parsed.maxPrice != null) {
    pool = pool.filter((d) => (d.price ?? Infinity) <= parsed.maxPrice!);
  }
  if (parsed.minPrice != null) {
    pool = pool.filter((d) => (d.price ?? 0) >= parsed.minPrice!);
  }
  if (parsed.minCameraMp != null) {
    pool = pool.filter((d) => (mainCameraMp(d) ?? 0) >= parsed.minCameraMp!);
  }
  if (parsed.minBattery != null) {
    pool = pool.filter((d) => (d.battery?.capacity ?? 0) >= parsed.minBattery!);
  }
  if (parsed.minRam != null) {
    pool = pool.filter((d) => (d.ramGb ?? 0) >= parsed.minRam!);
  }
  if (parsed.fiveG) pool = pool.filter((d) => d.fiveG);
  if (parsed.gaming === true) {
    pool = pool.filter((d) => hasRefreshAtLeast(d, 120));
  } else if (parsed.gaming === false) {
    pool = pool.filter((d) => !hasRefreshAtLeast(d, 144));
  }
  if (parsed.brandHints.length) {
    pool = pool.filter((d) =>
      parsed.brandHints.some((h) =>
        `${d.name} ${d.brand?.name}`.toLowerCase().includes(h),
      ),
    );
  }
  if (parsed.search.trim()) {
    const q = parsed.search.toLowerCase();
    pool = pool.filter((d) =>
      `${d.name} ${d.brand?.name}`.toLowerCase().includes(q),
    );
  }

  const suggestions = [...pool]
    .sort((a, b) => computeArenaScore(b) - computeArenaScore(a))
    .slice(0, 3);

  return { parsed, suggestions };
}

export function identifyDeviceFromText(
  devices: Device[],
  text: string,
): { match: Device | null; alternatives: Device[] } {
  const q = text.toLowerCase();
  const match =
    devices.find((d) => d.name.toLowerCase() === q) ??
    devices.find((d) => d.name.toLowerCase().includes(q)) ??
    devices.find((d) => d.slug.replace(/-/g, " ").includes(q)) ??
    null;

  const alternatives = match
    ? devices
        .filter(
          (d) =>
            d.id !== match.id &&
            (d.brand?.name === match.brand?.name ||
              Math.abs((d.price ?? 0) - (match.price ?? 0)) < 200),
        )
        .slice(0, 4)
    : devices
        .filter((d) => q.split(/\s+/).some((t) => d.name.toLowerCase().includes(t)))
        .slice(0, 4);

  return { match, alternatives };
}

// Legacy exports used elsewhere
export function aiMatchDevices(
  devices: Device[],
  filters: PhoneFinderFilters,
  limit = 3,
): Device[] {
  return applyPhoneFinderFilters(devices, filters)
    .sort((a, b) => computeArenaScore(b) - computeArenaScore(a))
    .slice(0, limit);
}

export function personalizedRecommendations(
  devices: Device[],
  filters: PhoneFinderFilters,
  wishlistDeviceIds: Set<number>,
  limit = 4,
): Device[] {
  return personalizedRecommendationsDetailed(devices, wishlistDeviceIds, limit).map(
    (x) => x.device,
  );
}

export function smartComparisonSuggestions(
  devices: Device[],
  filters: PhoneFinderFilters,
): [Device, Device] | null {
  const matched = applyPhoneFinderFilters(devices, filters);
  if (matched.length < 2) return null;
  const anchor = [...matched].sort(
    (a, b) => computeArenaScore(b) - computeArenaScore(a),
  )[0];
  const { alternatives } = comparisonAlternatives(devices, anchor.slug, 1);
  const partner = alternatives[0];
  return partner ? [anchor, partner] : null;
}

export function upgradeAdvisor(devices: Device[], query: string): Device | null {
  return upgradeAdvisorDetailed(devices, query).upgrades[0] ?? null;
}

export function budgetOptimizer(
  devices: Device[],
  filters: PhoneFinderFilters,
): Device | null {
  if (filters.maxPrice == null) return null;
  return budgetOptimizerRanked(devices, filters.maxPrice, "USD")[0]?.device ?? null;
}

export function dailyDealRecommendations(
  devices: Device[],
  filters: PhoneFinderFilters,
  limit = 3,
): Device[] {
  const matched = applyPhoneFinderFilters(devices, filters);
  return dailyDealsCategorized(matched, limit).map((d) => d.device);
}

export function communityFavorites(
  devices: Device[],
  filters: PhoneFinderFilters,
  limit = 5,
): Device[] {
  return applyPhoneFinderFilters(devices, filters)
    .filter((d) => (d.rating ?? 0) >= 7.5)
    .sort(
      (a, b) =>
        (b.communityRatingCount ?? 0) - (a.communityRatingCount ?? 0) ||
        (b.rating ?? 0) - (a.rating ?? 0),
    )
    .slice(0, limit);
}

export function realTimeTrendingDevices(devices: Device[], limit = 5): Device[] {
  return getTrendingArenaDevices(devices, limit);
}

export function upcomingLaunches(devices: Device[], limit = 5): Device[] {
  return getUpcomingDevices(devices, limit);
}
