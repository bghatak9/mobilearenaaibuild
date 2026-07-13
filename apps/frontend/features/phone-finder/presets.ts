import type { PhoneFinderFilters, PhoneFinderPreset } from "./types";

export const QUICK_DISCOVERY_PRESETS: PhoneFinderPreset[] = [
  {
    id: "camera",
    label: "Best Camera Phones",
    labelKey: "presets.camera.label",
    emoji: "🔥",
    category: "discovery",
    description: "48MP+ sensors with OIS",
    descriptionKey: "presets.camera.description",
    patch: { minCameraMp: 48, ois: true, ultraWideCamera: true, sort: "rating" },
  },
  {
    id: "battery",
    label: "Best Battery Phones",
    labelKey: "presets.battery.label",
    emoji: "🔥",
    category: "discovery",
    description: "5000 mAh and up",
    descriptionKey: "presets.battery.description",
    patch: { batteryBucket: "5000-6000", sort: "popularity" },
  },
  {
    id: "gaming",
    label: "Best Gaming Phones",
    labelKey: "presets.gaming.label",
    emoji: "🔥",
    category: "discovery",
    description: "120Hz+ displays and gaming hardware",
    descriptionKey: "presets.gaming.description",
    patch: {
      deviceType: "gaming",
      refreshRateHz: "120",
      minRam: 8,
      gamingShoulderTriggers: true,
      sort: "popularity",
    },
  },
  {
    id: "value",
    label: "Best Value for Money",
    labelKey: "presets.value.label",
    emoji: "🔥",
    category: "discovery",
    description: "Strong ratings under $600",
    descriptionKey: "presets.value.description",
    patch: { maxPrice: 600, minRating: 7.5, sort: "rating" },
  },
  {
    id: "compact",
    label: "Compact Phones",
    labelKey: "presets.compact.label",
    emoji: "🔥",
    category: "discovery",
    description: 'Screens under 6.3"',
    descriptionKey: "presets.compact.description",
    patch: { maxDisplay: 6.3 },
  },
  {
    id: "flagship-killer",
    label: "Flagship Killers",
    labelKey: "presets.flagshipKiller.label",
    emoji: "🔥",
    category: "discovery",
    description: "Flagship specs below flagship prices",
    descriptionKey: "presets.flagshipKiller.description",
    patch: { maxPrice: 700, minCameraMp: 48, minRam: 8, refreshRateHz: "120" },
  },
  {
    id: "foldables",
    label: "Foldables",
    labelKey: "presets.foldables.label",
    emoji: "🔥",
    category: "discovery",
    description: "Foldable form factor",
    descriptionKey: "presets.foldables.description",
    patch: { deviceType: "foldable" },
  },
  {
    id: "under-10k-inr",
    label: "Phones Under ₹10,000",
    labelKey: "presets.under10kInr.label",
    emoji: "🔥",
    category: "discovery",
    description: "Budget picks in India",
    descriptionKey: "presets.under10kInr.description",
    patch: { maxPrice: 10000, priceCurrency: "INR", sort: "price-asc" },
  },
  {
    id: "under-20k-inr",
    label: "Phones Under ₹20,000",
    labelKey: "presets.under20kInr.label",
    emoji: "🔥",
    category: "discovery",
    description: "Mid-budget picks in India",
    descriptionKey: "presets.under20kInr.description",
    patch: { maxPrice: 20000, priceCurrency: "INR", sort: "price-asc" },
  },
  {
    id: "under-30k-inr",
    label: "Phones Under ₹30,000",
    labelKey: "presets.under30kInr.label",
    emoji: "🔥",
    category: "discovery",
    description: "Upper mid-range in India",
    descriptionKey: "presets.under30kInr.description",
    patch: { maxPrice: 30000, priceCurrency: "INR", sort: "price-asc" },
  },
  {
    id: "premium-flagships",
    label: "Premium Flagships",
    labelKey: "presets.premiumFlagships.label",
    emoji: "🔥",
    category: "discovery",
    description: "Top-tier premium devices",
    descriptionKey: "presets.premiumFlagships.description",
    patch: { minPrice: 900, minCameraMp: 48, refreshRateHz: "120", sort: "rating" },
  },
];

export const LIFESTYLE_PRESETS: PhoneFinderPreset[] = [
  {
    id: "student",
    label: "Student Picks",
    labelKey: "presets.student.label",
    emoji: "🎓",
    category: "lifestyle",
    description: "Affordable · 6GB+ RAM",
    descriptionKey: "presets.student.description",
    patch: { maxPrice: 450, ramTier: "6" },
  },
  {
    id: "business",
    label: "Business Phones",
    labelKey: "presets.business.label",
    emoji: "💼",
    category: "lifestyle",
    description: "NFC · solid battery",
    descriptionKey: "presets.business.description",
    patch: { nfc: true, batteryBucket: "4000-5000" },
  },
  {
    id: "creator",
    label: "Content Creator Phones",
    labelKey: "presets.creator.label",
    emoji: "🎥",
    category: "lifestyle",
    description: "Camera · storage · video",
    descriptionKey: "presets.creator.description",
    patch: { minCameraMp: 48, storageTier: "128", ramTier: "8", video4k: true },
  },
];

export const ALL_PRESETS: PhoneFinderPreset[] = [
  ...QUICK_DISCOVERY_PRESETS,
  ...LIFESTYLE_PRESETS,
];

export function presetById(id: string): PhoneFinderPreset | undefined {
  return ALL_PRESETS.find((p) => p.id === id);
}

export function applyPreset(
  presetId: string,
  current: PhoneFinderFilters,
  defaults: PhoneFinderFilters,
): PhoneFinderFilters {
  const preset = presetById(presetId);
  if (!preset) return current;
  return {
    ...defaults,
    ...preset.patch,
    search: current.search,
    preset: presetId,
  };
}

export const TRENDING_FINDER_SEARCHES = [
  { label: "Best camera", labelKey: "presets.trending.bestCamera", params: { preset: "camera" } },
  { label: "Under ₹20,000", labelKey: "presets.trending.under20k", params: { preset: "under-20k-inr" } },
  { label: "Foldables", labelKey: "presets.trending.foldables", params: { preset: "foldables" } },
  { label: "Gaming phones", labelKey: "presets.trending.gaming", params: { preset: "gaming" } },
  {
    label: "Premium flagships",
    labelKey: "presets.trending.premiumFlagships",
    params: { preset: "premium-flagships" },
  },
  { label: "5G phones", labelKey: "presets.trending.fiveG", params: { fiveG: "1" } },
  {
    label: "120Hz AMOLED",
    labelKey: "presets.trending.hz120Amoled",
    params: { displayTech: "amoled", refreshRateHz: "120" },
  },
  { label: "Volt flagships", labelKey: "presets.trending.voltFlagships", q: "Volt" },
] as const;

const TRENDING_KEY = "mobilearena:finder-trending";
const COMPARE_KEY = "mobilearena:compare-counts";

export function recordFinderSearch(query: string) {
  if (typeof window === "undefined" || !query.trim()) return;
  try {
    const raw = localStorage.getItem(TRENDING_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    const key = query.trim().toLowerCase();
    map[key] = (map[key] ?? 0) + 1;
    localStorage.setItem(TRENDING_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function recentTrendingSearches(limit = 6): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TRENDING_KEY);
    if (!raw) return [];
    const map = JSON.parse(raw) as Record<string, number>;
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([q]) => q);
  } catch {
    return [];
  }
}

export function recordCompareSlug(slug: string) {
  if (typeof window === "undefined" || !slug) return;
  try {
    const raw = localStorage.getItem(COMPARE_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    map[slug] = (map[slug] ?? 0) + 1;
    localStorage.setItem(COMPARE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function mostComparedSlugs(limit = 5): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COMPARE_KEY);
    if (!raw) return [];
    const map = JSON.parse(raw) as Record<string, number>;
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([slug]) => slug);
  } catch {
    return [];
  }
}
