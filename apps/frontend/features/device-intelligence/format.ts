import type { Device } from "@/lib/api";
import { formatMonthYear } from "@/lib/format-datetime";

import type { DeviceIntelligencePayload, IntelligenceContext } from "./types";

export function ext(
  payload: DeviceIntelligencePayload,
  path: string,
): string | null | undefined {
  const parts = path.split(".");
  let cur: unknown = payload;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  if (cur == null) return undefined;
  if (typeof cur === "boolean") return cur ? "Yes" : "No";
  if (typeof cur === "number") return String(cur);
  if (typeof cur === "string") return cur || undefined;
  return undefined;
}

export function yesNo(value: boolean | null | undefined): string | null {
  if (value == null) return null;
  return value ? "Yes" : "No";
}

export function formatInr(amount: number | null | undefined): string | null {
  if (amount == null) return null;
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const formatted = formatMonthYear(iso, "");
  return formatted || null;
}

export function mainCameraMp(device: Device): number | null {
  if (!device.cameras?.length) return null;
  return Math.max(...device.cameras.map((c) => c.megapixel));
}

export function cameraByType(device: Device, type: string) {
  return device.cameras?.find((c) =>
    c.type.toLowerCase().includes(type.toLowerCase()),
  );
}

export function parseChargingWatts(charging: string | undefined): number | null {
  if (!charging) return null;
  const match = charging.match(/(\d+)\s*w/i);
  return match ? Number(match[1]) : null;
}

export function currentMarketPrice(device: Device): number | null {
  const offer = device.affiliateOffers?.[0];
  if (offer?.price) return offer.price;
  const history = device.priceHistory;
  if (history?.length) return history[history.length - 1].price;
  return device.price ?? null;
}

export function countryVariants(device: Device): string | null {
  const codes = device.countryAvailability
    ?.filter((c) => c.available)
    .map((c) => c.countryCode);
  return codes?.length ? codes.join(", ") : null;
}

export function createContext(
  device: Device,
  payload: DeviceIntelligencePayload = {},
): IntelligenceContext {
  return {
    device,
    payload: {
      ...(device.intelligence ?? {}),
      ...payload,
    },
  };
}

/** Estimate benchmark derivatives from chipset score when lab data missing. */
export function estimateGeekbenchSingle(device: Device): number | null {
  const direct = ext(device.intelligence ?? {}, "benchmarks.geekbenchSingle");
  if (direct) return Number.parseInt(direct, 10) || null;
  const b = device.chipset?.benchmark;
  if (!b) return null;
  return Math.round(b / 380);
}

export function estimateGeekbenchMulti(device: Device): number | null {
  const direct = ext(device.intelligence ?? {}, "benchmarks.geekbenchMulti");
  if (direct) return Number.parseInt(direct, 10) || null;
  const b = device.chipset?.benchmark;
  if (!b) return null;
  return Math.round(b / 120);
}

export function estimateAntutu(device: Device): number | null {
  const direct = ext(device.intelligence ?? {}, "benchmarks.antutu");
  if (direct) return Number.parseInt(direct.replace(/,/g, ""), 10) || null;
  return device.chipset?.benchmark ?? null;
}
