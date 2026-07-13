"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getTranslationCoverage,
  type TranslationCoverageRow,
} from "@/lib/api";
import { getLocaleMeta, getMessagePackLocales } from "@/i18n/locales";

export function TranslationCoveragePanel() {
  const locales = useMemo(() => [...getMessagePackLocales()], []);
  const [rows, setRows] = useState<TranslationCoverageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getTranslationCoverage(locales)
      .then((data) => {
        if (!active) return;
        setRows(
          [...data].sort(
            (a, b) => b.percent - a.percent || a.locale.localeCompare(b.locale),
          ),
        );
        setError(null);
      })
      .catch(() => {
        if (active) {
          setError(
            "Could not load coverage. Sign in and ensure the API is running.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [locales]);

  if (loading) {
    return <p className="text-sm text-zinc-400">Loading coverage…</p>;
  }
  if (error) {
    return <p className="text-sm text-amber-300">{error}</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <table className="w-full text-sm">
        <thead className="border-b border-zinc-800 bg-zinc-900/80 text-left text-zinc-400">
          <tr>
            <th className="p-3">Locale</th>
            <th className="p-3">Coverage</th>
            <th className="p-3">News</th>
            <th className="p-3">Reviews</th>
            <th className="p-3">Devices</th>
            <th className="p-3">Brands</th>
            <th className="p-3">Categories</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const meta = getLocaleMeta(row.locale);
            return (
              <tr key={row.locale} className="border-b border-zinc-900">
                <td className="p-3">
                  <div className="font-medium text-zinc-100">
                    {meta.nativeLabel}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {meta.label} · {row.locale}
                  </div>
                </td>
                <td className="p-3">
                  <div className="mb-1 font-semibold text-zinc-100">
                    {row.percent}%
                  </div>
                  <div className="h-1.5 w-28 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${Math.min(100, row.percent)}%` }}
                    />
                  </div>
                </td>
                <td className="p-3 text-zinc-300">
                  {row.news.done}/{row.news.total}
                </td>
                <td className="p-3 text-zinc-300">
                  {row.reviews.done}/{row.reviews.total}
                </td>
                <td className="p-3 text-zinc-300">
                  {row.devices.done}/{row.devices.total}
                </td>
                <td className="p-3 text-zinc-300">
                  {row.brands
                    ? `${row.brands.done}/${row.brands.total}`
                    : "—"}
                </td>
                <td className="p-3 text-zinc-300">
                  {row.categories
                    ? `${row.categories.done}/${row.categories.total}`
                    : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
