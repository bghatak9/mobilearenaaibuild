"use client";

import { ArenaCard } from "@/design-system/cards/ArenaCard";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import { SwipePagedList } from "@/components/ui/SwipePagedList";
import { BrandName } from "@/components/brands/BrandName";
import { DeviceName } from "@/components/brands/DeviceName";
import { homeParallelTrackClass } from "@/components/home/arena/home-parallel-track";
import { formatDeviceLaunchLabel } from "@/features/phone-finder/device-utils";
import type { Device } from "@/lib/api";

export type HomeDeviceGridVariant = "default" | "trending" | "editors-choice" | "upcoming";

type HomeSwipeDeviceGridProps = {
  devices: Device[];
  variant?: HomeDeviceGridVariant;
  gridClassName?: string;
  pageSize?: number;
  emptyMessage?: string;
};

function deviceChip(device: Device, variant: HomeDeviceGridVariant): string | undefined {
  if (variant === "upcoming") return formatDeviceLaunchLabel(device);
  if (variant === "editors-choice") return device.os ?? undefined;
  return device.chipset?.cpu?.split(" ").slice(0, 2).join(" ") ?? device.os ?? undefined;
}

function deviceSpecPreview(device: Device, variant: HomeDeviceGridVariant): string | undefined {
  if (variant === "trending" && device.display) {
    return `${device.display.size}" · ${device.display.refreshRate}Hz · ${device.battery?.capacity ?? "—"}mAh`;
  }
  if (variant === "upcoming" && device.display) {
    return `${device.display.size}" · ${device.display.refreshRate ?? "—"}Hz`;
  }
  if (variant === "upcoming") return device.os ?? undefined;
  return undefined;
}

function devicePrice(device: Device, variant: HomeDeviceGridVariant): string | undefined {
  if (variant === "upcoming") {
    return device.price != null ? `$${device.price.toLocaleString()}` : "TBA";
  }
  return device.price != null ? `$${device.price.toLocaleString()}` : undefined;
}

function deviceBadge(device: Device, index: number, variant: HomeDeviceGridVariant): string | undefined {
  if (variant === "trending") return index === 0 ? "Trending #1" : "Trending";
  if (variant === "editors-choice") return "Editor Choice";
  if (variant === "upcoming") return "Upcoming Devices";
  return undefined;
}

export function HomeSwipeDeviceGrid({
  devices,
  variant = "default",
  gridClassName,
  pageSize = 4,
  emptyMessage = "Devices appear here as the catalog grows.",
}: HomeSwipeDeviceGridProps) {
  const usesParallelLayout = variant === "editors-choice";
  const resolvedGridClassName =
    gridClassName ??
    (usesParallelLayout
      ? homeParallelTrackClass(3)
      : "grid gap-5 sm:grid-cols-2 lg:grid-cols-4");
  const cardLayout = usesParallelLayout ? "horizontal" : "vertical";

  if (!devices.length) {
    return (
      <SpectrumPanel variant="accent" className="col-span-full p-10 text-center text-[var(--text-secondary)]">
        {emptyMessage}
      </SpectrumPanel>
    );
  }

  return (
    <SwipePagedList
      items={devices}
      getKey={(d) => d.id}
      className="w-full min-w-0"
      listClassName={resolvedGridClassName}
      pageSize={pageSize}
      renderItem={(d, i) => (
        <ArenaCard
          href={`/phones/${d.slug}`}
          slug={d.slug}
          deviceId={d.id}
          title={<DeviceName name={d.name} brand={d.brand?.name} />}
          subtitle={d.brand?.name ? <BrandName name={d.brand.name} /> : undefined}
          chip={deviceChip(d, variant)}
          specPreview={deviceSpecPreview(d, variant)}
          price={devicePrice(d, variant)}
          image={d.images?.[0]?.url}
          badge={deviceBadge(d, i, variant)}
          communityScore={d.rating ? Math.round(d.rating * 10) : undefined}
          layout={cardLayout}
        />
      )}
    />
  );
}
