"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  listAdCampaigns,
  listManagedAds,
  updateManagedAd,
  type AdCampaign,
  type ManagedAdvertisement,
} from "@/lib/api";

function toInputDate(value?: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

function scheduleLabel(ad: ManagedAdvertisement): string {
  const start = ad.startsAt ?? ad.campaign?.startsAt;
  const end = ad.endsAt ?? ad.campaign?.endsAt;
  if (!start && !end) return "Always on";
  const fmt = (v: string) => new Date(v).toLocaleDateString();
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  if (start) return `From ${fmt(start)}`;
  return `Until ${fmt(end!)}`;
}

export default function AdSchedulePanel() {
  const [ads, setAds] = useState<ManagedAdvertisement[]>([]);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [adList, campaignList] = await Promise.all([
        listManagedAds(),
        listAdCampaigns(),
      ]);
      setAds(adList);
      setCampaigns(campaignList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function patchAd(
    id: number,
    patch: Parameters<typeof updateManagedAd>[1],
  ) {
    setError("");
    try {
      await updateManagedAd(id, patch);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update ad");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 size={16} className="animate-spin" /> Loading ads…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Toggle ads on/off, set start/end dates, and assign campaigns. Ads inherit
        campaign dates when their own dates are empty.
      </p>

      {error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      ) : null}

      {ads.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
          No ads uploaded yet. Use the Upload ads tab to add advertisements.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Ad</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Campaign</th>
                <th className="px-4 py-3">Schedule</th>
                <th className="px-4 py-3">Start</th>
                <th className="px-4 py-3">End</th>
                <th className="px-4 py-3">Stats</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ads.map((ad) => (
                <tr key={ad.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900">{ad.title}</p>
                    <p className="font-mono text-xs text-gray-500">{ad.placement}</p>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={ad.active}
                      onChange={(e) =>
                        void patchAd(ad.id, { active: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-red-600"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={ad.campaignId ?? ""}
                      onChange={(e) =>
                        void patchAd(ad.id, {
                          campaignId: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      className="max-w-[160px] rounded border border-gray-200 px-2 py-1 text-xs"
                    >
                      <option value="">None</option>
                      {campaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{scheduleLabel(ad)}</td>
                  <td className="px-4 py-3">
                    <input
                      type="date"
                      defaultValue={toInputDate(ad.startsAt)}
                      onBlur={(e) =>
                        void patchAd(ad.id, {
                          startsAt: e.target.value || null,
                        })
                      }
                      className="rounded border border-gray-200 px-2 py-1 text-xs"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="date"
                      defaultValue={toInputDate(ad.endsAt)}
                      onBlur={(e) =>
                        void patchAd(ad.id, {
                          endsAt: e.target.value || null,
                        })
                      }
                      className="rounded border border-gray-200 px-2 py-1 text-xs"
                    />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {ad.impressionCount.toLocaleString()} imp
                    <br />
                    {ad.clickCount.toLocaleString()} clicks
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
