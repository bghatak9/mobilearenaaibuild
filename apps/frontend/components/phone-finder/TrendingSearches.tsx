"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";

import {
  getDailyTrendingSearches,
  TRENDING_FINDER_SEARCHES,
} from "@/features/phone-finder";
import type { PhoneFinderFilters } from "@/features/phone-finder/types";

export function TrendingSearches({
  onPick,
  priceCurrency = "USD",
}: {
  onPick: (params: URLSearchParams, label: string) => void;
  priceCurrency?: PhoneFinderFilters["priceCurrency"];
}) {
  const daily = useMemo(
    () => getDailyTrendingSearches(priceCurrency),
    [priceCurrency],
  );

  const items = [
    ...daily.map((q) => ({
      label: q,
      params: new URLSearchParams({ q }),
    })),
    ...TRENDING_FINDER_SEARCHES.map((t) => ({
      label: t.label,
      params: new URLSearchParams({
        ...("q" in t && t.q ? { q: t.q } : {}),
        ...("params" in t && t.params ? t.params : {}),
      }),
    })),
  ].slice(0, 8);

  return (
    <div className="mb-6">
      <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
        <TrendingUp size={14} className="text-[var(--electric-cyan)]" />
        🔥 Trending today
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onPick(item.params, item.label)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-[var(--text-primary)] transition hover:border-[var(--electric-cyan)]/40 hover:text-[var(--electric-cyan)]"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
