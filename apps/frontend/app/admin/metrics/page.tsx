"use client";

import { useEffect, useState } from "react";

import { RoleGate } from "@/components/admin/RoleGate";
import { API_URL } from "@/lib/api";

type HealthReady = {
  status: string;
  info?: {
    db?: { status: string; latencyMs?: number };
    cache?: { status: string };
  };
};

export default function MetricsDashboardPage() {
  const [health, setHealth] = useState<HealthReady | null>(null);
  const [uptime, setUptime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [live, ready] = await Promise.all([
          fetch(`${API_URL}/health`).then((r) => r.json()),
          fetch(`${API_URL}/health/ready`).then((r) => r.json()),
        ]);
        setUptime(live.uptime ?? null);
        setHealth(ready);
      } catch {
        setError("Could not reach the API metrics endpoints.");
      }
    })();
  }, []);

  return (
    <RoleGate allowed={["SUPER_ADMIN"]}>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-zinc-900">Metrics Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Operational health and Prometheus scrape endpoint.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </p>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-medium uppercase text-gray-500">Uptime</p>
            <p className="mt-2 text-2xl font-bold text-zinc-900">
              {uptime != null ? `${Math.floor(uptime / 60)}m` : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-medium uppercase text-gray-500">
              Database
            </p>
            <p className="mt-2 text-2xl font-bold text-zinc-900">
              {health?.info?.db?.status ?? "—"}
            </p>
            {health?.info?.db?.latencyMs != null && (
              <p className="text-xs text-gray-400">
                {health.info.db.latencyMs}ms
              </p>
            )}
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-medium uppercase text-gray-500">Cache</p>
            <p className="mt-2 text-2xl font-bold text-zinc-900">
              {health?.info?.cache?.status ?? "—"}
            </p>
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Raw Prometheus metrics:{" "}
          <a
            href={`${API_URL}/metrics`}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-red-600 hover:underline"
          >
            {API_URL}/metrics
          </a>
        </p>
      </div>
    </RoleGate>
  );
}
