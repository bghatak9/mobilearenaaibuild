"use client";

import type { ProfileBadge } from "@/lib/api";

const FINDER_BADGES = [
  { slug: "explorer", emoji: "🥉", label: "Explorer" },
  { slug: "reviewer", emoji: "🥈", label: "Reviewer" },
  { slug: "expert", emoji: "🥇", label: "Expert" },
  { slug: "elite", emoji: "💎", label: "Elite Member" },
  { slug: "legend", emoji: "👑", label: "Community Legend" },
];

export function GamificationStrip({ earned }: { earned: ProfileBadge[] }) {
  const earnedSlugs = new Set(earned.map((b) => b.slug));

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
        Your badges
      </span>
      {FINDER_BADGES.map((b) => {
        const active = earnedSlugs.has(b.slug);
        return (
          <span
            key={b.slug}
            title={b.label}
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
              active
                ? "border-[var(--premium-gold)]/40 bg-[var(--premium-gold)]/10 text-[var(--premium-gold)]"
                : "border-white/10 bg-white/5 text-[var(--text-secondary)] opacity-50"
            }`}
          >
            {b.emoji} {b.label}
          </span>
        );
      })}
    </div>
  );
}
