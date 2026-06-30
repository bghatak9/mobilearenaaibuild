import type { Device } from "@/lib/api";
import { mainCameraMp } from "@/features/phone-finder";

/** MobileArena Arena Score — composite 0–100 from specs + community rating. */
export function computeArenaScore(device: Device): number {
  let total = 0;
  let weight = 0;

  if (device.rating != null) {
    total += (device.rating / 10) * 35;
    weight += 35;
  }

  if (device.battery?.capacity) {
    total += Math.min(device.battery.capacity / 6000, 1) * 15;
    weight += 15;
  }

  const mp = mainCameraMp(device);
  if (mp != null) {
    total += Math.min(mp / 108, 1) * 12;
    weight += 12;
  }

  if (device.display?.refreshRate) {
    total += Math.min(device.display.refreshRate / 144, 1) * 8;
    weight += 8;
  }

  if (device.chipset?.benchmark) {
    total += Math.min(device.chipset.benchmark / 2_000_000, 1) * 15;
    weight += 15;
  }

  if (device.ramGb) {
    total += Math.min(device.ramGb / 12, 1) * 8;
    weight += 8;
  }

  if (device.fiveG) {
    total += 4;
    weight += 4;
  }

  if (weight === 0) return 50;
  return Math.min(100, Math.max(0, Math.round((total / weight) * 100)));
}

export function arenaScoreLabel(score: number): string {
  if (score >= 90) return "Arena Elite";
  if (score >= 75) return "Arena Pro";
  if (score >= 60) return "Solid Pick";
  return "Entry Arena";
}
