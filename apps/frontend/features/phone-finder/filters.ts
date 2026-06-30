import { computeArenaScore } from "@/lib/arena-score";
import type { Device } from "@/lib/api";

import {
  chipsetManufacturerName,
  cpuGenerationLabel,
  deviceRamGb,
  deviceReleaseYear,
  deviceStorageGb,
  gpuTypeLabel,
  gorillaGlassVersion,
  hasAiFeatures,
  hasAlwaysOnDisplay,
  hasBatteryAtLeast,
  hasBluetooth6,
  hasChargingAtLeast,
  hasCleanAndroid,
  hasCoolingTech,
  hasDisplayType,
  hasDolbyVision,
  hasDualSim,
  hasEsim,
  hasExpandableStorage,
  hasGorillaGlass,
  hasHdr10Plus,
  hasHighResSelfie,
  hasNightMode,
  hasOis,
  hasOpticalZoomLens,
  hasPeriscopeLens,
  hasRawPhoto,
  hasRefreshAtLeast,
  hasSatellite,
  hasUsbTypeC,
  hasVideo4k,
  hasVideo8k,
  hasWifi7,
  isDeviceAvailable,
  devicePriceInCurrency,
  mainCameraMp,
  matchesTriState,
  parseChargingWatts,
  selfieCameraMp,
} from "./device-utils";
import { presetById } from "./presets";
import { matchesCellularNetwork, matchesExtendedFilters } from "./filter-matchers";
import { deviceMatchesFreeText, mergeSearchIntoFilters } from "./search-engine";
import {
  DEFAULT_PHONE_FINDER_FILTERS,
  type PhoneFinderFilters,
  type PhoneFinderSort,
  type TriState,
} from "./types";

function sortDevices(
  list: Device[],
  sort: PhoneFinderSort,
  priceCurrency: PhoneFinderFilters["priceCurrency"],
): Device[] {
  return [...list].sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return (
          (devicePriceInCurrency(a, priceCurrency) ?? Infinity) -
          (devicePriceInCurrency(b, priceCurrency) ?? Infinity)
        );
      case "price-desc":
        return (
          (devicePriceInCurrency(b, priceCurrency) ?? -Infinity) -
          (devicePriceInCurrency(a, priceCurrency) ?? -Infinity)
        );
      case "rating":
        return (b.rating ?? 0) - (a.rating ?? 0);
      case "popularity":
        return (
          computeArenaScore(b) * 0.6 +
          (b.rating ?? 0) * 10 * 0.4 -
          (computeArenaScore(a) * 0.6 + (a.rating ?? 0) * 10 * 0.4)
        );
      default:
        return b.id - a.id;
    }
  });
}

function checkTri(
  device: Device,
  filter: TriState,
  getter: (d: Device) => boolean,
): boolean {
  if (filter == null) return true;
  return getter(device) === filter;
}

export function applyPhoneFinderFilters(
  devices: Device[],
  filters: PhoneFinderFilters,
): Device[] {
  const f = mergeSearchIntoFilters(filters, filters.search);
  const q = f.search.trim().toLowerCase();
  const requireTextMatch = !f.structuredSearch;

  const list = devices.filter((d) => {
    if (requireTextMatch && q && !deviceMatchesFreeText(d, q)) return false;

    if (f.brand !== "All" && d.brand?.name !== f.brand) return false;

    const localPrice = devicePriceInCurrency(d, f.priceCurrency);
    if (f.minPrice != null && (localPrice ?? Infinity) < f.minPrice) {
      return false;
    }
    if (f.maxPrice != null && (localPrice ?? -Infinity) > f.maxPrice) {
      return false;
    }
    if (f.minRating != null && (d.rating ?? 0) < f.minRating) return false;
    if (f.os !== "All" && d.os !== f.os) return false;
    if (f.processor !== "All" && d.chipset?.cpu !== f.processor) {
      return false;
    }
    if (
      f.chipsetManufacturer !== "All" &&
      chipsetManufacturerName(d) !== f.chipsetManufacturer
    ) {
      return false;
    }
    if (f.gpuType !== "All" && gpuTypeLabel(d) !== f.gpuType) {
      return false;
    }
    if (
      f.cpuGeneration !== "All" &&
      cpuGenerationLabel(d) !== f.cpuGeneration
    ) {
      return false;
    }
    if (f.gorillaGlassVersion !== "All") {
      const ver = gorillaGlassVersion(d);
      if (!ver || ver !== f.gorillaGlassVersion) return false;
    }
    if (!checkTri(d, f.coolingTech, hasCoolingTech)) return false;

    if (f.minRam != null && deviceRamGb(d) < f.minRam) return false;
    if (f.minStorage != null && deviceStorageGb(d) < f.minStorage) {
      return false;
    }

    const year = deviceReleaseYear(d);
    if (f.minYear != null && (year ?? 0) < f.minYear) return false;
    if (f.maxYear != null && (year ?? 9999) > f.maxYear) return false;

    if (f.cellularNetwork !== "All") {
      if (!matchesCellularNetwork(d, f.cellularNetwork)) return false;
    } else if (!matchesTriState(d.fiveG, f.fiveG)) return false;
    if (!matchesTriState(d.nfc, f.nfc)) return false;
    if (!matchesTriState(d.waterproof, f.waterproof)) return false;
    if (!matchesTriState(d.battery?.wireless, f.wirelessCharging)) {
      return false;
    }
    if (!matchesTriState(d.battery?.reverse, f.reverseWireless)) return false;
    if (!matchesTriState(d.infrared, f.infrared)) return false;
    if (f.availableOnly && !isDeviceAvailable(d)) return false;

    if (f.minDisplay != null && (d.display?.size ?? 0) < f.minDisplay) {
      return false;
    }
    if (f.maxDisplay != null && (d.display?.size ?? 99) > f.maxDisplay) {
      return false;
    }
    if (f.minRefresh != null && (d.display?.refreshRate ?? 0) < f.minRefresh) {
      return false;
    }
    if (f.maxWeight != null && (d.weight ?? 999) > f.maxWeight) return false;

    if (f.minCameraMp != null) {
      const mp = mainCameraMp(d);
      if (mp == null || mp < f.minCameraMp) return false;
    }
    if (f.minSelfieMp != null) {
      const mp = selfieCameraMp(d);
      if (mp == null || mp < f.minSelfieMp) return false;
    }
    if (f.minBattery != null && (d.battery?.capacity ?? 0) < f.minBattery) {
      return false;
    }
    if (f.minChargingW != null) {
      const w = parseChargingWatts(d.battery?.charging);
      if (w == null || w < f.minChargingW) return false;
    }

    if (!checkTri(d, f.displayAmoled, (x) => hasDisplayType(x, "amoled"))) {
      return false;
    }
    if (!checkTri(d, f.displayLtpo, (x) => hasDisplayType(x, "ltpo"))) {
      return false;
    }
    if (!checkTri(d, f.displayOled, (x) => hasDisplayType(x, "oled"))) {
      return false;
    }
    if (!checkTri(d, f.displayMiniLed, (x) => hasDisplayType(x, "mini"))) {
      return false;
    }
    if (!checkTri(d, f.display90Hz, (x) => hasRefreshAtLeast(x, 90))) return false;
    if (!checkTri(d, f.display120Hz, (x) => hasRefreshAtLeast(x, 120))) {
      return false;
    }
    if (!checkTri(d, f.display144Hz, (x) => hasRefreshAtLeast(x, 144))) {
      return false;
    }
    if (!checkTri(d, f.hdr10Plus, hasHdr10Plus)) return false;
    if (!checkTri(d, f.dolbyVision, hasDolbyVision)) return false;
    if (!checkTri(d, f.alwaysOnDisplay, hasAlwaysOnDisplay)) return false;

    if (!checkTri(d, f.ois, hasOis)) return false;
    if (!checkTri(d, f.opticalZoom, hasOpticalZoomLens)) return false;
    if (!checkTri(d, f.periscope, hasPeriscopeLens)) return false;
    if (!checkTri(d, f.video4k, hasVideo4k)) return false;
    if (!checkTri(d, f.video8k, hasVideo8k)) return false;
    if (!checkTri(d, f.nightMode, hasNightMode)) return false;
    if (!checkTri(d, f.rawPhoto, hasRawPhoto)) return false;
    if (!checkTri(d, f.highResSelfie, hasHighResSelfie)) return false;

    if (!checkTri(d, f.battery5000, (x) => hasBatteryAtLeast(x, 5000))) {
      return false;
    }
    if (!checkTri(d, f.battery6000, (x) => hasBatteryAtLeast(x, 6000))) {
      return false;
    }
    if (!checkTri(d, f.battery7000, (x) => hasBatteryAtLeast(x, 7000))) {
      return false;
    }
    if (!checkTri(d, f.charge45, (x) => hasChargingAtLeast(x, 45))) return false;
    if (!checkTri(d, f.charge80, (x) => hasChargingAtLeast(x, 80))) return false;
    if (!checkTri(d, f.charge120, (x) => hasChargingAtLeast(x, 120))) return false;

    if (!checkTri(d, f.dualSim, hasDualSim)) return false;
    if (!checkTri(d, f.esim, hasEsim)) return false;
    if (!checkTri(d, f.wifi7, hasWifi7)) return false;
    if (!checkTri(d, f.bluetooth6, hasBluetooth6)) return false;
    if (!checkTri(d, f.satellite, hasSatellite)) return false;
    if (!checkTri(d, f.usbTypeC, hasUsbTypeC)) return false;

    if (!checkTri(d, f.gorillaGlass, hasGorillaGlass)) return false;
    if (!checkTri(d, f.expandableStorage, hasExpandableStorage)) return false;
    if (!checkTri(d, f.cleanAndroid, hasCleanAndroid)) return false;
    if (!checkTri(d, f.aiFeaturesSupport, hasAiFeatures)) return false;

    if (!matchesExtendedFilters(d, f)) return false;

    return true;
  });

  return sortDevices(list, f.sort, f.priceCurrency);
}

export function countActiveFilters(filters: PhoneFinderFilters): number {
  let n = 0;
  const skip = new Set(["sort", "preset"]);
  const sameManufacturingYear =
    filters.minYear != null && filters.minYear === filters.maxYear;

  for (const [key, value] of Object.entries(filters) as [
    keyof PhoneFinderFilters,
    PhoneFinderFilters[keyof PhoneFinderFilters],
  ][]) {
    if (skip.has(key)) continue;
    if (sameManufacturingYear && key === "maxYear") continue;
    if (
      filters.minBattery != null &&
      (key === "battery5000" || key === "battery6000" || key === "battery7000")
    ) {
      continue;
    }
    if (
      filters.minChargingW != null &&
      (key === "charge45" || key === "charge80" || key === "charge120")
    ) {
      continue;
    }
    const def = DEFAULT_PHONE_FINDER_FILTERS[key];
    if (value !== def && value != null && value !== "" && value !== "All") {
      if (typeof value === "boolean" && !value) continue;
      n++;
    }
  }
  return n;
}

function numParam(params: URLSearchParams, key: string): number | null {
  const v = params.get(key);
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parsePriceCurrency(params: URLSearchParams): PhoneFinderFilters["priceCurrency"] {
  const currency = params.get("priceCurrency")?.toUpperCase();
  if (currency === "INR") return "INR";
  const legacyCountry = params.get("priceCountry")?.toUpperCase();
  if (legacyCountry === "IN") return "INR";
  return "USD";
}

function boolParam(params: URLSearchParams, key: string): TriState {
  const v = params.get(key);
  if (v === "1" || v === "true") return true;
  if (v === "0" || v === "false") return false;
  return null;
}

const BOOL_KEYS: (keyof PhoneFinderFilters)[] = [
  "fiveG",
  "nfc",
  "waterproof",
  "wirelessCharging",
  "reverseWireless",
  "infrared",
  "displayAmoled",
  "displayLtpo",
  "displayOled",
  "displayMiniLed",
  "display90Hz",
  "display120Hz",
  "display144Hz",
  "hdr10Plus",
  "dolbyVision",
  "alwaysOnDisplay",
  "ois",
  "opticalZoom",
  "periscope",
  "video4k",
  "video8k",
  "nightMode",
  "rawPhoto",
  "highResSelfie",
  "battery5000",
  "battery6000",
  "battery7000",
  "charge45",
  "charge80",
  "charge120",
  "dualSim",
  "esim",
  "wifi7",
  "bluetooth6",
  "satellite",
  "usbTypeC",
  "gorillaGlass",
  "expandableStorage",
  "cleanAndroid",
  "aiFeaturesSupport",
  "coolingTech",
  "hasMarketPrice",
  "ultraWideCamera",
  "telephotoCamera",
  "gamingShoulderTriggers",
  "gamingCoolingFan",
  "highTouchSampling",
  "aiPhotography",
  "aiTranslation",
  "aiCallSummary",
  "circleToSearch",
  "onDeviceAi",
];

const STRING_KEYS: (keyof PhoneFinderFilters)[] = [
  "manufacturer",
  "modelName",
  "deviceType",
  "availability",
  "displayTech",
  "resolutionTier",
  "refreshRateHz",
  "hdrSupport",
  "processorBrand",
  "chipsetModel",
  "ramTier",
  "storageTier",
  "storageExpansion",
  "batteryBucket",
  "chargeTier",
  "batteryReplacement",
  "wifiVersion",
  "bluetoothVersion",
  "simType",
  "cellularNetwork",
  "fingerprintType",
  "ipRating",
  "buildMaterial",
  "osFamily",
  "updatePolicy",
];

export function filtersFromSearchParams(
  params: URLSearchParams,
): PhoneFinderFilters {
  const sort = params.get("sort");
  const validSort: PhoneFinderSort[] = [
    "newest",
    "popularity",
    "price-asc",
    "price-desc",
    "rating",
  ];

  const preset = params.get("preset");
  const base: PhoneFinderFilters = {
    ...DEFAULT_PHONE_FINDER_FILTERS,
    search: params.get("q") ?? "",
    preset: preset || null,
    brand: params.get("brand") ?? "All",
    minPrice: numParam(params, "minPrice"),
    maxPrice: numParam(params, "maxPrice"),
    priceCurrency: parsePriceCurrency(params),
    minRating: numParam(params, "minRating"),
    os: params.get("os") ?? "All",
    processor: params.get("processor") ?? "All",
    chipsetManufacturer: params.get("chipsetMfr") ?? "All",
    gpuType: params.get("gpuType") ?? "All",
    cpuGeneration: params.get("cpuGen") ?? "All",
    gorillaGlassVersion: params.get("gorillaVer") ?? "All",
    minRam: numParam(params, "minRam"),
    minStorage: numParam(params, "minStorage"),
    minYear: numParam(params, "minYear"),
    maxYear: numParam(params, "maxYear"),
    availableOnly: params.get("available") === "1",
    minDisplay: numParam(params, "minDisplay"),
    maxDisplay: numParam(params, "maxDisplay"),
    minRefresh: numParam(params, "minRefresh"),
    maxWeight: numParam(params, "maxWeight"),
    minCameraMp: numParam(params, "minCameraMp"),
    minSelfieMp: numParam(params, "minSelfieMp"),
    minBattery: numParam(params, "minBattery"),
    minChargingW: numParam(params, "minChargingW"),
    sort: validSort.includes(sort as PhoneFinderSort)
      ? (sort as PhoneFinderSort)
      : "popularity",
  };

  for (const key of STRING_KEYS) {
    const value = params.get(key);
    if (value != null && value !== "") {
      (base as Record<string, unknown>)[key] = value;
    }
  }

  for (const key of BOOL_KEYS) {
    (base as Record<string, unknown>)[key] = boolParam(params, key);
  }

  if (preset) {
    const p = presetById(preset);
    if (p) return { ...DEFAULT_PHONE_FINDER_FILTERS, ...p.patch, ...base, preset };
  }
  if (base.fiveG === true && base.cellularNetwork === "All") {
    base.cellularNetwork = "5g";
  }
  return base;
}

export function filtersToSearchParams(
  filters: PhoneFinderFilters,
): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.search.trim()) p.set("q", filters.search.trim());
  if (filters.preset) p.set("preset", filters.preset);
  if (filters.brand !== "All") p.set("brand", filters.brand);
  if (filters.minPrice != null) p.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) p.set("maxPrice", String(filters.maxPrice));
  if (filters.priceCurrency !== "USD") p.set("priceCurrency", filters.priceCurrency);
  if (filters.minRating != null) p.set("minRating", String(filters.minRating));
  if (filters.os !== "All") p.set("os", filters.os);
  if (filters.processor !== "All") p.set("processor", filters.processor);
  if (filters.chipsetManufacturer !== "All") {
    p.set("chipsetMfr", filters.chipsetManufacturer);
  }
  if (filters.gpuType !== "All") p.set("gpuType", filters.gpuType);
  if (filters.cpuGeneration !== "All") p.set("cpuGen", filters.cpuGeneration);
  if (filters.gorillaGlassVersion !== "All") {
    p.set("gorillaVer", filters.gorillaGlassVersion);
  }
  if (filters.minRam != null) p.set("minRam", String(filters.minRam));
  if (filters.minStorage != null) p.set("minStorage", String(filters.minStorage));
  if (filters.minYear != null) p.set("minYear", String(filters.minYear));
  if (filters.maxYear != null) p.set("maxYear", String(filters.maxYear));
  if (filters.availableOnly) p.set("available", "1");
  if (filters.minDisplay != null) p.set("minDisplay", String(filters.minDisplay));
  if (filters.maxDisplay != null) p.set("maxDisplay", String(filters.maxDisplay));
  if (filters.minRefresh != null) p.set("minRefresh", String(filters.minRefresh));
  if (filters.maxWeight != null) p.set("maxWeight", String(filters.maxWeight));
  if (filters.minCameraMp != null) p.set("minCameraMp", String(filters.minCameraMp));
  if (filters.minSelfieMp != null) p.set("minSelfieMp", String(filters.minSelfieMp));
  if (filters.minBattery != null) p.set("minBattery", String(filters.minBattery));
  if (filters.minChargingW != null) p.set("minChargingW", String(filters.minChargingW));
  if (filters.sort !== "popularity") p.set("sort", filters.sort);

  for (const key of STRING_KEYS) {
    const value = filters[key];
    if (
      typeof value === "string" &&
      value.trim() &&
      value !== "All" &&
      value !== DEFAULT_PHONE_FINDER_FILTERS[key]
    ) {
      p.set(key, value);
    }
  }

  for (const key of BOOL_KEYS) {
    const v = filters[key] as TriState;
    if (v != null) p.set(key, v ? "1" : "0");
  }
  return p;
}
