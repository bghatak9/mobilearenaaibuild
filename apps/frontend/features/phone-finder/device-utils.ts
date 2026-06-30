import type { Device } from "@/lib/api";

import { rankBrandsByValue } from "@/lib/brand-categories";
import { usdToInr } from "./nlp";
import type { PriceCurrency } from "./types";

export function mainCameraMp(device: Device): number | null {
  if (!device.cameras?.length) return null;
  return Math.max(...device.cameras.map((c) => c.megapixel));
}

export function selfieCameraMp(device: Device): number | null {
  const front = device.cameras?.find((c) =>
    c.type.toLowerCase().includes("front"),
  );
  return front?.megapixel ?? null;
}

export function parseChargingWatts(charging?: string | null): number | null {
  if (!charging) return null;
  const match = charging.match(/(\d+)\s*w/i);
  return match ? Number(match[1]) : null;
}

export function deviceReleaseYear(device: Device): number | null {
  const raw = device.releasedDate ?? device.announcedDate;
  if (!raw) return null;
  const y = new Date(raw).getFullYear();
  return Number.isFinite(y) ? y : null;
}

export function isDeviceAvailable(device: Device): boolean {
  if (!device.countryAvailability?.length) return true;
  return device.countryAvailability.some((c) => c.available);
}

export function deviceRamGb(device: Device): number {
  return device.ramGb ?? 6;
}

export function deviceStorageGb(device: Device): number {
  return device.storageGb ?? 128;
}

function displayText(device: Device): string {
  return (device.display?.type ?? "").toLowerCase();
}

function protectionText(device: Device): string {
  return (device.display?.protection ?? "").toLowerCase();
}

export function hasDisplayType(device: Device, token: string): boolean {
  return displayText(device).includes(token.toLowerCase());
}

export function hasRefreshAtLeast(device: Device, hz: number): boolean {
  return (device.display?.refreshRate ?? 0) >= hz;
}

export function hasBatteryAtLeast(device: Device, mah: number): boolean {
  return (device.battery?.capacity ?? 0) >= mah;
}

export function hasChargingAtLeast(device: Device, watts: number): boolean {
  const w = parseChargingWatts(device.battery?.charging);
  return w != null && w >= watts;
}

export function hasOis(device: Device): boolean {
  return device.cameras?.some((c) => c.stabilization) ?? false;
}

export function hasOpticalZoomLens(device: Device): boolean {
  return (
    device.cameras?.some(
      (c) => c.opticalZoom && c.opticalZoom.trim().length > 0,
    ) ?? false
  );
}

export function hasPeriscopeLens(device: Device): boolean {
  return (
    device.cameras?.some((c) => {
      const t = c.type.toLowerCase();
      if (t.includes("periscope")) return true;
      const zoom = c.opticalZoom?.match(/(\d+)/);
      return zoom != null && Number(zoom[1]) >= 5;
    }) ?? false
  );
}

export function hasHighResSelfie(device: Device): boolean {
  const mp = selfieCameraMp(device);
  return mp != null && mp >= 24;
}

export function hasGorillaGlass(device: Device): boolean {
  return protectionText(device).includes("gorilla");
}

export function hasHdr10Plus(device: Device): boolean {
  const hay = `${device.display?.type ?? ""} ${device.name}`.toLowerCase();
  return hay.includes("hdr10") || (device.display?.brightness ?? 0) >= 1000;
}

export function hasDolbyVision(device: Device): boolean {
  const hay = `${device.display?.type ?? ""} ${device.name}`.toLowerCase();
  return hay.includes("dolby");
}

export function hasAlwaysOnDisplay(device: Device): boolean {
  const hay = `${device.display?.type ?? ""} ${device.os ?? ""}`.toLowerCase();
  return (
    displayText(device).includes("amoled") ||
    displayText(device).includes("oled") ||
    hay.includes("ios")
  );
}

export function hasVideo4k(device: Device): boolean {
  const mp = mainCameraMp(device);
  return mp != null && mp >= 12;
}

export function hasVideo8k(device: Device): boolean {
  const mp = mainCameraMp(device);
  return mp != null && mp >= 48;
}

export function hasNightMode(device: Device): boolean {
  return mainCameraMp(device) != null && mainCameraMp(device)! >= 12;
}

export function hasRawPhoto(device: Device): boolean {
  return (device.price ?? 0) >= 600 && mainCameraMp(device) != null;
}

export function hasDualSim(device: Device): boolean {
  const year = deviceReleaseYear(device);
  return year == null || year <= 2024;
}

export function hasEsim(device: Device): boolean {
  const year = deviceReleaseYear(device);
  return year != null && year >= 2020;
}

export function hasWifi7(device: Device): boolean {
  const year = deviceReleaseYear(device);
  return year != null && year >= 2024 && (device.price ?? 0) >= 700;
}

export function hasBluetooth6(device: Device): boolean {
  const year = deviceReleaseYear(device);
  return year != null && year >= 2025;
}

export function hasSatellite(device: Device): boolean {
  const hay = device.name.toLowerCase();
  return hay.includes("iphone") && (deviceReleaseYear(device) ?? 0) >= 2022;
}

export function hasUsbTypeC(device: Device): boolean {
  const year = deviceReleaseYear(device);
  if (year == null) return true;
  if (device.os?.toLowerCase().includes("ios") && year < 2023) return false;
  return year >= 2018;
}

export function hasExpandableStorage(device: Device): boolean {
  const brand = device.brand?.name.toLowerCase() ?? "";
  return brand.includes("samsung") || brand.includes("xiaomi") || brand.includes("motorola");
}

export function hasCleanAndroid(device: Device): boolean {
  const brand = device.brand?.name.toLowerCase() ?? "";
  return (
    brand.includes("google") ||
    brand.includes("motorola") ||
    brand.includes("nothing") ||
    brand.includes("fairphone")
  );
}

export function hasAiFeatures(device: Device): boolean {
  const year = deviceReleaseYear(device);
  return year != null && year >= 2024 && (device.chipset?.benchmark ?? 0) > 500_000;
}

export function gpuTypeLabel(device: Device): string {
  const gpu = device.chipset?.gpu?.trim();
  if (!gpu) return "Unknown";
  if (/adreno/i.test(gpu)) return "Adreno";
  if (/mali/i.test(gpu)) return "Mali";
  if (/apple/i.test(gpu) || /gpu/i.test(gpu)) return "Apple GPU";
  if (/immortalis/i.test(gpu)) return "Immortalis";
  if (/xclipse/i.test(gpu)) return "Xclipse";
  return gpu.split(" ")[0];
}

export function cpuGenerationLabel(device: Device): string {
  const cpu = (device.chipset?.cpu ?? "").toLowerCase();
  const genMatch =
    cpu.match(/gen\s*(\d+)/i) ??
    cpu.match(/(\d{4})/) ??
    cpu.match(/a(\d{2})/i);
  if (genMatch) {
    if (cpu.includes("snapdragon")) return `Snapdragon Gen ${genMatch[1]}`;
    if (cpu.includes("dimensity")) return `Dimensity ${genMatch[1]}`;
    if (cpu.includes("a1") || cpu.includes("a2")) return `Apple A${genMatch[1]}`;
    return `Gen ${genMatch[1]}`;
  }
  if (cpu.includes("snapdragon")) return "Snapdragon";
  if (cpu.includes("dimensity")) return "Dimensity";
  if (cpu.includes("exynos")) return "Exynos";
  if (cpu.includes("tensor")) return "Tensor";
  if (cpu.includes("apple") || /a\d{2}/.test(cpu)) return "Apple Silicon";
  return device.chipset?.cpu?.trim() ?? "Unknown";
}

export function gorillaGlassVersion(device: Device): string | null {
  const p = device.display?.protection ?? "";
  const match = p.match(/gorilla\s+glass\s+([\w\s+]+)/i);
  if (match) return match[1].trim();
  if (/gorilla/i.test(p)) return "Gorilla Glass";
  return null;
}

export function hasCoolingTech(device: Device): boolean {
  const name = device.name.toLowerCase();
  if (/rog|red magic|nubia|black shark|legion/i.test(name)) return true;
  return (
    (device.display?.refreshRate ?? 0) >= 120 &&
    (device.chipset?.benchmark ?? 0) >= 1_000_000
  );
}

export function collectGpuTypes(devices: Device[]): string[] {
  const set = new Set<string>();
  for (const d of devices) set.add(gpuTypeLabel(d));
  return ["All", ...Array.from(set).sort()];
}

export function collectCpuGenerations(devices: Device[]): string[] {
  const set = new Set<string>();
  for (const d of devices) set.add(cpuGenerationLabel(d));
  return ["All", ...Array.from(set).sort()];
}

export function collectGorillaVersions(devices: Device[]): string[] {
  const set = new Set<string>();
  for (const d of devices) {
    const v = gorillaGlassVersion(d);
    if (v) set.add(v);
  }
  return ["All", ...Array.from(set).sort()];
}

export function topReviewedDevices(devices: Device[], limit = 5): Device[] {
  return [...devices]
    .filter((d) => (d.rating ?? 0) > 0 || (d.reviews?.length ?? 0) > 0)
    .sort(
      (a, b) =>
        (b.rating ?? 0) - (a.rating ?? 0) ||
        (b.reviews?.length ?? 0) - (a.reviews?.length ?? 0),
    )
    .slice(0, limit);
}

export function chipsetManufacturerName(device: Device): string {
  if (device.manufacturer?.name) return device.manufacturer.name;
  const cpu = (device.chipset?.cpu ?? "").toLowerCase();
  if (cpu.includes("snapdragon") || cpu.includes("qualcomm")) return "Qualcomm";
  if (cpu.includes("dimensity") || cpu.includes("mediatek")) return "MediaTek";
  if (cpu.includes("exynos")) return "Samsung";
  if (cpu.includes("tensor")) return "Google";
  if (cpu.includes("apple") || cpu.includes("a17") || cpu.includes("a18")) {
    return "Apple";
  }
  return "Other";
}

export function priceDropPercent(device: Device): number | null {
  const history = device.priceHistory;
  if (!history || history.length < 2 || device.price == null) return null;
  const peak = Math.max(...history.map((h) => h.price));
  if (peak <= 0) return null;
  return Math.round(((peak - device.price) / peak) * 100);
}

export function collectBrands(devices: Device[]): string[] {
  const names = Array.from(
    new Set(devices.map((d) => d.brand?.name).filter(Boolean) as string[]),
  );
  return ["All", ...rankBrandsByValue(devices, names)];
}

export function collectOsOptions(devices: Device[]): string[] {
  const set = new Set<string>();
  for (const d of devices) {
    if (d.os?.trim()) set.add(d.os.trim());
  }
  return ["All", ...Array.from(set).sort()];
}

export function collectProcessorOptions(devices: Device[]): string[] {
  const set = new Set<string>();
  for (const d of devices) {
    const cpu = d.chipset?.cpu?.trim();
    if (cpu) set.add(cpu);
  }
  return ["All", ...Array.from(set).sort()];
}

export function collectChipsetManufacturers(devices: Device[]): string[] {
  const set = new Set<string>();
  for (const d of devices) {
    set.add(chipsetManufacturerName(d));
  }
  return ["All", ...Array.from(set).sort()];
}

export function collectRamOptions(devices: Device[]): number[] {
  const set = new Set<number>();
  for (const d of devices) set.add(deviceRamGb(d));
  return Array.from(set).sort((a, b) => a - b);
}

export function collectStorageOptions(devices: Device[]): number[] {
  const set = new Set<number>();
  for (const d of devices) set.add(deviceStorageGb(d));
  return Array.from(set).sort((a, b) => a - b);
}

export function collectReleaseYears(devices: Device[]): number[] {
  const set = new Set<number>();
  for (const d of devices) {
    const y = deviceReleaseYear(d);
    if (y) set.add(y);
  }
  return Array.from(set).sort((a, b) => b - a);
}

export function priceBounds(devices: Device[]): { min: number; max: number } {
  const prices = devices
    .map((d) => d.price)
    .filter((p): p is number => p != null && p > 0);
  if (!prices.length) return { min: 0, max: 2000 };
  return {
    min: Math.floor(Math.min(...prices) / 50) * 50,
    max: Math.ceil(Math.max(...prices) / 50) * 50,
  };
}

export function deviceCountryRow(device: Device, countryCode: string) {
  const code = countryCode.toUpperCase();
  return device.countryAvailability?.find(
    (row) => row.countryCode.toUpperCase() === code,
  );
}

export function devicePriceInCurrency(
  device: Device,
  currency: PriceCurrency,
): number | null {
  const offers = (device.affiliateOffers ?? []).filter(
    (offer) => offer.active && offer.currency === currency,
  );
  if (offers.length > 0) {
    return Math.min(...offers.map((offer) => offer.price));
  }

  if (currency === "INR") {
    const row = deviceCountryRow(device, "IN");
    if (row) {
      if (!row.available) return null;
      if (row.price != null) return row.price;
    }
    if (device.price != null) return usdToInr(device.price);
    return null;
  }

  const row = deviceCountryRow(device, "US");
  if (row) {
    if (!row.available) return null;
    if (row.price != null) return row.price;
  }
  return device.price ?? null;
}

export function affiliatePartnersForCurrency(
  device: Device,
  currency: PriceCurrency,
): string[] {
  return [
    ...new Set(
      (device.affiliateOffers ?? [])
        .filter((offer) => offer.active && offer.currency === currency)
        .map((offer) => offer.partner),
    ),
  ];
}

export function priceSliderStep(currency: PriceCurrency): number {
  return currency === "INR" ? 500 : 50;
}

export function formatPriceAmount(amount: number, currency: PriceCurrency): string {
  const locale = currency === "INR" ? "en-IN" : "en-US";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return currency === "INR"
      ? `₹${amount.toLocaleString("en-IN")}`
      : `$${amount.toLocaleString("en-US")}`;
  }
}

export const PRICE_CURRENCY_OPTIONS: { label: string; value: PriceCurrency }[] = [
  { label: "$ US Dollar (USD)", value: "USD" },
  { label: "₹ Indian Rupee (INR)", value: "INR" },
];

export function priceBoundsForCurrency(
  _devices: Device[],
  currency: PriceCurrency,
): { min: number; max: number; currency: PriceCurrency } {
  return { min: 0, max: 500000, currency };
}

/** @deprecated Use devicePriceInCurrency */
export function deviceCountryPrice(
  device: Device,
  countryCode: string,
): number | null {
  if (countryCode.toUpperCase() === "IN") {
    return devicePriceInCurrency(device, "INR");
  }
  return devicePriceInCurrency(device, "USD");
}

export function matchesTriState(
  value: boolean | null | undefined,
  filter: boolean | null,
): boolean {
  if (filter == null) return true;
  if (value == null) return false;
  return value === filter;
}

function parseDeviceDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function deviceLaunchTimestamp(device: Device): number | null {
  const released = parseDeviceDate(device.releasedDate);
  if (released) return released.getTime();
  const announced = parseDeviceDate(device.announcedDate);
  return announced?.getTime() ?? null;
}

export function isUpcomingDevice(device: Device, now = Date.now()): boolean {
  const released = parseDeviceDate(device.releasedDate);
  const announced = parseDeviceDate(device.announcedDate);

  if (released && released.getTime() > now) return true;
  if (announced && announced.getTime() > now) return true;

  if (announced && announced.getTime() <= now) {
    const hasFutureRelease = released && released.getTime() > now;
    const awaitingRelease = !released;
    const recentlyAnnounced = now - announced.getTime() <= 120 * 86_400_000;
    if ((hasFutureRelease || awaitingRelease) && recentlyAnnounced) return true;
  }

  return false;
}

export function formatDeviceLaunchLabel(device: Device): string {
  const released = parseDeviceDate(device.releasedDate);
  const announced = parseDeviceDate(device.announcedDate);
  const target = released ?? announced;
  if (!target) return "Coming soon";

  const now = Date.now();
  if (target.getTime() > now) {
    return target.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return announced && !released ? "Announced" : "Launching soon";
}

export function getUpcomingDevices(devices: Device[], limit = 4): Device[] {
  const now = Date.now();
  const upcoming = devices
    .filter((device) => isUpcomingDevice(device, now))
    .sort(
      (a, b) =>
        (deviceLaunchTimestamp(a) ?? Number.MAX_SAFE_INTEGER) -
        (deviceLaunchTimestamp(b) ?? Number.MAX_SAFE_INTEGER),
    );

  return upcoming.slice(0, limit);
}
