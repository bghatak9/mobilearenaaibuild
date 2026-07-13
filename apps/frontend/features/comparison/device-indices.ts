import type { Device } from "@/lib/api";

import type { DeviceIndexScores } from "./types";

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function mainCameraMp(device: Device): number {
  if (!device.cameras?.length) return 0;
  return Math.max(...device.cameras.map((c) => c.megapixel));
}

function parseChargingWatts(charging: string | undefined): number {
  if (!charging) return 0;
  const match = charging.match(/(\d+)\s*w/i);
  return match ? Number(match[1]) : 0;
}

export function computeDeviceIndices(device: Device): DeviceIndexScores {
  const batteryCap = device.battery?.capacity ?? 0;
  const chargingW = parseChargingWatts(device.battery?.charging);
  const wireless = device.battery?.wireless ? 15 : 0;
  const batteryExcellence = clamp(
    (batteryCap / 7000) * 55 + (chargingW / 120) * 30 + wireless,
  );

  const benchmark = device.chipset?.benchmark ?? 0;
  const ram = device.ramGb ?? 0;
  const performanceIndex = clamp(
    (benchmark / 1_500_000) * 70 + (ram / 16) * 30,
  );

  const cameraCount = device.cameras?.length ?? 0;
  const cameraCapability = clamp(
    (mainCameraMp(device) / 200) * 55 +
      cameraCount * 8 +
      (device.cameras?.some((c) => c.stabilization) ? 12 : 0),
  );

  const softwareLongevity = clamp(
    (device.rating ?? 7) * 10 +
      (device.os?.toLowerCase().includes("android") ? 8 : 4),
  );

  const price = device.price ?? 60000;
  const valueRatio =
    benchmark > 0 ? benchmark / price : (device.rating ?? 7) / 10;
  const ownershipValue = clamp(valueRatio * 120_000 + (device.rating ?? 7) * 5);

  return {
    batteryExcellence,
    performanceIndex,
    cameraCapability,
    softwareLongevity,
    ownershipValue,
  };
}

export function deviceKeySpecLine(device: Device): string {
  const parts: string[] = [];
  if (device.battery?.capacity) parts.push(`${device.battery.capacity} mAh`);
  const watts = parseChargingWatts(device.battery?.charging);
  if (watts > 0) parts.push(`${watts}W`);
  if (device.display?.refreshRate) parts.push(`${device.display.refreshRate}Hz`);
  const mp = mainCameraMp(device);
  if (mp > 0) parts.push(`${mp} MP`);
  return parts.join(" • ") || "Specs loading…";
}

export const DEVICE_INDEX_LABELS: {
  key: keyof DeviceIndexScores;
  label: string;
}[] = [
  { key: "batteryExcellence", label: "Battery Excellence" },
  { key: "performanceIndex", label: "Performance Index" },
  { key: "cameraCapability", label: "Camera Capability" },
  { key: "softwareLongevity", label: "Software Longevity" },
  { key: "ownershipValue", label: "Ownership Value" },
];
