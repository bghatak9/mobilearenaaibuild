"use client";

import { Link } from "@/i18n/navigation";

import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import { readTrendingComparisons } from "@/features/comparison";
import { useClientMounted } from "@/hooks/useClientMounted";

export function CompareTrendingClient() {
  const mounted = useClientMounted();
  const trending = mounted ? readTrendingComparisons(20) : [];

  if (!mounted) {
    return <p className="text-sm text-[var(--text-secondary)]">Loading…</p>;
  }

  if (!trending.length) {
    return (
      <SpectrumPanel className="p-8 text-center text-[var(--text-secondary)]">
        No trending comparisons yet. Start comparing phones from the{" "}
        <Link href="/compare" className="text-[var(--electric-cyan)] underline">
          comparison hub
        </Link>
        .
      </SpectrumPanel>
    );
  }

  return (
    <ul className="space-y-2">
      {trending.map((t, i) => (
        <li key={t.slug}>
          <Link
            href={`/compare/${t.slug}`}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:border-[var(--electric-cyan)]/40"
          >
            <span className="font-semibold text-[var(--text-primary)]">
              #{i + 1} {t.label}
            </span>
            <span className="text-xs text-[var(--text-secondary)]">
              {t.count} compares
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
