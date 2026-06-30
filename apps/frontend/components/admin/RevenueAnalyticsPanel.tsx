"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  DollarSign,
  HandCoins,
  Loader2,
  Megaphone,
  Sparkles,
  Target,
} from "lucide-react";

import DateRangeFilter from "@/components/admin/analytics/DateRangeFilter";
import CountrySelector from "@/components/admin/analytics/CountrySelector";
import { getAdRevenueAnalytics, type AdRevenueReport } from "@/lib/api";
import {
  countryFlag,
  countryName,
  mergeCountryOptions,
  type DatePreset,
  presetToRange,
} from "@/lib/countries";

function money(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function RevenueColumn({
  title,
  subtitle,
  total,
  icon: Icon,
  accent,
  children,
}: {
  title: string;
  subtitle: string;
  total: number;
  icon: typeof DollarSign;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`flex flex-col rounded-xl border bg-white ${accent}`}>
      <div className="border-b border-inherit p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Icon size={18} className="opacity-80" />
              <h3 className="font-semibold text-zinc-900">{title}</h3>
            </div>
            <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
          </div>
          <p className="text-xl font-bold text-zinc-900">{money(total)}</p>
        </div>
      </div>
      <div className="flex-1 p-4">{children}</div>
    </section>
  );
}

export default function RevenueAnalyticsPanel() {
  const [report, setReport] = useState<AdRevenueReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [preset, setPreset] = useState<DatePreset>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [country, setCountry] = useState("ALL");

  const dateRange = useMemo(
    () =>
      preset === "custom"
        ? {
            from: customFrom || undefined,
            to: customTo || undefined,
          }
        : presetToRange(preset),
    [preset, customFrom, customTo],
  );

  const query = useMemo(
    () => ({
      ...dateRange,
      country,
    }),
    [dateRange, country],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setReport(await getAdRevenueAnalytics(query));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  const countryOptions = useMemo(
    () => mergeCountryOptions(report?.byCountry ?? []),
    [report?.byCountry],
  );

  const analytics = report?.revenueAnalytics;

  const filtersBar = (
    <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
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
  );

  if (loading && !report) {
    return (
      <div className="space-y-6">
        {filtersBar}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 size={16} className="animate-spin" /> Loading revenue analytics…
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        {filtersBar}
        <p className="text-sm text-gray-500">
          {error || "No revenue analytics available yet. Upload ads and run campaigns to see data."}
        </p>
      </div>
    );
  }

  const { adRevenue, affiliateEarnings, sponsoredContentIncome, campaignPerformance } =
    analytics;

  return (
    <div className="space-y-6">
      {filtersBar}

      {country !== "ALL" && (
        <p className="text-sm text-gray-600">
          Showing revenue from{" "}
          <span className="font-medium">
            {countryFlag(country)} {countryName(country)}
          </span>
          .
        </p>
      )}

      {loading && report ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 size={16} className="animate-spin" /> Updating…
        </div>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-4">
        <RevenueColumn
          title="Ad revenue"
          subtitle="Display, native, in-article & banner ads"
          total={adRevenue.total}
          icon={Megaphone}
          accent="border-sky-200"
        >
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Impressions</dt>
              <dd>{adRevenue.impressions.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Clicks</dt>
              <dd>{adRevenue.clicks.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">CTR</dt>
              <dd>{adRevenue.ctr}%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Active ads</dt>
              <dd>{adRevenue.adCount}</dd>
            </div>
          </dl>
          {adRevenue.byAdType.length > 0 ? (
            <ul className="mt-4 space-y-2 border-t border-gray-100 pt-3 text-xs">
              {adRevenue.byAdType.slice(0, 5).map((row) => (
                <li key={row.adType} className="flex justify-between gap-2">
                  <span className="capitalize text-gray-600">{row.adType.replace(/-/g, " ")}</span>
                  <span className="font-medium">{money(row.revenue)}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </RevenueColumn>

        <RevenueColumn
          title="Affiliate earnings"
          subtitle="Buy-now, Amazon & partner links"
          total={affiliateEarnings.total}
          icon={HandCoins}
          accent="border-emerald-200"
        >
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Clicks</dt>
              <dd>{affiliateEarnings.clicks.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">CTR</dt>
              <dd>{affiliateEarnings.ctr}%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Affiliate ads</dt>
              <dd>{affiliateEarnings.adCount}</dd>
            </div>
          </dl>
          {affiliateEarnings.byPlacement.length > 0 ? (
            <ul className="mt-4 space-y-2 border-t border-gray-100 pt-3 text-xs">
              {affiliateEarnings.byPlacement.slice(0, 5).map((row) => (
                <li key={row.placement} className="flex justify-between gap-2">
                  <span className="truncate font-mono text-gray-600">{row.placement}</span>
                  <span className="shrink-0 font-medium">{money(row.revenue)}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </RevenueColumn>

        <RevenueColumn
          title="Sponsored content"
          subtitle="Sponsored articles, reviews & brand deals"
          total={sponsoredContentIncome.total}
          icon={Sparkles}
          accent="border-amber-200"
        >
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Impressions</dt>
              <dd>{sponsoredContentIncome.impressions.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Active deals</dt>
              <dd>{sponsoredContentIncome.activeDeals}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">CTR</dt>
              <dd>{sponsoredContentIncome.ctr}%</dd>
            </div>
          </dl>
          {sponsoredContentIncome.byAd.length > 0 ? (
            <ul className="mt-4 space-y-2 border-t border-gray-100 pt-3 text-xs">
              {sponsoredContentIncome.byAd.slice(0, 5).map((row) => (
                <li key={row.id} className="flex justify-between gap-2">
                  <span className="truncate text-gray-600">{row.title}</span>
                  <span className="shrink-0 font-medium">{money(row.revenue)}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </RevenueColumn>

        <RevenueColumn
          title="Campaign performance"
          subtitle="Budget, goals & ROI across campaigns"
          total={report?.summary.estimatedRevenue ?? 0}
          icon={Target}
          accent="border-violet-200"
        >
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Active campaigns</dt>
              <dd>{report?.summary.activeCampaigns ?? 0}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Scheduled</dt>
              <dd>{report?.summary.scheduledCampaigns ?? 0}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Total ads</dt>
              <dd>{report?.summary.totalAds ?? 0}</dd>
            </div>
          </dl>
          {campaignPerformance.length > 0 ? (
            <ul className="mt-4 space-y-2 border-t border-gray-100 pt-3 text-xs">
              {campaignPerformance.slice(0, 5).map((row) => (
                <li key={row.id} className="flex justify-between gap-2">
                  <span className="truncate text-gray-600">{row.name}</span>
                  <span className="shrink-0 font-medium">{row.performanceScore}/10</span>
                </li>
              ))}
            </ul>
          ) : null}
        </RevenueColumn>
      </div>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900">
          <BarChart3 size={16} /> Campaign performance detail
        </h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Campaign</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Revenue</th>
                <th className="px-4 py-3">Budget used</th>
                <th className="px-4 py-3">Goal</th>
                <th className="px-4 py-3">CTR</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {campaignPerformance.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3 text-xs">{row.status}</td>
                  <td className="px-4 py-3">{money(row.estimatedRevenue)}</td>
                  <td className="px-4 py-3 text-xs">
                    {row.budgetUsedPct != null ? `${row.budgetUsedPct}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {row.goalProgress != null ? `${row.goalProgress}%` : "—"}
                  </td>
                  <td className="px-4 py-3">{row.ctr}%</td>
                  <td className="px-4 py-3 font-medium">{row.performanceScore}/10</td>
                  <td className="px-4 py-3 text-xs">
                    {row.roi != null ? `${row.roi}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-gray-400">
        Ad revenue uses CPM + CPC. Affiliate earnings use clicks × CPC (default $2.50/click).
        Sponsored income uses campaign rates.
        {report?.filters?.from || report?.filters?.to || report?.filters?.country ? (
          <>
            {" "}
            Period:{" "}
            {report.filters.from
              ? new Date(report.filters.from).toLocaleDateString()
              : "start"}
            {" – "}
            {report.filters.to
              ? new Date(report.filters.to).toLocaleDateString()
              : "now"}
            {report.filters.country && report.filters.country !== "ALL"
              ? ` · ${countryName(report.filters.country)}`
              : " · Worldwide"}
            .
          </>
        ) : (
          <> Worldwide.</>
        )}{" "}
        Generated{" "}
        {report?.generatedAt ? new Date(report.generatedAt).toLocaleString() : ""}.
      </p>
    </div>
  );
}
