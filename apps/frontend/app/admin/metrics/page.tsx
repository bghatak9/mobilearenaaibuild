"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Download, Globe, Monitor, Users } from "lucide-react";

import { RoleGate } from "@/components/admin/RoleGate";
import CountryComparisonPanel from "@/components/admin/analytics/CountryComparison";
import CountrySelector from "@/components/admin/analytics/CountrySelector";
import CountryTable from "@/components/admin/analytics/CountryTable";
import DateRangeFilter from "@/components/admin/analytics/DateRangeFilter";
import {
  exportCountryTrafficCsv,
  getAnalyticsDashboard,
  type AnalyticsDashboard,
  type AnalyticsQuery,
  type LabeledCount,
} from "@/lib/api";
import { type DatePreset, presetToRange } from "@/lib/countries";

const WorldMap = dynamic(
  () => import("@/components/admin/analytics/WorldMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm text-gray-400">
        Loading map…
      </div>
    ),
  },
);

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-bold ${accent ?? "text-zinc-900"}`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function RankList({
  title,
  items = [],
  empty = "No data yet",
}: {
  title: string;
  items?: LabeledCount[];
  empty?: string;
}) {
  const max = items[0]?.count ?? 1;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-zinc-900">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {items.map(({ label, count }) => (
            <li key={label}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="truncate text-zinc-700">{label}</span>
                <span className="ml-2 shrink-0 font-medium text-zinc-900">
                  {count.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-red-500"
                  style={{ width: `${Math.max(4, (count / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AnalyticsDashboardPage() {
  const [data, setData] = useState<AnalyticsDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [preset, setPreset] = useState<DatePreset>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [country, setCountry] = useState("ALL");
  const [compareA, setCompareA] = useState("IN");
  const [compareB, setCompareB] = useState("US");

  const query = useMemo((): AnalyticsQuery => {
    const range =
      preset === "custom"
        ? {
            from: customFrom || undefined,
            to: customTo || undefined,
          }
        : presetToRange(preset);

    return {
      ...range,
      country,
      compareA,
      compareB,
    };
  }, [preset, customFrom, customTo, country, compareA, compareB]);

  const countryOptions = useMemo(
    () =>
      (data?.byCountry ?? []).map((c) => ({ code: c.code, name: c.name })),
    [data?.byCountry],
  );

  const load = useCallback(async () => {
    try {
      setData(await getAnalyticsDashboard(query));
      setError(null);
    } catch {
      setError("Could not load analytics. Is the API running?");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  useEffect(() => {
    const timer = setInterval(load, 30_000);
    return () => clearInterval(timer);
  }, [load]);

  async function handleExport() {
    setExporting(true);
    try {
      const blob = await exportCountryTrafficCsv(query);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `country-traffic-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Export failed.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <RoleGate allowed={["SUPER_ADMIN"]}>
      <div className="p-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-zinc-900">
              <Activity className="text-red-600" size={24} />
              Real-time Analytics
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Live visitors, geo breakdown, and country intelligence.
              {data?.updatedAt && (
                <span className="ml-2 text-gray-400">
                  Updated {new Date(data.updatedAt).toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleExport()}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-red-300 disabled:opacity-60"
            >
              <Download size={16} />
              {exporting ? "Exporting…" : "Export CSV"}
            </button>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                void load();
              }}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-red-300"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto]">
          <DateRangeFilter
            preset={preset}
            from={customFrom}
            to={customTo}
            onPresetChange={setPreset}
            onFromChange={setCustomFrom}
            onToChange={setCustomTo}
          />
          <CountrySelector
            label="Filter by country"
            value={country}
            onChange={setCountry}
            options={countryOptions}
            className="lg:min-w-[260px]"
          />
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </p>
        )}

        {loading && !data ? (
          <p className="text-gray-400">Loading analytics…</p>
        ) : data ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard
                label="Online now"
                value={data.liveNow}
                accent="text-emerald-600"
              />
              <StatCard label="Today" value={data.today} />
              <StatCard label="This month" value={data.thisMonth} />
              <StatCard label="This year" value={data.thisYear} />
              <StatCard label="All time" value={data.allTime} />
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <WorldMap data={data.byCountry} />
              <CountryTable rows={data.topCountries} />
            </div>

            <div className="mt-4">
              <CountryComparisonPanel
                data={data.comparison}
                compareA={compareA}
                compareB={compareB}
                countryOptions={countryOptions}
                onCompareAChange={setCompareA}
                onCompareBChange={setCompareB}
              />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <RankList title="Top cities" items={data.topCities} />
              <RankList title="Top pages" items={data.topPages} />
              <RankList title="Referrers" items={data.referrers} />
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <RankList title="Devices" items={data.devices} />
              <RankList
                title="Operating systems"
                items={data.operatingSystems}
              />
              <RankList title="Browsers" items={data.browsers} />
            </div>

            <div className="mt-6 flex flex-wrap gap-6 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Users size={14} /> Unique visitors per period
              </span>
              <span className="flex items-center gap-1">
                <Globe size={14} /> Geo from IP · flags via ISO codes
              </span>
              <span className="flex items-center gap-1">
                <Monitor size={14} /> Auto-refresh every 30s
              </span>
            </div>
          </>
        ) : null}
      </div>
    </RoleGate>
  );
}
