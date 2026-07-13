"use client";

import {
  buildAdvantageSummary,
  groupAdvantagesByDevice,
} from "@/features/comparison";
import type { Device } from "@/lib/api";
import { DeviceName } from "@/components/brands/DeviceName";

type Props = {
  devices: Device[];
};

export function CompareInsightStrip({ devices }: Props) {
  const advantages = buildAdvantageSummary(devices);
  const grouped = groupAdvantagesByDevice(advantages, devices.length);

  if (!advantages.length) return null;

  return (
    <section
      className="cmp-workspace-insight rounded-2xl border border-[var(--border-accent)]/25 bg-gradient-to-r from-[var(--electric-cyan)]/8 to-[var(--aurora-purple)]/8 p-5 md:p-6"
      aria-label="Advantage summary"
    >
      <h2 className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--electric-cyan)]">
        Insight strip · Advantage summary
      </h2>
      <div
        className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {devices.map((device, i) => {
          const list = grouped[i] ?? [];
          if (!list.length) return null;
          return (
            <div key={device.id}>
              <h3 className="font-bold text-[var(--text-primary)]">
                <DeviceName name={device.name} brand={device.brand?.name} />
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-[var(--text-secondary)]">
                {list.map((label) => (
                  <li key={label} className="flex items-start gap-2">
                    <span className="text-[var(--emerald-success)]" aria-hidden>
                      ▲
                    </span>
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
