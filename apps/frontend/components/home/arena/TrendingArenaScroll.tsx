"use client";

import { HomeArenaCardPanel } from "@/components/home/arena/HomeArenaCardPanel";
import type { Device } from "@/lib/api";

type TrendingArenaScrollProps = {
  devices: Device[];
  emptyMessage?: string;
};

function trendingBadge(_device: Device, index: number): string {
  return index === 0 ? "Trending #1" : "Trending";
}

function trendingChip(device: Device): string | undefined {
  return device.chipset?.cpu?.split(" ").slice(0, 2).join(" ") ?? device.os ?? undefined;
}

function trendingSpec(device: Device): string | undefined {
  if (!device.display) return undefined;
  return `${device.display.size}" · ${device.display.refreshRate}Hz · ${device.battery?.capacity ?? "—"}mAh`;
}

export function TrendingArenaScroll({
  devices,
  emptyMessage = "Devices appear here as the catalog grows.",
}: TrendingArenaScrollProps) {
  return (
    <HomeArenaCardPanel
      devices={devices}
      emptyMessage={emptyMessage}
      regionLabel="Trending devices. Six cards visible at a time. Scroll vertically for more."
      pageLabelPrefix="Trending devices"
      getBadge={trendingBadge}
      getChip={trendingChip}
      getSpecPreview={trendingSpec}
    />
  );
}
