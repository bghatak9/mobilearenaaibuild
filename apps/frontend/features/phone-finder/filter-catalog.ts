import type { FilterOption } from "@/components/phone-finder/FilterOptionPicker";

export const DEVICE_TYPE_OPTIONS: FilterOption[] = [
  { label: "Any type", value: "All" },
  { label: "Smartphone", value: "smartphone" },
  { label: "Foldable", value: "foldable" },
  { label: "Flip Phone", value: "flip" },
  { label: "Tablet", value: "tablet" },
  { label: "Gaming Phone", value: "gaming" },
  { label: "Feature Phone", value: "feature" },
];

export const AVAILABILITY_OPTIONS: FilterOption[] = [
  { label: "Any availability", value: "All" },
  { label: "Available", value: "available" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Discontinued", value: "discontinued" },
];

export const DISPLAY_TECH_OPTIONS: FilterOption[] = [
  { label: "All displays", value: "All" },
  { label: "AMOLED", value: "amoled" },
  { label: "Dynamic AMOLED", value: "dynamic-amoled" },
  { label: "OLED", value: "oled" },
  { label: "LTPO OLED", value: "ltpo-oled" },
  { label: "IPS LCD", value: "ips-lcd" },
  { label: "Mini-LED", value: "mini-led" },
];

export const RESOLUTION_OPTIONS: FilterOption[] = [
  { label: "Any resolution", value: "All" },
  { label: "HD+", value: "hd" },
  { label: "Full HD+", value: "fhd" },
  { label: "QHD+", value: "qhd" },
  { label: "4K", value: "4k" },
];

export const REFRESH_RATE_OPTIONS: FilterOption[] = [
  { label: "Any refresh rate", value: "All" },
  { label: "60Hz", value: "60" },
  { label: "90Hz", value: "90" },
  { label: "120Hz", value: "120" },
  { label: "144Hz", value: "144" },
  { label: "165Hz", value: "165" },
];

export const HDR_OPTIONS: FilterOption[] = [
  { label: "Any HDR", value: "All" },
  { label: "HDR10", value: "hdr10" },
  { label: "HDR10+", value: "hdr10+" },
  { label: "Dolby Vision", value: "dolby-vision" },
];

export const PROCESSOR_BRAND_OPTIONS: FilterOption[] = [
  { label: "All processors", value: "All" },
  { label: "Snapdragon", value: "Snapdragon" },
  { label: "MediaTek", value: "MediaTek" },
  { label: "Apple Silicon", value: "Apple Silicon" },
  { label: "Exynos", value: "Exynos" },
  { label: "Tensor", value: "Tensor" },
  { label: "Kirin", value: "Kirin" },
  { label: "Unisoc", value: "Unisoc" },
];

export const RAM_TIER_OPTIONS: FilterOption[] = [
  { label: "Any RAM", value: "All" },
  { label: "4GB", value: "4" },
  { label: "6GB", value: "6" },
  { label: "8GB", value: "8" },
  { label: "12GB", value: "12" },
  { label: "16GB", value: "16" },
  { label: "24GB", value: "24" },
];

export const STORAGE_TIER_OPTIONS: FilterOption[] = [
  { label: "Any storage", value: "All" },
  { label: "64GB", value: "64" },
  { label: "128GB", value: "128" },
  { label: "256GB", value: "256" },
  { label: "512GB", value: "512" },
  { label: "1TB", value: "1024" },
];

export const STORAGE_EXPANSION_OPTIONS: FilterOption[] = [
  { label: "Any expansion", value: "All" },
  { label: "microSD Supported", value: "microsd" },
  { label: "Hybrid Slot", value: "hybrid" },
  { label: "No Expansion", value: "none" },
];

export const BATTERY_BUCKET_OPTIONS: FilterOption[] = [
  { label: "Any capacity", value: "All" },
  { label: "Under 4000mAh", value: "under-4000" },
  { label: "4000–5000mAh", value: "4000-5000" },
  { label: "5000–6000mAh", value: "5000-6000" },
  { label: "Above 10000mAh", value: "above-10000" },
];

export const CHARGE_TIER_OPTIONS: FilterOption[] = [
  { label: "Any charging", value: "All" },
  { label: "18W+", value: "18" },
  { label: "33W+", value: "33" },
  { label: "45W+", value: "45" },
  { label: "67W+", value: "67" },
  { label: "100W+", value: "100" },
];

export const BATTERY_REPLACEMENT_OPTIONS: FilterOption[] = [
  { label: "Any battery type", value: "All" },
  { label: "User Replaceable", value: "user-replaceable" },
  { label: "Non-removable", value: "non-removable" },
];

export const CELLULAR_NETWORK_OPTIONS: FilterOption[] = [
  { label: "Any network", value: "All" },
  { label: "2G", value: "2g" },
  { label: "3G", value: "3g" },
  { label: "5G", value: "5g" },
];

export const WIFI_OPTIONS: FilterOption[] = [
  { label: "Any Wi-Fi", value: "All" },
  { label: "Wi-Fi 6", value: "wifi6" },
  { label: "Wi-Fi 6E", value: "wifi6e" },
  { label: "Wi-Fi 7", value: "wifi7" },
];

export const BLUETOOTH_OPTIONS: FilterOption[] = [
  { label: "Any Bluetooth", value: "All" },
  { label: "Bluetooth 5.0", value: "5.0" },
  { label: "Bluetooth 5.3", value: "5.3" },
  { label: "Bluetooth 5.4", value: "5.4" },
  { label: "Bluetooth 6", value: "6" },
];

export const SIM_TYPE_OPTIONS: FilterOption[] = [
  { label: "Any SIM", value: "All" },
  { label: "Single SIM", value: "single" },
  { label: "Dual SIM", value: "dual" },
  { label: "eSIM", value: "esim" },
  { label: "Dual Physical + eSIM", value: "dual-esim" },
];

export const FINGERPRINT_OPTIONS: FilterOption[] = [
  { label: "Any unlock", value: "All" },
  { label: "Under Display", value: "under-display" },
  { label: "Side Mounted", value: "side" },
  { label: "Rear Mounted", value: "rear" },
  { label: "Face Unlock Only", value: "face-only" },
];

export const IP_RATING_OPTIONS: FilterOption[] = [
  { label: "Any IP rating", value: "All" },
  { label: "IP52", value: "IP52" },
  { label: "IP54", value: "IP54" },
  { label: "IP67", value: "IP67" },
  { label: "IP68", value: "IP68" },
  { label: "IP69", value: "IP69" },
];

export const BUILD_MATERIAL_OPTIONS: FilterOption[] = [
  { label: "Any material", value: "All" },
  { label: "Plastic", value: "plastic" },
  { label: "Aluminum", value: "aluminum" },
  { label: "Glass", value: "glass" },
  { label: "Titanium", value: "titanium" },
];

export const OS_FAMILY_OPTIONS: FilterOption[] = [
  { label: "Any OS", value: "All" },
  { label: "Android", value: "android" },
  { label: "iOS", value: "ios" },
  { label: "HarmonyOS", value: "harmonyos" },
];

export const UPDATE_POLICY_OPTIONS: FilterOption[] = [
  { label: "Any update policy", value: "All" },
  { label: "2 Years", value: "2" },
  { label: "3 Years", value: "3" },
  { label: "4 Years", value: "4" },
  { label: "7 Years", value: "7" },
];

export const SORT_OPTIONS = [
  { label: "Popularity", value: "popularity" },
  { label: "Newest", value: "newest" },
  { label: "Price ↑", value: "price-asc" },
  { label: "Price ↓", value: "price-desc" },
  { label: "Rating", value: "rating" },
] as const;
