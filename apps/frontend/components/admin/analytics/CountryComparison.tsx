"use client";

import type { CountryComparison } from "@/lib/api";
import { countryFlag } from "@/lib/countries";
import CountrySelector from "./CountrySelector";

export default function CountryComparisonPanel({
  data = [],
  compareA,
  compareB,
  countryOptions,
  onCompareAChange,
  onCompareBChange,
}: {
  data?: CountryComparison[];
  compareA: string;
  compareB: string;
  countryOptions: { code: string; name: string }[];
  onCompareAChange: (code: string) => void;
  onCompareBChange: (code: string) => void;
}) {
  const [a, b] = data;
  const max = Math.max(a?.visitors ?? 0, b?.visitors ?? 0, 1);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-zinc-900">
        Country comparison
      </h2>
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <CountrySelector
          label="Country A"
          value={compareA}
          onChange={onCompareAChange}
          options={countryOptions}
        />
        <CountrySelector
          label="Country B"
          value={compareB}
          onChange={onCompareBChange}
          options={countryOptions}
        />
      </div>

      {!a || !b ? (
        <p className="text-sm text-gray-400">Select two countries to compare.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {[a, b].map((c) => (
            <div
              key={c.code}
              className="rounded-lg border border-gray-100 bg-gray-50 p-4"
            >
              <div className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
                <span>{countryFlag(c.code)}</span>
                {c.name}
              </div>
              <p className="mt-2 text-3xl font-bold text-red-600">
                {c.visitors.toLocaleString()}
                <span className="ml-1 text-sm font-normal text-gray-500">
                  visitors
                </span>
              </p>
              <p className="text-sm text-gray-500">
                {c.pageViews.toLocaleString()} page views · {c.share}% share
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-red-500"
                  style={{
                    width: `${Math.max(4, (c.visitors / max) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
