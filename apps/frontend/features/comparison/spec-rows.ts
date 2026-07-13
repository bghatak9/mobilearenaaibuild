import type { Device } from "@/lib/api";
import { formatDate as formatLocaleDate } from "@/lib/format-datetime";

import type { CompareLabId, CompareSpecRow } from "./types";

function yesNo(value: boolean | null | undefined): string {
  if (value == null) return "—";
  return value ? "__yes__" : "__no__";
}

function mainCameraMp(device: Device): number | null {
  if (!device.cameras?.length) return null;
  return Math.max(...device.cameras.map((c) => c.megapixel));
}

function formatPrice(device: Device): string {
  if (device.price == null) return "—";
  return `₹${device.price.toLocaleString("en-IN")}`;
}

export const COMPARE_SPEC_ROWS: CompareSpecRow[] = [
  {
    id: "price",
    categoryKey: "categories.overview",
    labelKey: "labels.price",
    category: "Overview",
    label: "Launch price",
    format: formatPrice,
    score: (d) => d.price ?? null,
    higherIsBetter: false,
    compact: true,
    labs: ["value", "student", "business"],
  },
  {
    id: "rating",
    categoryKey: "categories.overview",
    labelKey: "labels.rating",
    category: "Overview",
    label: "Community rating",
    format: (d) =>
      d.rating != null
        ? `${d.rating.toFixed(1)}/10 (${d.communityRatingCount ?? 0} votes)`
        : "—",
    score: (d) => (d.rating != null ? d.rating * 10 : null),
    higherIsBetter: true,
    compact: true,
  },
  {
    id: "brand",
    categoryKey: "categories.overview",
    labelKey: "labels.brand",
    category: "Overview",
    label: "Brand",
    format: (d) => d.brand?.name ?? "—",
    compact: true,
  },
  {
    id: "os",
    categoryKey: "categories.software",
    labelKey: "labels.os",
    category: "Software",
    label: "Operating system",
    format: (d) => d.os ?? "—",
    labs: ["software", "business"],
    compact: true,
  },
  {
    id: "ram",
    categoryKey: "categories.performance",
    labelKey: "labels.ram",
    category: "Performance",
    label: "RAM",
    format: (d) => (d.ramGb != null ? `${d.ramGb} GB` : "—"),
    score: (d) => d.ramGb ?? null,
    higherIsBetter: true,
    labs: ["performance", "gaming", "creator"],
    compact: true,
  },
  {
    id: "storage",
    categoryKey: "categories.performance",
    labelKey: "labels.storage",
    category: "Performance",
    label: "Storage",
    format: (d) => (d.storageGb != null ? `${d.storageGb} GB` : "—"),
    score: (d) => d.storageGb ?? null,
    higherIsBetter: true,
    labs: ["performance", "creator"],
    compact: true,
  },
  {
    id: "chipset",
    categoryKey: "categories.performance",
    labelKey: "labels.chipset",
    category: "Performance",
    label: "Processor",
    format: (d) => d.chipset?.cpu ?? "—",
    labs: ["performance", "gaming"],
    compact: true,
  },
  {
    id: "gpu",
    categoryKey: "categories.performance",
    labelKey: "labels.gpu",
    category: "Performance",
    label: "GPU",
    format: (d) => d.chipset?.gpu ?? "—",
    labs: ["performance", "gaming"],
  },
  {
    id: "fabrication",
    categoryKey: "categories.performance",
    labelKey: "labels.fabrication",
    category: "Performance",
    label: "Fabrication",
    format: (d) => d.chipset?.fabrication ?? "—",
    labs: ["performance"],
  },
  {
    id: "benchmark",
    categoryKey: "categories.performance",
    labelKey: "labels.benchmark",
    category: "Performance",
    label: "Benchmark score",
    format: (d) =>
      d.chipset?.benchmark != null ? String(d.chipset.benchmark) : "—",
    score: (d) => d.chipset?.benchmark ?? null,
    higherIsBetter: true,
    labs: ["performance", "gaming"],
    compact: true,
  },
  {
    id: "display-size",
    categoryKey: "categories.display",
    labelKey: "labels.displaySize",
    category: "Display",
    label: "Screen size",
    format: (d) => (d.display ? `${d.display.size}"` : "—"),
    labs: ["display"],
    compact: true,
  },
  {
    id: "display-type",
    categoryKey: "categories.display",
    labelKey: "labels.displayType",
    category: "Display",
    label: "Panel type",
    format: (d) => d.display?.type ?? "—",
    labs: ["display"],
  },
  {
    id: "display-resolution",
    categoryKey: "categories.display",
    labelKey: "labels.displayResolution",
    category: "Display",
    label: "Resolution",
    format: (d) => d.display?.resolution ?? "—",
    labs: ["display"],
  },
  {
    id: "refresh-rate",
    categoryKey: "categories.display",
    labelKey: "labels.refreshRate",
    category: "Display",
    label: "Refresh rate",
    format: (d) => (d.display ? `${d.display.refreshRate} Hz` : "—"),
    score: (d) => d.display?.refreshRate ?? null,
    higherIsBetter: true,
    labs: ["display", "gaming"],
    compact: true,
  },
  {
    id: "brightness",
    categoryKey: "categories.display",
    labelKey: "labels.brightness",
    category: "Display",
    label: "Peak brightness",
    format: (d) => (d.display ? `${d.display.brightness} nits` : "—"),
    score: (d) => d.display?.brightness ?? null,
    higherIsBetter: true,
    labs: ["display"],
    compact: true,
  },
  {
    id: "display-protection",
    categoryKey: "categories.display",
    labelKey: "labels.displayProtection",
    category: "Display",
    label: "Glass protection",
    format: (d) => d.display?.protection ?? "—",
    labs: ["display"],
  },
  {
    id: "main-camera",
    categoryKey: "categories.camera",
    labelKey: "labels.mainCamera",
    category: "Camera",
    label: "Main camera",
    format: (d) => {
      const mp = mainCameraMp(d);
      return mp != null ? `${mp} MP` : "—";
    },
    score: mainCameraMp,
    higherIsBetter: true,
    labs: ["camera", "creator"],
    compact: true,
  },
  {
    id: "camera-count",
    categoryKey: "categories.camera",
    labelKey: "labels.cameraCount",
    category: "Camera",
    label: "Camera modules",
    format: (d) =>
      d.cameras?.length ? `${d.cameras.length} lenses` : "—",
    score: (d) => d.cameras?.length ?? null,
    higherIsBetter: true,
    labs: ["camera"],
  },
  {
    id: "aperture",
    categoryKey: "categories.camera",
    labelKey: "labels.aperture",
    category: "Camera",
    label: "Primary aperture",
    format: (d) => d.cameras?.[0]?.aperture ?? "—",
    labs: ["camera"],
  },
  {
    id: "optical-zoom",
    categoryKey: "categories.camera",
    labelKey: "labels.opticalZoom",
    category: "Camera",
    label: "Optical zoom",
    format: (d) => d.cameras?.[0]?.opticalZoom ?? "—",
    labs: ["camera", "creator"],
  },
  {
    id: "ois",
    categoryKey: "categories.camera",
    labelKey: "labels.ois",
    category: "Camera",
    label: "OIS / stabilization",
    format: (d) => yesNo(d.cameras?.some((c) => c.stabilization)),
    labs: ["camera"],
  },
  {
    id: "battery-capacity",
    categoryKey: "categories.battery",
    labelKey: "labels.batteryCapacity",
    category: "Battery",
    label: "Battery capacity",
    format: (d) => (d.battery ? `${d.battery.capacity} mAh` : "—"),
    score: (d) => d.battery?.capacity ?? null,
    higherIsBetter: true,
    labs: ["battery", "student", "senior"],
    compact: true,
  },
  {
    id: "wired-charging",
    categoryKey: "categories.battery",
    labelKey: "labels.wiredCharging",
    category: "Battery",
    label: "Wired charging",
    format: (d) => d.battery?.charging ?? "—",
    labs: ["battery"],
  },
  {
    id: "wireless-charging",
    categoryKey: "categories.battery",
    labelKey: "labels.wirelessCharging",
    category: "Battery",
    label: "Wireless charging",
    format: (d) => yesNo(d.battery?.wireless),
    labs: ["battery"],
  },
  {
    id: "reverse-charging",
    categoryKey: "categories.battery",
    labelKey: "labels.reverseCharging",
    category: "Battery",
    label: "Reverse charging",
    format: (d) => yesNo(d.battery?.reverse),
    labs: ["battery"],
  },
  {
    id: "five-g",
    categoryKey: "categories.connectivity",
    labelKey: "labels.fiveG",
    category: "Connectivity",
    label: "5G support",
    format: (d) => yesNo(d.fiveG),
    labs: ["network", "business"],
    compact: true,
  },
  {
    id: "nfc",
    categoryKey: "categories.connectivity",
    labelKey: "labels.nfc",
    category: "Connectivity",
    label: "NFC",
    format: (d) => yesNo(d.nfc),
    labs: ["network", "business", "ecosystem"],
  },
  {
    id: "infrared",
    categoryKey: "categories.connectivity",
    labelKey: "labels.infrared",
    category: "Connectivity",
    label: "Infrared",
    format: (d) => yesNo(d.infrared),
    labs: ["network", "ecosystem"],
  },
  {
    id: "fingerprint",
    categoryKey: "categories.connectivity",
    labelKey: "labels.fingerprint",
    category: "Connectivity",
    label: "Biometrics",
    format: (d) => d.fingerprint ?? "—",
    labs: ["business", "senior"],
  },
  {
    id: "waterproof",
    categoryKey: "categories.durability",
    labelKey: "labels.waterproof",
    category: "Durability",
    label: "Water resistance",
    format: (d) => yesNo(d.waterproof),
    labs: ["repairability", "student"],
  },
  {
    id: "weight",
    categoryKey: "categories.design",
    labelKey: "labels.weight",
    category: "Design",
    label: "Weight",
    format: (d) => (d.weight != null ? `${d.weight} g` : "—"),
    score: (d) => d.weight ?? null,
    higherIsBetter: false,
    compact: true,
  },
  {
    id: "dimensions",
    categoryKey: "categories.design",
    labelKey: "labels.dimensions",
    category: "Design",
    label: "Dimensions",
    format: (d) => d.dimensions ?? "—",
    labs: ["senior"],
  },
  {
    id: "announced",
    categoryKey: "categories.lifecycle",
    labelKey: "labels.announced",
    category: "Lifecycle",
    label: "Announced",
    format: (d) =>
      d.announcedDate ? formatLocaleDate(d.announcedDate) : "—",
    labs: ["software", "value"],
  },
  {
    id: "released",
    categoryKey: "categories.lifecycle",
    labelKey: "labels.released",
    category: "Lifecycle",
    label: "Released",
    format: (d) =>
      d.releasedDate ? formatLocaleDate(d.releasedDate) : "—",
    labs: ["software", "value"],
  },
];

export function rowsForLab(lab: CompareLabId): CompareSpecRow[] {
  return COMPARE_SPEC_ROWS.filter((row) => row.labs?.includes(lab));
}

export function rowValuesEqual(
  row: CompareSpecRow,
  devices: Device[],
): boolean {
  const values = devices.map((d) => row.format(d));
  return values.every((v) => v === values[0]);
}

export function rowWinnerIndices(
  row: CompareSpecRow,
  devices: Device[],
): number[] {
  if (!row.score) return [];
  const scores = devices.map((d) => row.score!(d));
  const present = scores
    .map((value, index) => ({ value, index }))
    .filter((e): e is { value: number; index: number } => e.value != null);
  if (present.length < 2) return [];
  const target =
    row.higherIsBetter === false
      ? Math.min(...present.map((p) => p.value))
      : Math.max(...present.map((p) => p.value));
  return present.filter((p) => p.value === target).map((p) => p.index);
}
