"use client";

import Link from "next/link";
import { Scale } from "lucide-react";

import { ArenaShell } from "@/components/layout/ArenaShell";
import PhoneGrid from "@/components/phone/PhoneGrid";
import { GlassPanel } from "@/design-system/glass/GlassPanel";
import { MAX_COMPARE, useCompare } from "@/lib/compare-context";

export default function ComparePage() {
  const { items, compareHref, clear } = useCompare();

  return (
    <ArenaShell>
      <GlassPanel className="mb-8 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-extrabold text-[var(--text-primary)]">
              <Scale size={26} className="text-[var(--electric-cyan)]" /> Comparison Tools
            </h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Pick {2}–{MAX_COMPARE} phones for visual side-by-side scoring.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {items.length > 0 && (
              <button
                type="button"
                onClick={clear}
                className="arena-btn-ghost text-sm"
              >
                Clear ({items.length})
              </button>
            )}
            {compareHref ? (
              <Link href={compareHref} className="arena-btn-primary">
                Compare now ({items.length})
              </Link>
            ) : (
              <span className="arena-btn-secondary pointer-events-none opacity-60">
                Select at least 2
              </span>
            )}
          </div>
        </div>

        {items.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {items.map((item) => (
              <span
                key={item.slug}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[var(--text-primary)]"
              >
                {item.name}
              </span>
            ))}
          </div>
        )}
      </GlassPanel>

      <PhoneGrid />
    </ArenaShell>
  );
}
