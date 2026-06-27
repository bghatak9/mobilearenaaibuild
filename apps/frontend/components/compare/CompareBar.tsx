"use client";

import Link from "next/link";
import { X, Scale } from "lucide-react";
import { MAX_COMPARE, useCompare } from "@/lib/compare-context";

export default function CompareBar() {
  const { items, remove, clear, compareHref } = useCompare();

  if (items.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-5 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-white">
          <Scale size={16} /> Compare ({items.length}/{MAX_COMPARE})
        </span>

        <div className="flex flex-1 flex-wrap items-center gap-2">
          {items.map((item) => (
            <span
              key={item.slug}
              className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-100"
            >
              {item.name}
              <button
                type="button"
                onClick={() => remove(item.slug)}
                className="text-zinc-400 hover:text-white"
                aria-label={`Remove ${item.name}`}
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={clear}
          className="text-sm text-zinc-400 hover:text-white"
        >
          Clear
        </button>

        {compareHref ? (
          <Link
            href={compareHref}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Compare now
          </Link>
        ) : (
          <span className="rounded-lg bg-zinc-800 px-5 py-2 text-sm font-medium text-zinc-500">
            Add 1 more
          </span>
        )}
      </div>
    </div>
  );
}
