import type { Device } from "@/lib/api";

import {
  hasDisplayType,
  hasOis,
  hasRefreshAtLeast,
  mainCameraMp,
} from "./device-utils";
import {
  brandFromQuery,
  hasStructuredSearchPatch,
  parseSearchQuery,
  presetSuggestionsForQuery,
} from "./search-query";
import { getStoredSearchLanguage, stopwordsForLanguage } from "./search-locale";
import type { SearchLanguageCode } from "./search-locale";
import type { PhoneFinderFilters, PriceCurrency } from "./types";

export type SearchSuggestionKind =
  | "device"
  | "brand"
  | "preset"
  | "spec"
  | "query"
  | "history"
  | "trending";

export type SearchSuggestion = {
  id: string;
  label: string;
  sublabel?: string;
  kind: SearchSuggestionKind;
  icon: string;
  query: string;
  patch?: Partial<PhoneFinderFilters>;
};

export function buildDeviceHaystack(device: Device): string {
  const parts = [
    device.name,
    device.slug?.replace(/-/g, " "),
    device.brand?.name,
    device.manufacturer?.name,
    device.category?.name,
    device.os,
    device.chipset?.cpu,
    device.chipset?.gpu,
    device.chipset?.fabrication,
    device.display?.type,
    device.display?.protection,
    device.display?.refreshRate != null ? `${device.display.refreshRate}hz` : null,
    device.display?.size != null ? `${device.display.size} inch` : null,
    device.battery?.capacity != null ? `${device.battery.capacity}mah` : null,
    device.battery?.charging,
    device.ramGb != null ? `${device.ramGb}gb ram` : null,
    device.storageGb != null ? `${device.storageGb}gb` : null,
    device.fiveG ? "5g" : null,
    device.nfc ? "nfc" : null,
    device.waterproof ? "waterproof ip" : null,
    hasOis(device) ? "ois" : null,
    hasDisplayType(device, "amoled") ? "amoled" : null,
    hasDisplayType(device, "oled") ? "oled" : null,
    hasRefreshAtLeast(device, 120) ? "120hz" : null,
    mainCameraMp(device) != null ? `${mainCameraMp(device)}mp` : null,
    ...(device.cameras?.map((c) => `${c.megapixel}mp ${c.type}`) ?? []),
  ];

  return parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function tokenizeQuery(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,]+/)
    .map((t) => t.replace(/[^\w.+<>:₹$]/g, ""))
    .filter((t) => t.length > 0);
}

function getMatchStopwords(lang?: SearchLanguageCode): Set<string> {
  return stopwordsForLanguage(lang ?? getStoredSearchLanguage());
}

function tokenMatchesHaystack(hay: string, token: string): boolean {
  if (hay.includes(token)) return true;
  if (token.endsWith("gb") && hay.includes(token.replace("gb", ""))) return true;
  if (/^\d+$/.test(token) && hay.includes(token)) return true;
  if (token.includes("snapdragon") && hay.includes("snapdragon")) return true;
  if (token.includes("dimensity") && hay.includes("dimensity")) return true;
  if (token.includes("exynos") && hay.includes("exynos")) return true;
  if (token.includes("tensor") && hay.includes("tensor")) return true;
  if (token.includes("elite") && hay.includes("snapdragon")) return true;
  return false;
}

export function deviceMatchesFreeText(
  device: Device,
  freeText: string,
  lang?: SearchLanguageCode,
): boolean {
  const q = freeText.trim().toLowerCase().replace(/\s+/g, " ");
  if (!q) return true;

  const hay = buildDeviceHaystack(device);
  if (hay.includes(q)) return true;

  const stopwords = getMatchStopwords(lang);
  const tokens = tokenizeQuery(q).filter((t) => !stopwords.has(t));
  if (tokens.length === 0) return true;

  if (tokens.length === 1) {
    return tokenMatchesHaystack(hay, tokens[0]);
  }

  const matched = tokens.filter((t) => tokenMatchesHaystack(hay, t));
  return matched.length >= Math.max(1, Math.ceil(tokens.length * 0.5));
}

export function mergeSearchIntoFilters(
  filters: PhoneFinderFilters,
  rawQuery: string,
): PhoneFinderFilters & { structuredSearch: boolean } {
  const { freeText, patch } = parseSearchQuery(rawQuery, filters.priceCurrency);
  return {
    ...filters,
    ...patch,
    search: freeText || rawQuery.trim(),
    structuredSearch: hasStructuredSearchPatch(patch) || Boolean(patch.preset),
  };
}

export function scoreDeviceForQuery(device: Device, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const name = device.name.toLowerCase();
  const brand = device.brand?.name?.toLowerCase() ?? "";
  let score = 0;

  if (name === q) score += 100;
  else if (name.startsWith(q)) score += 80;
  else if (name.includes(q)) score += 60;
  if (brand.startsWith(q)) score += 40;
  if (buildDeviceHaystack(device).includes(q)) score += 20;

  return score;
}

export function buildSearchSuggestions(
  query: string,
  devices: Device[],
  brands: string[],
  options: {
    history?: string[];
    trending?: string[];
    currency: PriceCurrency;
    limit: number;
  },
): SearchSuggestion[] {
  const q = query.trim();
  const suggestions: SearchSuggestion[] = [];
  const seen = new Set<string>();

  function push(s: SearchSuggestion) {
    const key = `${s.kind}:${s.label.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    suggestions.push(s);
  }

  if (!q) {
    for (const item of options.history ?? []) {
      push({
        id: `history-${item}`,
        label: item,
        kind: "history",
        icon: "🕐",
        query: item,
      });
      if (suggestions.length >= options.limit) return suggestions;
    }
    for (const item of options.trending ?? []) {
      push({
        id: `trending-${item}`,
        label: item,
        kind: "trending",
        icon: "🔥",
        query: item,
      });
      if (suggestions.length >= options.limit) return suggestions;
    }
    return suggestions;
  }

  const ql = q.toLowerCase();

  const deviceMatches = devices
    .map((d) => ({ d, score: scoreDeviceForQuery(d, q) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  for (const { d } of deviceMatches) {
    push({
      id: `device-${d.id}`,
      label: d.name,
      sublabel: d.brand?.name ?? undefined,
      kind: "device",
      icon: "🔍",
      query: d.name,
    });
  }

  for (const brand of brands) {
    if (brand === "All") continue;
    if (brand.toLowerCase().includes(ql) || ql.includes(brand.toLowerCase())) {
      push({
        id: `brand-${brand}`,
        label: brand,
        sublabel: "Brand",
        kind: "brand",
        icon: "🏷️",
        query: brand,
        patch: { brand },
      });
    }
  }

  for (const preset of presetSuggestionsForQuery(q)) {
    push({
      id: `preset-${preset.id}`,
      label: preset.label,
      sublabel: preset.description,
      kind: "preset",
      icon: preset.emoji,
      query: preset.label,
      patch: { ...preset.patch, preset: preset.id },
    });
  }

  const specHints: { match: RegExp; label: string; icon: string; patch: Partial<PhoneFinderFilters> }[] = [
    { match: /snapdragon|dimensity|exynos|tensor/i, label: q, icon: "⚡", patch: {} },
    { match: /\b5g\b/i, label: "5G phones", icon: "📶", patch: { fiveG: true } },
    { match: /amoled/i, label: "AMOLED displays", icon: "🖥️", patch: { displayAmoled: true } },
    { match: /120\s*hz|120hz/i, label: "120Hz displays", icon: "⚡", patch: { display120Hz: true, minRefresh: 120 } },
    { match: /\b8\s*gb|\b8gb/i, label: "8GB RAM", icon: "💾", patch: { minRam: 8 } },
    { match: /ois/i, label: "Camera with OIS", icon: "📸", patch: { ois: true } },
  ];

  for (const hint of specHints) {
    if (hint.match.test(q)) {
      push({
        id: `spec-${hint.label}`,
        label: hint.label,
        kind: "spec",
        icon: hint.icon,
        query: q,
        patch: hint.patch,
      });
    }
  }

  const detectedBrand = brandFromQuery(q);
  if (detectedBrand) {
    push({
      id: `brand-detect-${detectedBrand}`,
      label: `${detectedBrand} phones`,
      kind: "brand",
      icon: "🏷️",
      query: detectedBrand,
      patch: { brand: detectedBrand },
    });
  }

  for (const item of options.history ?? []) {
    if (item.toLowerCase().includes(ql)) {
      push({
        id: `history-${item}`,
        label: item,
        kind: "history",
        icon: "🕐",
        query: item,
      });
    }
  }

  if (suggestions.length < options.limit) {
    push({
      id: `query-${q}`,
      label: `Search "${q}"`,
      kind: "query",
      icon: "🔍",
      query: q,
    });
  }

  return suggestions.slice(0, options.limit);
}

export type HighlightPart = { text: string; match: boolean };

export function highlightParts(text: string, query: string): HighlightPart[] {
  const q = query.trim();
  if (!q) return [{ text, match: false }];

  const lowerText = text.toLowerCase();
  const lowerQ = q.toLowerCase();
  const idx = lowerText.indexOf(lowerQ);

  if (idx === -1) {
    const tokens = tokenizeQuery(q).filter((t) => t.length > 2);
    for (const token of tokens) {
      const ti = lowerText.indexOf(token);
      if (ti !== -1) {
        return [
          { text: text.slice(0, ti), match: false },
          { text: text.slice(ti, ti + token.length), match: true },
          { text: text.slice(ti + token.length), match: false },
        ].filter((p) => p.text.length > 0);
      }
    }
    return [{ text, match: false }];
  }

  return [
    { text: text.slice(0, idx), match: false },
    { text: text.slice(idx, idx + q.length), match: true },
    { text: text.slice(idx + q.length), match: false },
  ].filter((p) => p.text.length > 0);
}

export function getDailyTrendingSearches(currency: PriceCurrency): string[] {
  const usd = [
    "Best gaming phones",
    "Volt Stride Pro",
    "Prism Horizon Max",
    "Phones under $500",
    "Best battery phones",
    "ArenaOS flagships",
    "Nimbus Arc Ultra",
    "120Hz AMOLED",
  ];
  const inr = [
    "Best gaming phones",
    "Orbit Prism Mini",
    "Echo Slate Fold",
    "Phones under ₹20K",
    "Best battery phones",
    "Arena chipset phones",
    "Best camera under ₹30K",
    "120Hz AMOLED devices",
  ];
  const pool = currency === "INR" ? inr : usd;
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const offset = day % pool.length;
  return [...pool.slice(offset), ...pool.slice(0, offset)].slice(0, 5);
}
