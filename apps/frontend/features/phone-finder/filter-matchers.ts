import type { Device } from "@/lib/api";

import {
  devicePriceInCurrency,
  deviceRamGb,
  deviceReleaseYear,
  deviceStorageGb,
  hasChargingAtLeast,
  hasDolbyVision,
  hasEsim,
  hasExpandableStorage,
  hasHdr10Plus,
  hasRefreshAtLeast,
  hasWifi7,
  isUpcomingDevice,
  mainCameraMp,
} from "./device-utils";
import type { PhoneFinderFilters, PriceCurrency, TriState } from "./types";

function haystack(device: Device): string {
  return `${device.name} ${device.os ?? ""} ${device.display?.type ?? ""} ${device.display?.protection ?? ""} ${device.fingerprint ?? ""}`.toLowerCase();
}

export function deviceManufacturerName(device: Device): string {
  return device.manufacturer?.name ?? device.brand?.name ?? "Unknown";
}

export function processorBrandName(device: Device): string {
  const cpu = (device.chipset?.cpu ?? "").toLowerCase();
  if (cpu.includes("snapdragon") || cpu.includes("qualcomm")) return "Snapdragon";
  if (cpu.includes("dimensity") || cpu.includes("mediatek")) return "MediaTek";
  if (cpu.includes("apple") || /a\d{2}/.test(cpu)) return "Apple Silicon";
  if (cpu.includes("exynos")) return "Exynos";
  if (cpu.includes("tensor")) return "Tensor";
  if (cpu.includes("kirin")) return "Kirin";
  if (cpu.includes("unisoc") || cpu.includes("spreadtrum")) return "Unisoc";
  return "Other";
}

export function deviceTypeLabel(device: Device): string {
  const text = `${device.name} ${device.category?.name ?? ""} ${device.category?.slug ?? ""}`.toLowerCase();
  if (text.includes("fold")) return "foldable";
  if (text.includes("flip")) return "flip";
  if (text.includes("tablet") || text.includes(" pad")) return "tablet";
  if (/rog|red magic|black shark|legion|gaming/i.test(text)) return "gaming";
  if (text.includes("feature") || text.includes("kaios")) return "feature";
  return "smartphone";
}

export function deviceAvailabilityStatus(
  device: Device,
): "available" | "upcoming" | "discontinued" {
  if (isUpcomingDevice(device)) return "upcoming";
  const year = deviceReleaseYear(device);
  if (year != null && year < 2020) return "discontinued";
  if (
    device.countryAvailability?.length &&
    !device.countryAvailability.some((row) => row.available)
  ) {
    return "discontinued";
  }
  return "available";
}

export function hasMarketPrice(
  device: Device,
  currency: PriceCurrency,
): boolean {
  return devicePriceInCurrency(device, currency) != null;
}

export function matchesDisplayTech(device: Device, tech: string): boolean {
  const type = (device.display?.type ?? "").toLowerCase();
  switch (tech) {
    case "amoled":
      return type.includes("amoled") && !type.includes("dynamic");
    case "dynamic-amoled":
      return type.includes("dynamic") && type.includes("amoled");
    case "oled":
      return type.includes("oled");
    case "ltpo-oled":
      return type.includes("ltpo");
    case "ips-lcd":
      return type.includes("ips") || type.includes("lcd");
    case "mini-led":
      return type.includes("mini");
    default:
      return true;
  }
}

export function resolutionTier(device: Device): string {
  const res = (device.display?.resolution ?? "").toLowerCase();
  const pixels = res.match(/(\d+)\s*x\s*(\d+)/);
  if (!pixels) return "unknown";
  const max = Math.max(Number(pixels[1]), Number(pixels[2]));
  if (max >= 3500) return "4k";
  if (max >= 2800) return "qhd";
  if (max >= 2200) return "fhd";
  return "hd";
}

export function matchesHdrSupport(device: Device, hdr: string): boolean {
  const text = haystack(device);
  switch (hdr) {
    case "hdr10":
      return text.includes("hdr10") && !text.includes("hdr10+");
    case "hdr10+":
      return hasHdr10Plus(device);
    case "dolby-vision":
      return hasDolbyVision(device);
    default:
      return true;
  }
}

export function matchesStorageExpansion(device: Device, value: string): boolean {
  switch (value) {
    case "microsd":
      return hasExpandableStorage(device);
    case "hybrid":
      return hasExpandableStorage(device) && deviceStorageGb(device) <= 128;
    case "none":
      return !hasExpandableStorage(device);
    default:
      return true;
  }
}

export function hasUltraWideCamera(device: Device): boolean {
  return (
    device.cameras?.some((camera) => {
      const type = camera.type.toLowerCase();
      return type.includes("ultra") || type.includes("wide");
    }) ?? false
  );
}

export function hasTelephotoCamera(device: Device): boolean {
  return (
    device.cameras?.some((camera) => {
      const type = camera.type.toLowerCase();
      return (
        type.includes("tele") ||
        type.includes("periscope") ||
        Boolean(camera.opticalZoom)
      );
    }) ?? false
  );
}

export function matchesCellularNetwork(device: Device, network: string): boolean {
  if (network === "All") return true;
  const year = deviceReleaseYear(device);
  if (network === "5g") return device.fiveG === true;
  if (network === "3g") {
    if (device.fiveG === true) return false;
    return year == null || year >= 2007;
  }
  if (network === "2g") return year != null && year < 2007;
  return true;
}

export function matchesBatteryBucket(device: Device, bucket: string): boolean {
  const capacity = device.battery?.capacity ?? 0;
  switch (bucket) {
    case "under-4000":
      return capacity > 0 && capacity < 4000;
    case "4000-5000":
      return capacity >= 4000 && capacity < 5000;
    case "5000-6000":
      return capacity >= 5000 && capacity <= 6000;
    case "above-6000":
    case "above-10000":
      return capacity > 10000;
    default:
      return true;
  }
}

export function matchesChargeTier(device: Device, tier: string): boolean {
  const watts = Number(tier);
  if (!Number.isFinite(watts)) return true;
  return hasChargingAtLeast(device, watts);
}

export function batteryReplacementType(device: Device): string {
  const year = deviceReleaseYear(device);
  if (year != null && year >= 2018) return "non-removable";
  return "user-replaceable";
}

export function wifiVersionLabel(device: Device): string {
  if (hasWifi7(device)) return "wifi7";
  const year = deviceReleaseYear(device);
  if (year != null && year >= 2022) return "wifi6e";
  if (year != null && year >= 2020) return "wifi6";
  return "wifi5";
}

export function bluetoothVersionLabel(device: Device): string {
  const year = deviceReleaseYear(device);
  if (year != null && year >= 2025) return "6";
  if (year != null && year >= 2024) return "5.4";
  if (year != null && year >= 2022) return "5.3";
  return "5.0";
}

export function simTypeLabel(device: Device): string {
  const year = deviceReleaseYear(device);
  if (hasEsim(device) && year != null && year >= 2022) return "dual-esim";
  if (hasEsim(device)) return "esim";
  if (year != null && year <= 2015) return "single";
  return "dual";
}

export function fingerprintTypeLabel(device: Device): string {
  const fp = (device.fingerprint ?? "").toLowerCase();
  if (fp.includes("under")) return "under-display";
  if (fp.includes("side")) return "side";
  if (fp.includes("rear") || fp.includes("back")) return "rear";
  if (fp.includes("face")) return "face-only";
  if ((device.os ?? "").toLowerCase().includes("ios")) return "face-only";
  const year = deviceReleaseYear(device);
  if (year != null && year >= 2020) return "under-display";
  return "rear";
}

export function ipRatingLabel(device: Device): string {
  const text = haystack(device);
  if (text.includes("ip69")) return "IP69";
  if (text.includes("ip68") || device.waterproof) return "IP68";
  if (text.includes("ip67")) return "IP67";
  if (text.includes("ip54")) return "IP54";
  if (text.includes("ip52")) return "IP52";
  return device.waterproof ? "IP68" : "none";
}

export function buildMaterialLabel(device: Device): string {
  const text = haystack(device);
  if (text.includes("titanium")) return "titanium";
  if (text.includes("aluminum") || text.includes("aluminium")) return "aluminum";
  if (text.includes("glass")) return "glass";
  return "plastic";
}

export function osFamilyLabel(device: Device): string {
  const os = (device.os ?? "").toLowerCase();
  if (os.includes("ios")) return "ios";
  if (os.includes("harmony")) return "harmonyos";
  if (os.includes("android")) return "android";
  return "other";
}

export function updatePolicyYears(device: Device): string {
  const brand = device.brand?.name.toLowerCase() ?? "";
  if (brand.includes("google") || brand.includes("samsung") || brand.includes("apple")) {
    return "7";
  }
  if (brand.includes("oneplus") || brand.includes("nothing")) return "4";
  if (brand.includes("xiaomi") || brand.includes("oppo") || brand.includes("vivo")) {
    return "3";
  }
  return "2";
}

export function hasGamingShoulderTriggers(device: Device): boolean {
  return /rog|red magic|black shark|legion/i.test(device.name);
}

export function hasGamingCoolingFan(device: Device): boolean {
  return /red magic|nubia/i.test(device.name);
}

export function hasHighTouchSampling(device: Device): boolean {
  return (device.display?.refreshRate ?? 0) >= 120;
}

export function hasAiPhotography(device: Device): boolean {
  return mainCameraMp(device) != null && (deviceReleaseYear(device) ?? 0) >= 2023;
}

export function hasAiTranslation(device: Device): boolean {
  return (deviceReleaseYear(device) ?? 0) >= 2024;
}

export function hasAiCallSummary(device: Device): boolean {
  const brand = device.brand?.name.toLowerCase() ?? "";
  return brand.includes("samsung") || brand.includes("google");
}

export function hasCircleToSearch(device: Device): boolean {
  return device.brand?.name.toLowerCase().includes("google") ?? false;
}

export function hasOnDeviceAi(device: Device): boolean {
  return (device.chipset?.benchmark ?? 0) >= 800_000;
}

export function collectManufacturerOptions(
  devices: Device[],
  brandNames: string[],
): string[] {
  const names = new Set<string>(brandNames);
  for (const device of devices) {
    const manufacturer = deviceManufacturerName(device);
    if (manufacturer !== "Unknown") names.add(manufacturer);
  }
  return ["All", ...Array.from(names).sort((a, b) => a.localeCompare(b))];
}

function checkTri(
  device: Device,
  filter: TriState,
  getter: (d: Device) => boolean,
): boolean {
  if (filter == null) return true;
  return getter(device) === filter;
}

export function matchesExtendedFilters(
  device: Device,
  filters: PhoneFinderFilters,
): boolean {
  if (
    filters.manufacturer !== "All" &&
    deviceManufacturerName(device) !== filters.manufacturer &&
    device.brand?.name !== filters.manufacturer
  ) {
    return false;
  }

  if (
    filters.modelName.trim() &&
    !device.name.toLowerCase().includes(filters.modelName.trim().toLowerCase())
  ) {
    return false;
  }

  if (filters.deviceType !== "All" && deviceTypeLabel(device) !== filters.deviceType) {
    return false;
  }

  if (
    filters.availability !== "All" &&
    deviceAvailabilityStatus(device) !== filters.availability
  ) {
    return false;
  }

  if (!checkTri(device, filters.hasMarketPrice, (d) => hasMarketPrice(d, filters.priceCurrency))) {
    return false;
  }

  if (
    filters.displayTech !== "All" &&
    !matchesDisplayTech(device, filters.displayTech)
  ) {
    return false;
  }

  if (
    filters.resolutionTier !== "All" &&
    resolutionTier(device) !== filters.resolutionTier
  ) {
    return false;
  }

  if (filters.refreshRateHz !== "All") {
    const hz = Number(filters.refreshRateHz);
    if (!hasRefreshAtLeast(device, hz)) return false;
  }

  if (
    filters.hdrSupport !== "All" &&
    !matchesHdrSupport(device, filters.hdrSupport)
  ) {
    return false;
  }

  if (
    filters.processorBrand !== "All" &&
    processorBrandName(device) !== filters.processorBrand
  ) {
    return false;
  }

  if (
    filters.chipsetModel !== "All" &&
    (device.chipset?.cpu ?? "") !== filters.chipsetModel
  ) {
    return false;
  }

  if (filters.ramTier !== "All" && deviceRamGb(device) < Number(filters.ramTier)) {
    return false;
  }

  if (
    filters.storageTier !== "All" &&
    deviceStorageGb(device) < Number(filters.storageTier)
  ) {
    return false;
  }

  if (
    filters.storageExpansion !== "All" &&
    !matchesStorageExpansion(device, filters.storageExpansion)
  ) {
    return false;
  }

  if (filters.batteryBucket !== "All" && !matchesBatteryBucket(device, filters.batteryBucket)) {
    return false;
  }

  if (filters.chargeTier !== "All" && !matchesChargeTier(device, filters.chargeTier)) {
    return false;
  }

  if (
    filters.batteryReplacement !== "All" &&
    batteryReplacementType(device) !== filters.batteryReplacement
  ) {
    return false;
  }

  if (filters.wifiVersion !== "All" && wifiVersionLabel(device) !== filters.wifiVersion) {
    return false;
  }

  if (
    filters.bluetoothVersion !== "All" &&
    bluetoothVersionLabel(device) !== filters.bluetoothVersion
  ) {
    return false;
  }

  if (filters.simType !== "All" && simTypeLabel(device) !== filters.simType) {
    return false;
  }

  if (
    filters.fingerprintType !== "All" &&
    fingerprintTypeLabel(device) !== filters.fingerprintType
  ) {
    return false;
  }

  if (filters.ipRating !== "All") {
    const rating = ipRatingLabel(device);
    if (filters.ipRating === "IP68" && rating !== "IP68" && rating !== "IP69") {
      return false;
    } else if (filters.ipRating !== "IP68" && rating !== filters.ipRating) {
      return false;
    }
  }

  if (
    filters.buildMaterial !== "All" &&
    buildMaterialLabel(device) !== filters.buildMaterial
  ) {
    return false;
  }

  if (filters.osFamily !== "All" && osFamilyLabel(device) !== filters.osFamily) {
    return false;
  }

  if (
    filters.updatePolicy !== "All" &&
    updatePolicyYears(device) !== filters.updatePolicy
  ) {
    return false;
  }

  if (!checkTri(device, filters.ultraWideCamera, hasUltraWideCamera)) return false;
  if (!checkTri(device, filters.telephotoCamera, hasTelephotoCamera)) return false;
  if (!checkTri(device, filters.gamingShoulderTriggers, hasGamingShoulderTriggers)) return false;
  if (!checkTri(device, filters.gamingCoolingFan, hasGamingCoolingFan)) return false;
  if (!checkTri(device, filters.highTouchSampling, hasHighTouchSampling)) return false;
  if (!checkTri(device, filters.aiPhotography, hasAiPhotography)) return false;
  if (!checkTri(device, filters.aiTranslation, hasAiTranslation)) return false;
  if (!checkTri(device, filters.aiCallSummary, hasAiCallSummary)) return false;
  if (!checkTri(device, filters.circleToSearch, hasCircleToSearch)) return false;
  if (!checkTri(device, filters.onDeviceAi, hasOnDeviceAi)) return false;

  return true;
}
