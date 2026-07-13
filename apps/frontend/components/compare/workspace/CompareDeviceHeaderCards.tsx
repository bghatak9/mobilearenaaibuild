"use client";

import { DeviceBriefLink } from "@/components/device-brief/DeviceBriefLink";
import {
  DEVICE_INDEX_LABELS,
  computeDeviceIndices,
  deviceKeySpecLine,
} from "@/features/comparison";
import type { Device } from "@/lib/api";
import { BrandName } from "@/components/brands/BrandName";
import { DeviceName } from "@/components/brands/DeviceName";

type Props = {
  devices: Device[];
};

function DeviceCard({ device }: { device: Device }) {
  const scores = computeDeviceIndices(device);
  return (
    <article className="cmp-workspace-device-card flex h-full flex-col rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-b from-white/[0.06] to-transparent p-5">
      <DeviceBriefLink
        href={`/phones/${device.slug}`}
        className="text-lg font-extrabold tracking-tight text-[var(--text-primary)] hover:text-[var(--electric-cyan)]"
      >
        <DeviceName name={device.name} brand={device.brand?.name} />
      </DeviceBriefLink>
      <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
        {device.brand?.name ? <BrandName name={device.brand.name} /> : null}
      </p>
      <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
        {DEVICE_INDEX_LABELS.map(({ key, label }) => (
          <li
            key={key}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="text-[var(--text-secondary)]">{label}</span>
            <span className="font-bold tabular-nums text-[var(--electric-cyan)]">
              {scores[key]}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-white/10 pt-3 text-xs font-medium text-[var(--text-primary)]">
        {deviceKeySpecLine(device)}
      </p>
    </article>
  );
}

export function CompareDeviceHeaderCards({ devices }: Props) {
  if (devices.length < 2) return null;

  if (devices.length === 2) {
    return (
      <div className="cmp-workspace-cards grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
        <DeviceCard device={devices[0]} />
        <div className="flex items-center justify-center">
          <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.35em] text-[var(--text-secondary)]">
            Versus
          </span>
        </div>
        <DeviceCard device={devices[1]} />
      </div>
    );
  }

  return (
    <div className="cmp-workspace-cards grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {devices.map((device) => (
        <DeviceCard key={device.id} device={device} />
      ))}
    </div>
  );
}
