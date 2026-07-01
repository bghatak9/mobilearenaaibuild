"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Scale } from "lucide-react";
import { MAX_COMPARE, useCompare } from "@/lib/compare-context";
import { hideMobileChrome } from "@/lib/mobile-routes";

export default function CompareBar() {
  const pathname = usePathname();
  const { items, remove, clear, compareHref } = useCompare();

  if (hideMobileChrome(pathname)) return null;
  if (items.length === 0) return null;

  return (
    <div
      id="arena-compare-bar"
      className="arena-mobile-bottom-offset fixed inset-x-0 z-[45] border-t border-white/10 bg-[var(--surface-card)]/95 backdrop-blur-xl lg:bottom-0"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 md:flex-wrap md:px-5 md:py-3">
        <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-white md:text-sm">
          <Scale size={15} />
          <span className="whitespace-nowrap">
            {items.length}/{MAX_COMPARE}
          </span>
        </span>

        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
          {items.map((item) => (
            <span
              key={item.slug}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-100 md:text-sm"
            >
              <span className="max-w-[6.5rem] truncate md:max-w-[8rem]">
                {item.name}
              </span>
              <button
                type="button"
                onClick={() => remove(item.slug)}
                className="text-zinc-400 hover:text-white"
                aria-label={`Remove ${item.name}`}
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={clear}
            className="text-xs text-zinc-400 hover:text-white md:text-sm"
          >
            Clear
          </button>

          {compareHref ? (
            <Link
              href={compareHref}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 md:px-4 md:py-2 md:text-sm"
            >
              Compare
            </Link>
          ) : (
            <span className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-500 md:px-4 md:py-2 md:text-sm">
              +1
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
