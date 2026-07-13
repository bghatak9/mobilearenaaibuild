export type PhoneFinderSort =
  | "newest"
  | "popularity"
  | "price-asc"
  | "price-desc"
  | "rating";

export type TriState = boolean | null;

export type PriceCurrency = "USD" | "INR";

export type PhoneFinderFilters = {
  search: string;
  preset: string | null;
  brand: string;
  minPrice: number | null;
  maxPrice: number | null;
  priceCurrency: PriceCurrency;
  sort: PhoneFinderSort;

  minRam: number | null;
  minStorage: number | null;
  processor: string;
  os: string;
  minYear: number | null;
  maxYear: number | null;
  fiveG: TriState;
  availableOnly: boolean;
  minRating: number | null;

  minDisplay: number | null;
  maxDisplay: number | null;
  maxWeight: number | null;
  minRefresh: number | null;

  minCameraMp: number | null;
  minSelfieMp: number | null;
  minBattery: number | null;
  minChargingW: number | null;

  nfc: TriState;
  waterproof: TriState;
  wirelessCharging: TriState;
  reverseWireless: TriState;
  infrared: TriState;

  chipsetManufacturer: string;
  gpuType: string;
  cpuGeneration: string;
  gorillaGlassVersion: string;
  coolingTech: TriState;

  displayAmoled: TriState;
  displayLtpo: TriState;
  displayOled: TriState;
  displayMiniLed: TriState;
  display90Hz: TriState;
  display120Hz: TriState;
  display144Hz: TriState;
  hdr10Plus: TriState;
  dolbyVision: TriState;
  alwaysOnDisplay: TriState;

  ois: TriState;
  opticalZoom: TriState;
  periscope: TriState;
  video4k: TriState;
  video8k: TriState;
  nightMode: TriState;
  rawPhoto: TriState;
  highResSelfie: TriState;

  battery5000: TriState;
  battery6000: TriState;
  battery7000: TriState;
  charge45: TriState;
  charge80: TriState;
  charge120: TriState;

  dualSim: TriState;
  esim: TriState;
  wifi7: TriState;
  bluetooth6: TriState;
  satellite: TriState;
  usbTypeC: TriState;

  gorillaGlass: TriState;
  expandableStorage: TriState;
  cleanAndroid: TriState;
  aiFeaturesSupport: TriState;

  manufacturer: string;
  modelName: string;
  deviceType: string;
  availability: string;
  hasMarketPrice: TriState;
  displayTech: string;
  resolutionTier: string;
  refreshRateHz: string;
  hdrSupport: string;
  processorBrand: string;
  chipsetModel: string;
  ramTier: string;
  storageTier: string;
  storageExpansion: string;
  ultraWideCamera: TriState;
  telephotoCamera: TriState;
  batteryBucket: string;
  chargeTier: string;
  batteryReplacement: string;
  wifiVersion: string;
  bluetoothVersion: string;
  simType: string;
  cellularNetwork: string;
  fingerprintType: string;
  ipRating: string;
  buildMaterial: string;
  osFamily: string;
  updatePolicy: string;
  gamingShoulderTriggers: TriState;
  gamingCoolingFan: TriState;
  highTouchSampling: TriState;
  aiPhotography: TriState;
  aiTranslation: TriState;
  aiCallSummary: TriState;
  circleToSearch: TriState;
  onDeviceAi: TriState;
};

export const DEFAULT_PHONE_FINDER_FILTERS: PhoneFinderFilters = {
  search: "",
  preset: null,
  brand: "All",
  minPrice: null,
  maxPrice: null,
  priceCurrency: "USD",
  sort: "popularity",

  minRam: null,
  minStorage: null,
  processor: "All",
  os: "All",
  minYear: null,
  maxYear: null,
  fiveG: null,
  availableOnly: false,
  minRating: null,

  minDisplay: null,
  maxDisplay: null,
  maxWeight: null,
  minRefresh: null,

  minCameraMp: null,
  minSelfieMp: null,
  minBattery: null,
  minChargingW: null,

  nfc: null,
  waterproof: null,
  wirelessCharging: null,
  reverseWireless: null,
  infrared: null,

  chipsetManufacturer: "All",
  gpuType: "All",
  cpuGeneration: "All",
  gorillaGlassVersion: "All",
  coolingTech: null,

  displayAmoled: null,
  displayLtpo: null,
  displayOled: null,
  displayMiniLed: null,
  display90Hz: null,
  display120Hz: null,
  display144Hz: null,
  hdr10Plus: null,
  dolbyVision: null,
  alwaysOnDisplay: null,

  ois: null,
  opticalZoom: null,
  periscope: null,
  video4k: null,
  video8k: null,
  nightMode: null,
  rawPhoto: null,
  highResSelfie: null,

  battery5000: null,
  battery6000: null,
  battery7000: null,
  charge45: null,
  charge80: null,
  charge120: null,

  dualSim: null,
  esim: null,
  wifi7: null,
  bluetooth6: null,
  satellite: null,
  usbTypeC: null,

  gorillaGlass: null,
  expandableStorage: null,
  cleanAndroid: null,
  aiFeaturesSupport: null,

  manufacturer: "All",
  modelName: "",
  deviceType: "All",
  availability: "All",
  hasMarketPrice: null,
  displayTech: "All",
  resolutionTier: "All",
  refreshRateHz: "All",
  hdrSupport: "All",
  processorBrand: "All",
  chipsetModel: "All",
  ramTier: "All",
  storageTier: "All",
  storageExpansion: "All",
  ultraWideCamera: null,
  telephotoCamera: null,
  batteryBucket: "All",
  chargeTier: "All",
  batteryReplacement: "All",
  wifiVersion: "All",
  bluetoothVersion: "All",
  simType: "All",
  cellularNetwork: "All",
  fingerprintType: "All",
  ipRating: "All",
  buildMaterial: "All",
  osFamily: "All",
  updatePolicy: "All",
  gamingShoulderTriggers: null,
  gamingCoolingFan: null,
  highTouchSampling: null,
  aiPhotography: null,
  aiTranslation: null,
  aiCallSummary: null,
  circleToSearch: null,
  onDeviceAi: null,
};

export type PhoneFinderPreset = {
  id: string;
  label: string;
  /** i18n key under `finder.*` (useTranslations("finder")). */
  labelKey: string;
  emoji: string;
  category: "discovery" | "lifestyle";
  description: string;
  /** i18n key under `finder.*` (useTranslations("finder")). */
  descriptionKey: string;
  patch: Partial<PhoneFinderFilters>;
};
