import type { FilterOption } from "@/components/phone-finder/FilterOptionPicker";

/** Catalog option with i18n key under `finder.catalog.*` (use with useTranslations("finder")). */
export type CatalogFilterOption<T extends string = string> = FilterOption<T> & {
  labelKey: string;
};

export const DEVICE_TYPE_OPTIONS: CatalogFilterOption[] = [
  { label: "Any type", labelKey: "catalog.deviceType.any", value: "All" },
  { label: "Smartphone", labelKey: "catalog.deviceType.smartphone", value: "smartphone" },
  { label: "Foldable", labelKey: "catalog.deviceType.foldable", value: "foldable" },
  { label: "Flip Phone", labelKey: "catalog.deviceType.flip", value: "flip" },
  { label: "Tablet", labelKey: "catalog.deviceType.tablet", value: "tablet" },
  { label: "Gaming Phone", labelKey: "catalog.deviceType.gaming", value: "gaming" },
  { label: "Feature Phone", labelKey: "catalog.deviceType.feature", value: "feature" },
];

export const AVAILABILITY_OPTIONS: CatalogFilterOption[] = [
  { label: "Any availability", labelKey: "catalog.availability.any", value: "All" },
  { label: "Available", labelKey: "catalog.availability.available", value: "available" },
  { label: "Upcoming", labelKey: "catalog.availability.upcoming", value: "upcoming" },
  { label: "Discontinued", labelKey: "catalog.availability.discontinued", value: "discontinued" },
];

export const DISPLAY_TECH_OPTIONS: CatalogFilterOption[] = [
  { label: "All displays", labelKey: "catalog.displayTech.all", value: "All" },
  { label: "AMOLED", labelKey: "catalog.displayTech.amoled", value: "amoled" },
  { label: "Dynamic AMOLED", labelKey: "catalog.displayTech.dynamicAmoled", value: "dynamic-amoled" },
  { label: "OLED", labelKey: "catalog.displayTech.oled", value: "oled" },
  { label: "LTPO OLED", labelKey: "catalog.displayTech.ltpoOled", value: "ltpo-oled" },
  { label: "IPS LCD", labelKey: "catalog.displayTech.ipsLcd", value: "ips-lcd" },
  { label: "Mini-LED", labelKey: "catalog.displayTech.miniLed", value: "mini-led" },
];

export const RESOLUTION_OPTIONS: CatalogFilterOption[] = [
  { label: "Any resolution", labelKey: "catalog.resolution.any", value: "All" },
  { label: "HD+", labelKey: "catalog.resolution.hd", value: "hd" },
  { label: "Full HD+", labelKey: "catalog.resolution.fhd", value: "fhd" },
  { label: "QHD+", labelKey: "catalog.resolution.qhd", value: "qhd" },
  { label: "4K", labelKey: "catalog.resolution.uhd4k", value: "4k" },
];

export const REFRESH_RATE_OPTIONS: CatalogFilterOption[] = [
  { label: "Any refresh rate", labelKey: "catalog.refreshRate.any", value: "All" },
  { label: "60Hz", labelKey: "catalog.refreshRate.hz60", value: "60" },
  { label: "90Hz", labelKey: "catalog.refreshRate.hz90", value: "90" },
  { label: "120Hz", labelKey: "catalog.refreshRate.hz120", value: "120" },
  { label: "144Hz", labelKey: "catalog.refreshRate.hz144", value: "144" },
  { label: "165Hz", labelKey: "catalog.refreshRate.hz165", value: "165" },
];

export const HDR_OPTIONS: CatalogFilterOption[] = [
  { label: "Any HDR", labelKey: "catalog.hdr.any", value: "All" },
  { label: "HDR10", labelKey: "catalog.hdr.hdr10", value: "hdr10" },
  { label: "HDR10+", labelKey: "catalog.hdr.hdr10Plus", value: "hdr10+" },
  { label: "Dolby Vision", labelKey: "catalog.hdr.dolbyVision", value: "dolby-vision" },
];

export const PROCESSOR_BRAND_OPTIONS: CatalogFilterOption[] = [
  { label: "All processors", labelKey: "catalog.processorBrand.all", value: "All" },
  { label: "Snapdragon", labelKey: "catalog.processorBrand.snapdragon", value: "Snapdragon" },
  { label: "MediaTek", labelKey: "catalog.processorBrand.mediatek", value: "MediaTek" },
  { label: "Apple Silicon", labelKey: "catalog.processorBrand.appleSilicon", value: "Apple Silicon" },
  { label: "Exynos", labelKey: "catalog.processorBrand.exynos", value: "Exynos" },
  { label: "Tensor", labelKey: "catalog.processorBrand.tensor", value: "Tensor" },
  { label: "Kirin", labelKey: "catalog.processorBrand.kirin", value: "Kirin" },
  { label: "Unisoc", labelKey: "catalog.processorBrand.unisoc", value: "Unisoc" },
];

export const RAM_TIER_OPTIONS: CatalogFilterOption[] = [
  { label: "Any RAM", labelKey: "catalog.ram.any", value: "All" },
  { label: "4GB", labelKey: "catalog.ram.gb4", value: "4" },
  { label: "6GB", labelKey: "catalog.ram.gb6", value: "6" },
  { label: "8GB", labelKey: "catalog.ram.gb8", value: "8" },
  { label: "12GB", labelKey: "catalog.ram.gb12", value: "12" },
  { label: "16GB", labelKey: "catalog.ram.gb16", value: "16" },
  { label: "24GB", labelKey: "catalog.ram.gb24", value: "24" },
];

export const STORAGE_TIER_OPTIONS: CatalogFilterOption[] = [
  { label: "Any storage", labelKey: "catalog.storage.any", value: "All" },
  { label: "64GB", labelKey: "catalog.storage.gb64", value: "64" },
  { label: "128GB", labelKey: "catalog.storage.gb128", value: "128" },
  { label: "256GB", labelKey: "catalog.storage.gb256", value: "256" },
  { label: "512GB", labelKey: "catalog.storage.gb512", value: "512" },
  { label: "1TB", labelKey: "catalog.storage.tb1", value: "1024" },
];

export const STORAGE_EXPANSION_OPTIONS: CatalogFilterOption[] = [
  { label: "Any expansion", labelKey: "catalog.storageExpansion.any", value: "All" },
  { label: "microSD Supported", labelKey: "catalog.storageExpansion.microsd", value: "microsd" },
  { label: "Hybrid Slot", labelKey: "catalog.storageExpansion.hybrid", value: "hybrid" },
  { label: "No Expansion", labelKey: "catalog.storageExpansion.none", value: "none" },
];

export const BATTERY_BUCKET_OPTIONS: CatalogFilterOption[] = [
  { label: "Any capacity", labelKey: "catalog.batteryBucket.any", value: "All" },
  { label: "Under 4000mAh", labelKey: "catalog.batteryBucket.under4000", value: "under-4000" },
  { label: "4000–5000mAh", labelKey: "catalog.batteryBucket.range4000to5000", value: "4000-5000" },
  { label: "5000–6000mAh", labelKey: "catalog.batteryBucket.range5000to6000", value: "5000-6000" },
  { label: "Above 10000mAh", labelKey: "catalog.batteryBucket.above10000", value: "above-10000" },
];

export const CHARGE_TIER_OPTIONS: CatalogFilterOption[] = [
  { label: "Any charging", labelKey: "catalog.chargeTier.any", value: "All" },
  { label: "18W+", labelKey: "catalog.chargeTier.w18", value: "18" },
  { label: "33W+", labelKey: "catalog.chargeTier.w33", value: "33" },
  { label: "45W+", labelKey: "catalog.chargeTier.w45", value: "45" },
  { label: "67W+", labelKey: "catalog.chargeTier.w67", value: "67" },
  { label: "100W+", labelKey: "catalog.chargeTier.w100", value: "100" },
];

export const BATTERY_REPLACEMENT_OPTIONS: CatalogFilterOption[] = [
  { label: "Any battery type", labelKey: "catalog.batteryReplacement.any", value: "All" },
  { label: "User Replaceable", labelKey: "catalog.batteryReplacement.userReplaceable", value: "user-replaceable" },
  { label: "Non-removable", labelKey: "catalog.batteryReplacement.nonRemovable", value: "non-removable" },
];

export const CELLULAR_NETWORK_OPTIONS: CatalogFilterOption[] = [
  { label: "Any network", labelKey: "catalog.cellular.any", value: "All" },
  { label: "2G", labelKey: "catalog.cellular.g2", value: "2g" },
  { label: "3G", labelKey: "catalog.cellular.g3", value: "3g" },
  { label: "5G", labelKey: "catalog.cellular.g5", value: "5g" },
];

export const WIFI_OPTIONS: CatalogFilterOption[] = [
  { label: "Any Wi-Fi", labelKey: "catalog.wifi.any", value: "All" },
  { label: "Wi-Fi 6", labelKey: "catalog.wifi.wifi6", value: "wifi6" },
  { label: "Wi-Fi 6E", labelKey: "catalog.wifi.wifi6e", value: "wifi6e" },
  { label: "Wi-Fi 7", labelKey: "catalog.wifi.wifi7", value: "wifi7" },
];

export const BLUETOOTH_OPTIONS: CatalogFilterOption[] = [
  { label: "Any Bluetooth", labelKey: "catalog.bluetooth.any", value: "All" },
  { label: "Bluetooth 5.0", labelKey: "catalog.bluetooth.v50", value: "5.0" },
  { label: "Bluetooth 5.3", labelKey: "catalog.bluetooth.v53", value: "5.3" },
  { label: "Bluetooth 5.4", labelKey: "catalog.bluetooth.v54", value: "5.4" },
  { label: "Bluetooth 6", labelKey: "catalog.bluetooth.v6", value: "6" },
];

export const SIM_TYPE_OPTIONS: CatalogFilterOption[] = [
  { label: "Any SIM", labelKey: "catalog.sim.any", value: "All" },
  { label: "Single SIM", labelKey: "catalog.sim.single", value: "single" },
  { label: "Dual SIM", labelKey: "catalog.sim.dual", value: "dual" },
  { label: "eSIM", labelKey: "catalog.sim.esim", value: "esim" },
  { label: "Dual Physical + eSIM", labelKey: "catalog.sim.dualEsim", value: "dual-esim" },
];

export const FINGERPRINT_OPTIONS: CatalogFilterOption[] = [
  { label: "Any unlock", labelKey: "catalog.fingerprint.any", value: "All" },
  { label: "Under Display", labelKey: "catalog.fingerprint.underDisplay", value: "under-display" },
  { label: "Side Mounted", labelKey: "catalog.fingerprint.side", value: "side" },
  { label: "Rear Mounted", labelKey: "catalog.fingerprint.rear", value: "rear" },
  { label: "Face Unlock Only", labelKey: "catalog.fingerprint.faceOnly", value: "face-only" },
];

export const IP_RATING_OPTIONS: CatalogFilterOption[] = [
  { label: "Any IP rating", labelKey: "catalog.ipRating.any", value: "All" },
  { label: "IP52", labelKey: "catalog.ipRating.ip52", value: "IP52" },
  { label: "IP54", labelKey: "catalog.ipRating.ip54", value: "IP54" },
  { label: "IP67", labelKey: "catalog.ipRating.ip67", value: "IP67" },
  { label: "IP68", labelKey: "catalog.ipRating.ip68", value: "IP68" },
  { label: "IP69", labelKey: "catalog.ipRating.ip69", value: "IP69" },
];

export const BUILD_MATERIAL_OPTIONS: CatalogFilterOption[] = [
  { label: "Any material", labelKey: "catalog.buildMaterial.any", value: "All" },
  { label: "Plastic", labelKey: "catalog.buildMaterial.plastic", value: "plastic" },
  { label: "Aluminum", labelKey: "catalog.buildMaterial.aluminum", value: "aluminum" },
  { label: "Glass", labelKey: "catalog.buildMaterial.glass", value: "glass" },
  { label: "Titanium", labelKey: "catalog.buildMaterial.titanium", value: "titanium" },
];

export const OS_FAMILY_OPTIONS: CatalogFilterOption[] = [
  { label: "Any OS", labelKey: "catalog.osFamily.any", value: "All" },
  { label: "Android", labelKey: "catalog.osFamily.android", value: "android" },
  { label: "iOS", labelKey: "catalog.osFamily.ios", value: "ios" },
  { label: "HarmonyOS", labelKey: "catalog.osFamily.harmonyos", value: "harmonyos" },
];

export const UPDATE_POLICY_OPTIONS: CatalogFilterOption[] = [
  { label: "Any update policy", labelKey: "catalog.updatePolicy.any", value: "All" },
  { label: "2 Years", labelKey: "catalog.updatePolicy.years2", value: "2" },
  { label: "3 Years", labelKey: "catalog.updatePolicy.years3", value: "3" },
  { label: "4 Years", labelKey: "catalog.updatePolicy.years4", value: "4" },
  { label: "7 Years", labelKey: "catalog.updatePolicy.years7", value: "7" },
];

export const SORT_OPTIONS = [
  { label: "Popularity", labelKey: "catalog.sort.popularity", value: "popularity" },
  { label: "Newest", labelKey: "catalog.sort.newest", value: "newest" },
  { label: "Price ↑", labelKey: "catalog.sort.priceAsc", value: "price-asc" },
  { label: "Price ↓", labelKey: "catalog.sort.priceDesc", value: "price-desc" },
  { label: "Rating", labelKey: "catalog.sort.rating", value: "rating" },
] as const;
