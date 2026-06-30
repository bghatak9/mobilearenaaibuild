"use client";

import { CheckCircle2, AlertTriangle, Circle } from "lucide-react";

import {
  AD_CATEGORIES,
  AD_PRIORITY_MATRIX,
  type AdCategoryDef,
  type AdPriority,
} from "@/lib/ad-catalog";

const PRIORITY_BADGE: Record<AdPriority, string> = {
  high: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-gray-100 text-gray-700",
  later: "bg-sky-100 text-sky-800",
  careful: "bg-rose-100 text-rose-800",
  optional: "bg-violet-100 text-violet-800",
};

function CategoryCard({ category }: { category: AdCategoryDef }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900">{category.label}</h3>
          <p className="mt-1 text-sm text-gray-500">{category.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${PRIORITY_BADGE[category.priority]}`}
          >
            {category.priority}
          </span>
          {category.recommended ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
              <CheckCircle2 size={14} /> Recommended
            </span>
          ) : category.priority === "careful" ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700">
              <AlertTriangle size={14} /> Use carefully
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              <Circle size={12} /> Optional
            </span>
          )}
        </div>
      </div>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {category.placements.map((placement) => (
          <li
            key={placement.id}
            className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
          >
            <p className="font-medium text-zinc-800">{placement.label}</p>
            <p className="mt-0.5 font-mono text-xs text-gray-500">{placement.id}</p>
            {placement.width && placement.height ? (
              <p className="mt-1 text-xs text-gray-400">
                {placement.width}×{placement.height}
              </p>
            ) : null}
            {placement.description ? (
              <p className="mt-1 text-xs text-gray-400">{placement.description}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function AdCatalogPanel() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5">
        <h2 className="text-lg font-semibold text-indigo-900">
          Recommended ad system for MobileArena
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-indigo-200 text-indigo-800">
                <th className="py-2 pr-4 font-semibold">Ad type</th>
                <th className="py-2 pr-4 font-semibold">Priority</th>
                <th className="py-2 font-semibold">Recommended</th>
              </tr>
            </thead>
            <tbody>
              {AD_PRIORITY_MATRIX.map((row) => (
                <tr key={row.type} className="border-b border-indigo-100/80">
                  <td className="py-2 pr-4 text-indigo-950">{row.type}</td>
                  <td className="py-2 pr-4">{row.priority}</td>
                  <td className="py-2">{row.recommended ? "✅" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4">
        {AD_CATEGORIES.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
        <p className="font-semibold text-zinc-800">Upload column reference</p>
        <p className="mt-2">
          CSV, Excel, and JSON uploads support:{" "}
          <code className="rounded bg-white px-1">title</code>,{" "}
          <code className="rounded bg-white px-1">link</code>,{" "}
          <code className="rounded bg-white px-1">image_url</code>,{" "}
          <code className="rounded bg-white px-1">placement</code>,{" "}
          <code className="rounded bg-white px-1">ad_type</code>,{" "}
          <code className="rounded bg-white px-1">format</code>,{" "}
          <code className="rounded bg-white px-1">width</code>,{" "}
          <code className="rounded bg-white px-1">height</code>,{" "}
          <code className="rounded bg-white px-1">sponsored</code>,{" "}
          <code className="rounded bg-white px-1">priority</code>,{" "}
          <code className="rounded bg-white px-1">advertiser</code>,{" "}
          <code className="rounded bg-white px-1">budget</code>,{" "}
          <code className="rounded bg-white px-1">active</code>,{" "}
          <code className="rounded bg-white px-1">start_date</code>,{" "}
          <code className="rounded bg-white px-1">end_date</code>.
        </p>
      </div>
    </div>
  );
}
