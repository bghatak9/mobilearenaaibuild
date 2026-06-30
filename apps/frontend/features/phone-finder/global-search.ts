import type { Device } from "@/lib/api";

import { collectBrands } from "./device-utils";
import { applyPhoneFinderFilters, filtersToSearchParams } from "./filters";
import {
  buildSearchSuggestions,
  getDailyTrendingSearches,
  type SearchSuggestion,
} from "./search-engine";
import type { SearchHistoryItem } from "./search-history";
import { parseSearchQuery } from "./search-query";
import { DEFAULT_PHONE_FINDER_FILTERS, type PhoneFinderFilters, type PriceCurrency } from "./types";

export type GlobalRecentDevice = { name: string; slug: string };

export type GlobalSearchItem =
  | { kind: "device"; id: string; device: Device }
  | { kind: "suggestion"; id: string; suggestion: SearchSuggestion }
  | { kind: "history"; id: string; query: string }
  | { kind: "trending"; id: string; query: string }
  | { kind: "recent"; id: string; device: GlobalRecentDevice }
  | { kind: "action"; id: string; label: string; href: string; icon: string };

export function buildPhoneFinderHref(
  query: string,
  patch?: Partial<PhoneFinderFilters>,
  currency: PriceCurrency = "USD",
): string {
  const parsed = parseSearchQuery(query, currency);
  const filters: PhoneFinderFilters = {
    ...DEFAULT_PHONE_FINDER_FILTERS,
    ...parsed.patch,
    ...patch,
    search: parsed.freeText || query.trim(),
    priceCurrency: currency,
  };
  const qs = filtersToSearchParams(filters).toString();
  return qs ? `/phone-finder?${qs}` : "/phone-finder";
}

export function buildGlobalSearchItems(input: {
  query: string;
  devices: Device[];
  history: SearchHistoryItem[];
  recentDevices: GlobalRecentDevice[];
  currency: PriceCurrency;
  isMobile: boolean;
  filterPatch?: Partial<PhoneFinderFilters>;
}): GlobalSearchItem[] {
  const { query, devices, history, recentDevices, currency, isMobile, filterPatch } =
    input;
  const limit = isMobile ? 5 : 8;
  const q = query.trim();
  const items: GlobalSearchItem[] = [];

  if (!q) {
    for (const h of history.slice(0, isMobile ? 4 : 6)) {
      items.push({ kind: "history", id: `h-${h.id}`, query: h.query });
    }
    for (const t of getDailyTrendingSearches(currency).slice(0, 5)) {
      items.push({ kind: "trending", id: `t-${t}`, query: t });
    }
    for (const d of recentDevices.slice(0, 4)) {
      items.push({ kind: "recent", id: `r-${d.slug}`, device: d });
    }
    items.push(
      { kind: "action", id: "nav-finder", label: "Phone Finder", href: "/phone-finder", icon: "🔍" },
      { kind: "action", id: "nav-compare", label: "Comparison Tools", href: "/compare", icon: "⚖️" },
      { kind: "action", id: "nav-upcoming", label: "Upcoming Devices", href: "/phones?upcoming=1", icon: "📅" },
      { kind: "action", id: "nav-news", label: "Latest news", href: "/news", icon: "📰" },
      { kind: "action", id: "nav-community", label: "Community", href: "/community", icon: "👥" },
      { kind: "action", id: "nav-contact", label: "Contact", href: "/contact", icon: "✉️" },
    );
    return items.slice(0, limit + 4);
  }

  const brands = collectBrands(devices);
  const suggestions = buildSearchSuggestions(q, devices, brands, {
    history: history.map((h) => h.query),
    trending: getDailyTrendingSearches(currency),
    currency,
    limit,
  });

  for (const suggestion of suggestions) {
    items.push({ kind: "suggestion", id: suggestion.id, suggestion });
  }

  const matches = applyPhoneFinderFilters(devices, {
    ...DEFAULT_PHONE_FINDER_FILTERS,
    ...filterPatch,
    search: q,
    priceCurrency: currency,
  }).slice(0, isMobile ? 4 : 6);

  for (const device of matches) {
    if (items.some((i) => i.kind === "device" && i.device.id === device.id)) continue;
    items.push({ kind: "device", id: `d-${device.id}`, device });
  }

  return items.slice(0, limit + (isMobile ? 3 : 5));
}

export function hrefForSearchItem(
  item: GlobalSearchItem,
  currency: PriceCurrency,
): string {
  switch (item.kind) {
    case "device":
      return `/phones/${item.device.slug}`;
    case "suggestion":
      return buildPhoneFinderHref(item.suggestion.query, item.suggestion.patch, currency);
    case "history":
    case "trending":
      return buildPhoneFinderHref(item.query, undefined, currency);
    case "recent":
      return `/phones/${item.device.slug}`;
    case "action":
      return item.href;
  }
}

export function labelForSearchItem(item: GlobalSearchItem): string {
  switch (item.kind) {
    case "device":
      return item.device.name;
    case "suggestion":
      return item.suggestion.label;
    case "history":
    case "trending":
      return item.query;
    case "recent":
      return item.device.name;
    case "action":
      return item.label;
  }
}

export function iconForSearchItem(item: GlobalSearchItem): string {
  switch (item.kind) {
    case "device":
      return "📱";
    case "suggestion":
      return item.suggestion.icon;
    case "history":
      return "🕐";
    case "trending":
      return "🔥";
    case "recent":
      return "👁️";
    case "action":
      return item.icon;
  }
}

let cachedDevices: Device[] | null = null;
let cachePromise: Promise<Device[]> | null = null;

export function resetGlobalSearchDeviceCache() {
  cachedDevices = null;
  cachePromise = null;
}

export async function loadGlobalSearchDevices(
  fetcher: () => Promise<Device[]>,
): Promise<Device[]> {
  if (cachedDevices) return cachedDevices;
  if (!cachePromise) {
    cachePromise = fetcher()
      .then((devices) => {
        cachedDevices = devices;
        return devices;
      })
      .catch((err) => {
        cachePromise = null;
        throw err;
      });
  }
  return cachePromise;
}

/** Re-fetch catalog in the background after the cached list is shown. */
export async function refreshGlobalSearchDevices(
  fetcher: () => Promise<Device[]>,
): Promise<Device[]> {
  const devices = await fetcher();
  cachedDevices = devices;
  return devices;
}
