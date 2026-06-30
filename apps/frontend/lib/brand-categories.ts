import type { BrandSummary, Device } from "@/lib/api";

/** Curated showcase brands for the home page Brand Universe section. */
export const GLOBAL_BRAND_UNIVERSE_SLUGS = [
  "volt-mobile",
  "nimbus-tech",
  "orbit-devices",
  "prism-labs",
] as const;

const GLOBAL_BRAND_UNIVERSE_NAMES: Record<
  (typeof GLOBAL_BRAND_UNIVERSE_SLUGS)[number],
  string
> = {
  "volt-mobile": "Volt Mobile",
  "nimbus-tech": "Nimbus Tech",
  "orbit-devices": "Orbit Devices",
  "prism-labs": "Prism Labs",
};

/** Canonical display order for global showcase brands. */
export const GLOBAL_BRAND_NAMES: readonly string[] = GLOBAL_BRAND_UNIVERSE_SLUGS.map(
  (slug) => GLOBAL_BRAND_UNIVERSE_NAMES[slug],
);

/** Major phone brands shoppers expect first (tier order). */
const MAJOR_BRAND_TIER: { patterns: string[] }[] = [
  { patterns: ["apple"] },
  { patterns: ["samsung"] },
  { patterns: ["google", "pixel"] },
  { patterns: ["oppo"] },
  { patterns: ["realme"] },
  { patterns: ["vivo"] },
  { patterns: ["xiaomi", "poco", "redmi"] },
  { patterns: ["oneplus"] },
  { patterns: ["motorola", "moto"] },
  { patterns: ["honor"] },
  { patterns: ["huawei"] },
  { patterns: ["nothing"] },
  { patterns: ["sony"] },
  { patterns: ["nokia"] },
  { patterns: ["tecno"] },
  { patterns: ["infinix"] },
];

function normalizeBrandKey(name: string): string {
  return name.toLowerCase().replace(/\s+/g, " ").trim();
}

function brandTierIndex(brandName: string): number {
  const key = normalizeBrandKey(brandName);
  for (let index = 0; index < MAJOR_BRAND_TIER.length; index += 1) {
    if (
      MAJOR_BRAND_TIER[index].patterns.some(
        (pattern) => key === pattern || key.includes(pattern),
      )
    ) {
      return index;
    }
  }
  return MAJOR_BRAND_TIER.length;
}

export type BrandCategoryGroup = {
  category: { id: number; name: string; slug: string };
  brands: BrandSummary[];
};

/** Group brands by the device categories they appear in. */
export function groupBrandsByCategory(devices: Device[]): BrandCategoryGroup[] {
  const groups = new Map<
    string,
    {
      category: { id: number; name: string; slug: string };
      brands: Map<number, BrandSummary>;
    }
  >();

  for (const device of devices) {
    const brand = device.brand;
    const category = device.category;
    if (!brand || !category) continue;

    const key = category.slug;
    if (!groups.has(key)) {
      groups.set(key, { category, brands: new Map() });
    }
    groups.get(key)!.brands.set(brand.id, {
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo ?? null,
    });
  }

  return Array.from(groups.values())
    .sort((a, b) => a.category.name.localeCompare(b.category.name))
    .map((group) => ({
      category: group.category,
      brands: Array.from(group.brands.values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    }));
}

/** Pick the four global showcase brands, preferring catalog data when present. */
export function pickGlobalBrandUniverse(
  groups: BrandCategoryGroup[],
): BrandSummary[] {
  const bySlug = new Map<string, BrandSummary>();
  for (const group of groups) {
    for (const brand of group.brands) {
      bySlug.set(brand.slug.toLowerCase(), brand);
    }
  }

  return GLOBAL_BRAND_UNIVERSE_SLUGS.map((slug, index) => {
    const existing = bySlug.get(slug);
    if (existing) return existing;

    const name = GLOBAL_BRAND_UNIVERSE_NAMES[slug];
    return {
      id: -(index + 1),
      name,
      slug,
      logo: null,
    };
  });
}

export function flattenBrandGroups(groups: BrandCategoryGroup[]): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const group of groups) {
    for (const brand of group.brands) {
      if (seen.has(brand.name)) continue;
      seen.add(brand.name);
      names.push(brand.name);
    }
  }
  return names.sort();
}

type BrandValueStats = {
  count: number;
  ratingSum: number;
  valueSum: number;
  communitySum: number;
};

function deviceValueContribution(device: Device): number {
  let score = (device.rating ?? 0) * 10;

  if (device.battery?.capacity) {
    score += Math.min(device.battery.capacity / 6000, 1) * 8;
  }

  const mp = device.cameras?.length
    ? Math.max(...device.cameras.map((camera) => camera.megapixel))
    : 0;
  if (mp > 0) {
    score += Math.min(mp / 108, 1) * 6;
  }

  if (device.display?.refreshRate) {
    score += Math.min(device.display.refreshRate / 144, 1) * 4;
  }

  if (device.chipset?.benchmark) {
    score += Math.min(device.chipset.benchmark / 2_000_000, 1) * 8;
  }

  if (device.ramGb) {
    score += Math.min(device.ramGb / 12, 1) * 4;
  }

  if (device.fiveG) score += 3;

  return score;
}

function buildBrandValueStats(devices: Device[]): Map<string, BrandValueStats> {
  const stats = new Map<string, BrandValueStats>();

  for (const device of devices) {
    const brand = device.brand?.name?.trim();
    if (!brand) continue;

    const entry = stats.get(brand) ?? {
      count: 0,
      ratingSum: 0,
      valueSum: 0,
      communitySum: 0,
    };
    entry.count += 1;
    entry.ratingSum += device.rating ?? 0;
    entry.valueSum += deviceValueContribution(device);
    entry.communitySum += device.communityRatingCount ?? 0;
    stats.set(brand, entry);
  }

  return stats;
}

/** Higher score = more valuable brand in the catalog (lineup depth, ratings, specs). */
export function brandValueScore(
  brandName: string,
  stats: Map<string, BrandValueStats>,
): number {
  const entry = stats.get(brandName);
  if (entry) {
    const avgRating = entry.ratingSum / entry.count;
    const avgValue = entry.valueSum / entry.count;
    return (
      entry.count * 12 +
      avgValue * 0.65 +
      avgRating * 8 +
      Math.min(entry.communitySum, 100) * 0.15
    );
  }

  const globalIndex = GLOBAL_BRAND_NAMES.findIndex(
    (name) => name.toLowerCase() === brandName.toLowerCase(),
  );
  if (globalIndex >= 0) return 36 - globalIndex * 4;

  return 0;
}

/** Sort brands — major tiers first (Apple, Samsung, Google/Pixel, Oppo, Realme, Vivo…), then by catalog value. */
export function rankBrandsByValue(
  devices: Device[],
  names: Iterable<string>,
): string[] {
  const unique = [...new Set(names)];
  const stats = buildBrandValueStats(devices);

  return unique.sort((a, b) => {
    const tierDiff = brandTierIndex(a) - brandTierIndex(b);
    if (tierDiff !== 0) return tierDiff;

    const valueDiff = brandValueScore(b, stats) - brandValueScore(a, stats);
    if (valueDiff !== 0) return valueDiff;

    return a.localeCompare(b);
  });
}

/** Top major brands for quick-pick chips in the filter sidebar. */
export function pickFeaturedBrands(
  devices: Device[],
  names: Iterable<string>,
  limit = 6,
): string[] {
  return rankBrandsByValue(devices, names)
    .filter((name) => brandTierIndex(name) < MAJOR_BRAND_TIER.length)
    .slice(0, limit);
}

export function buildBrandPickerOptions(
  devices: Device[],
  brandsIncludingAll: string[],
): { label: string; value: string }[] {
  const ranked = rankBrandsByValue(
    devices,
    brandsIncludingAll.filter((name) => name !== "All"),
  );
  return [
    { label: "All brands", value: "All" },
    ...ranked.map((name) => ({ label: name, value: name })),
  ];
}

/** Every catalog brand as summaries, ranked for display (major brands first). */
export function allBrandSummaries(
  groups: BrandCategoryGroup[],
  devices: Device[] = [],
): BrandSummary[] {
  const bySlug = new Map<string, BrandSummary>();

  for (const group of groups) {
    for (const brand of group.brands) {
      bySlug.set(brand.slug.toLowerCase(), brand);
    }
  }

  for (const device of devices) {
    const brand = device.brand;
    if (!brand) continue;
    const key = brand.slug.toLowerCase();
    if (bySlug.has(key)) continue;
    bySlug.set(key, {
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo ?? null,
    });
  }

  const ranked = rankBrandsByValue(
    devices,
    Array.from(bySlug.values()).map((brand) => brand.name),
  );
  const byName = new Map(
    Array.from(bySlug.values()).map((brand) => [brand.name, brand]),
  );

  return ranked
    .map((name) => byName.get(name))
    .filter((brand): brand is BrandSummary => brand != null);
}

/** Dropdown/search options: `All` plus every active catalog brand (uploads + devices). */
export function brandFilterOptions(
  groups: BrandCategoryGroup[],
  devices: Device[] = [],
): string[] {
  const names = new Set(flattenBrandGroups(groups));
  for (const device of devices) {
    const name = device.brand?.name?.trim();
    if (name) names.add(name);
  }
  return ["All", ...rankBrandsByValue(devices, names)];
}

export function isBrandNameInGroups(
  groups: BrandCategoryGroup[],
  brandName: string,
): boolean {
  if (brandName === "All") return true;
  return groups.some((group) =>
    group.brands.some((entry) => entry.name === brandName),
  );
}

/** Prefer API groups; fall back to grouping device brands when the API is empty. */
export function resolveBrandCatalog(
  apiGroups: BrandCategoryGroup[],
  devices: Device[],
): BrandCategoryGroup[] {
  if (apiGroups.length > 0) return apiGroups;
  return groupBrandsByCategory(devices);
}
