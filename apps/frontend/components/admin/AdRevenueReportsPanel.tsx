"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart3, Loader2, MousePointerClick, Eye, DollarSign } from "lucide-react";

import { getAdRevenueReport, type AdRevenueReport } from "@/lib/api";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Eye;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase text-gray-500">
        <Icon size={14} /> {label}
      </div>
      <p className="mt-2 text-2xl font-bold text-zinc-900">{value}</p>
    </div>
  );
}

export default function AdRevenueReportsPanel() {
  const [report, setReport] = useState<AdRevenueReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setReport(
        await getAdRevenueReport({
          from: from || undefined,
          to: to || undefined,
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && !report) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 size={16} className="animate-spin" /> Loading revenue report…
      </div>
    );
  }

  const summary = report?.summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="text-xs font-medium text-gray-500">From</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 block rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-gray-500">To</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 block rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Apply filter
        </button>
      </div>

      {error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      ) : null}

      {summary ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Impressions"
              value={summary.totalImpressions.toLocaleString()}
              icon={Eye}
            />
            <StatCard
              label="Clicks"
              value={summary.totalClicks.toLocaleString()}
              icon={MousePointerClick}
            />
            <StatCard label="CTR" value={`${summary.ctr}%`} icon={BarChart3} />
            <StatCard
              label="Est. revenue"
              value={`$${summary.estimatedRevenue.toLocaleString()}`}
              icon={DollarSign}
            />
          </div>

          <p className="text-xs text-gray-500">
            Revenue = (impressions ÷ 1000 × CPM) + (clicks × CPC) per campaign.
            {summary.activeCampaigns} active · {summary.scheduledCampaigns} scheduled ·{" "}
            {summary.totalAds} ads total.
          </p>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-zinc-900">By campaign</h3>
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Campaign</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Impressions</th>
                    <th className="px-4 py-3">Clicks</th>
                    <th className="px-4 py-3">CTR</th>
                    <th className="px-4 py-3">Revenue</th>
                    <th className="px-4 py-3">Goal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(report?.byCampaign ?? []).map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3 font-medium">{row.name}</td>
                      <td className="px-4 py-3 text-xs">{row.status}</td>
                      <td className="px-4 py-3">{row.impressions.toLocaleString()}</td>
                      <td className="px-4 py-3">{row.clicks.toLocaleString()}</td>
                      <td className="px-4 py-3">{row.ctr}%</td>
                      <td className="px-4 py-3">${row.estimatedRevenue.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {row.goalProgress != null ? `${row.goalProgress}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-zinc-900">By ad</h3>
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Ad</th>
                    <th className="px-4 py-3">Placement</th>
                    <th className="px-4 py-3">Campaign</th>
                    <th className="px-4 py-3">Impressions</th>
                    <th className="px-4 py-3">Clicks</th>
                    <th className="px-4 py-3">CTR</th>
                    <th className="px-4 py-3">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(report?.byAd ?? []).map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3 font-medium">{row.title}</td>
                      <td className="px-4 py-3 font-mono text-xs">{row.placement}</td>
                      <td className="px-4 py-3 text-xs">{row.campaignName ?? "—"}</td>
                      <td className="px-4 py-3">{row.impressions.toLocaleString()}</td>
                      <td className="px-4 py-3">{row.clicks.toLocaleString()}</td>
                      <td className="px-4 py-3">{row.ctr}%</td>
                      <td className="px-4 py-3">${row.estimatedRevenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {(report?.daily.length ?? 0) > 0 ? (
            <section>
              <h3 className="mb-3 text-sm font-semibold text-zinc-900">Daily activity</h3>
              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Impressions</th>
                      <th className="px-4 py-3">Clicks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {report!.daily.map((row) => (
                      <tr key={row.date}>
                        <td className="px-4 py-3">{row.date}</td>
                        <td className="px-4 py-3">{row.impressions.toLocaleString()}</td>
                        <td className="px-4 py-3">{row.clicks.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
