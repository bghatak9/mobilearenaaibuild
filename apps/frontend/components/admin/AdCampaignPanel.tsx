"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import {
  createAdCampaign,
  deleteAdCampaign,
  listAdCampaigns,
  updateAdCampaign,
  type AdCampaign,
  type AdCampaignStatus,
} from "@/lib/api";

const STATUSES: AdCampaignStatus[] = [
  "DRAFT",
  "SCHEDULED",
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
];

const STATUS_COLORS: Record<AdCampaignStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SCHEDULED: "bg-sky-100 text-sky-800",
  ACTIVE: "bg-emerald-100 text-emerald-800",
  PAUSED: "bg-amber-100 text-amber-800",
  COMPLETED: "bg-violet-100 text-violet-800",
};

function toInputDate(value?: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export default function AdCampaignPanel() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    advertiser: "",
    budget: "",
    cpm: "",
    cpc: "",
    revenueGoal: "",
    status: "DRAFT" as AdCampaignStatus,
    startsAt: "",
    endsAt: "",
    description: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setCampaigns(await listAdCampaigns());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createAdCampaign({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        advertiser: form.advertiser.trim() || undefined,
        budget: form.budget ? Number(form.budget) : undefined,
        cpm: form.cpm ? Number(form.cpm) : undefined,
        cpc: form.cpc ? Number(form.cpc) : undefined,
        revenueGoal: form.revenueGoal ? Number(form.revenueGoal) : undefined,
        status: form.status,
        startsAt: form.startsAt || undefined,
        endsAt: form.endsAt || undefined,
      });
      setShowForm(false);
      setForm({
        name: "",
        advertiser: "",
        budget: "",
        cpm: "",
        cpc: "",
        revenueGoal: "",
        status: "DRAFT",
        startsAt: "",
        endsAt: "",
        description: "",
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create campaign");
    } finally {
      setSaving(false);
    }
  }

  async function patchCampaign(
    id: number,
    patch: Parameters<typeof updateAdCampaign>[1],
  ) {
    setError("");
    try {
      await updateAdCampaign(id, patch);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update campaign");
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`Delete campaign "${name}"? Ads will be unlinked.`)) return;
    setError("");
    try {
      await deleteAdCampaign(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete campaign");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 size={16} className="animate-spin" /> Loading campaigns…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          Group ads into campaigns with shared budgets, CPM/CPC rates, and schedules.
        </p>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          <Plus size={16} /> New campaign
        </button>
      </div>

      {error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      ) : null}

      {showForm ? (
        <form
          onSubmit={handleCreate}
          className="grid gap-3 rounded-xl border border-gray-200 bg-white p-5 sm:grid-cols-2"
        >
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-gray-500">Campaign name *</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500">Advertiser</span>
            <input
              value={form.advertiser}
              onChange={(e) => setForm((f) => ({ ...f, advertiser: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500">Status</span>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value as AdCampaignStatus }))
              }
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500">Budget ($)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.budget}
              onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500">Revenue goal ($)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.revenueGoal}
              onChange={(e) => setForm((f) => ({ ...f, revenueGoal: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500">CPM ($)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.cpm}
              onChange={(e) => setForm((f) => ({ ...f, cpm: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500">CPC ($)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.cpc}
              onChange={(e) => setForm((f) => ({ ...f, cpc: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500">Start date</span>
            <input
              type="date"
              value={form.startsAt}
              onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500">End date</span>
            <input
              type="date"
              value={form.endsAt}
              onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-gray-500">Description</span>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Create campaign"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {campaigns.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
          No campaigns yet. Create one to organize ads and track revenue.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Campaign</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Schedule</th>
                <th className="px-4 py-3">Rates</th>
                <th className="px-4 py-3">Ads</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900">{c.name}</p>
                    {c.advertiser ? (
                      <p className="text-xs text-gray-500">{c.advertiser}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={c.status}
                      onChange={(e) =>
                        void patchCampaign(c.id, {
                          status: e.target.value as AdCampaignStatus,
                        })
                      }
                      className={`rounded-full border-0 px-2 py-1 text-xs font-semibold ${STATUS_COLORS[c.status]}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    <div className="flex flex-col gap-1">
                      <label className="flex items-center gap-2">
                        <span className="w-8 text-gray-400">From</span>
                        <input
                          type="date"
                          defaultValue={toInputDate(c.startsAt)}
                          onBlur={(e) =>
                            void patchCampaign(c.id, {
                              startsAt: e.target.value || null,
                            })
                          }
                          className="rounded border border-gray-200 px-2 py-1"
                        />
                      </label>
                      <label className="flex items-center gap-2">
                        <span className="w-8 text-gray-400">To</span>
                        <input
                          type="date"
                          defaultValue={toInputDate(c.endsAt)}
                          onBlur={(e) =>
                            void patchCampaign(c.id, {
                              endsAt: e.target.value || null,
                            })
                          }
                          className="rounded border border-gray-200 px-2 py-1"
                        />
                      </label>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    CPM ${c.cpm ?? "—"} · CPC ${c.cpc ?? "—"}
                    {c.budget != null ? (
                      <p className="mt-1">Budget ${c.budget.toLocaleString()}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{c._count?.advertisements ?? 0}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void handleDelete(c.id, c.name)}
                      className="rounded p-1 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                      aria-label={`Delete ${c.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
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
