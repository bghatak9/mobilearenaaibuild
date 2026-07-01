"use client";

import Link from "next/link";
import { Scale } from "lucide-react";

import PhoneGrid from "@/components/phone/PhoneGrid";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import { MAX_COMPARE, useCompare } from "@/lib/compare-context";

export default function ComparePageInner() {
  const { items, compareHref, clear } = useCompare();

  return (
    <>
      <header className="titan-page-header mb-6">
        <SpectrumPanel className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="titan-overline mb-2">Tools</p>
              <h1 className="titan-display flex items-center gap-2.5 text-2xl sm:text-3xl">
                <Scale size={22} className="text-[var(--blue)]" strokeWidth={2} />
                Comparison Tools
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">
                Pick {2}–{MAX_COMPARE} phones for side-by-side specification scoring.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
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
                <Link href={compareHref} className="arena-btn-primary px-4 py-2.5 text-sm">
                  Compare ({items.length})
                </Link>
              ) : (
                <span className="arena-btn-secondary pointer-events-none px-4 py-2.5 text-sm opacity-50">
                  Select at least 2
                </span>
              )}
            </div>
          </div>

          {items.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--border-soft)] pt-5">
              {items.map((item) => (
                <span key={item.slug} className="titan-chip">
                  {item.name}
                </span>
              ))}
            </div>
          )}
        </SpectrumPanel>
      </header>

      <PhoneGrid />
    </>
  );
}
