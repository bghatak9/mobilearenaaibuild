"use client";

import { CommunityInsightsPanel } from "@/components/device-intelligence/CommunityInsightsPanel";
import { TechnicalText } from "@/components/i18n/TechnicalText";
import type { Device } from "@/lib/api";

type Props = {
  devices: Device[];
};

export function CompareCommunityInsights({ devices }: Props) {
  return (
    <div className="cmp-workspace-insight rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]/40 p-4 sm:p-6">
      <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--electric-cyan)]">
        <TechnicalText value="Community Intelligence" />
      </h2>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {devices.map((device) => (
          <div
            key={device.id}
            className="min-w-0 rounded-xl border border-white/10 bg-[var(--dark-space)]/40 p-4"
          >
            <p className="mb-3 truncate text-sm font-bold text-[var(--text-primary)]">
              {device.name}
            </p>
            <CommunityInsightsPanel
              device={device}
              discussionBasePath={`/phones/${device.slug}`}
              compact
            />
          </div>
        ))}
      </div>
    </div>
  );
}
