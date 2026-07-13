"use client";

import { DeviceArenaBrief } from "@/components/device-brief/DeviceArenaBrief";
import type { Device } from "@/lib/api";
import { useCompare } from "@/lib/compare-context";

export function DeviceArenaBriefHero({ device }: { device: Device }) {
  const compare = useCompare();

  return (
    <DeviceArenaBrief
      device={device}
      inCompare={compare.has(device.slug)}
      compareDisabled={compare.isFull && !compare.has(device.slug)}
      onAction={(action) => {
        if (action === "compare") {
          compare.toggle({
            id: device.id,
            slug: device.slug,
            name: device.name,
          });
        }
      }}
    />
  );
}
