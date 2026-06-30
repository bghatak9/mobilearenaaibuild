"use client";

import type { CountryStat } from "@/lib/api";
import { countryFlag } from "@/lib/countries";

export default function CountryTable({
  rows = [],
}: {
  rows?: CountryStat[];
}) {
  const top = rows.slice(0, 10);
  const max = top[0]?.visitors ?? 1;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-zinc-900">
        Top 10 countries
      </h2>
      {top.length === 0 ? (
        <p className="text-sm text-gray-400">No country data for this range.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="pb-2 pr-4">#</th>
                <th className="pb-2 pr-4">Country</th>
                <th className="pb-2 pr-4 text-right">Visitors</th>
                <th className="pb-2 text-right">Page views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {top.map((row, i) => {
                const visitors = row.visitors ?? 0;
                const pageViews = row.pageViews ?? 0;
                return (
                <tr key={row.code ?? i} className="hover:bg-gray-50">
                  <td className="py-2.5 pr-4 text-gray-400">{i + 1}</td>
                  <td className="py-2.5 pr-4">
                    <span className="mr-2">{countryFlag(row.code)}</span>
                    <span className="font-medium text-zinc-800">{row.name}</span>
                    {row.code !== "Unknown" && (
                      <span className="ml-2 text-xs text-gray-400">{row.code}</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-medium">
                    {visitors.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right text-gray-600">
                    {pageViews.toLocaleString()}
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
          <div className="mt-3 space-y-2">
            {top.slice(0, 5).map((row) => {
              const visitors = row.visitors ?? 0;
              return (
              <div key={`bar-${row.code}`}>
                <div className="mb-0.5 flex justify-between text-xs text-gray-500">
                  <span>
                    {countryFlag(row.code)} {row.name}
                  </span>
                  <span>{visitors}</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-red-500"
                    style={{
                      width: `${Math.max(4, (visitors / max) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
