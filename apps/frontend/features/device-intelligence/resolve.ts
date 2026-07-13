import type { Device } from "@/lib/api";

import { createContext } from "./format";
import { DEVICE_DISCUSSION_TOPICS } from "./discussion-topics";
import { INTELLIGENCE_SECTIONS } from "./sections";
import type {
  CommunityInsights,
  IntelligenceTier,
  ResolvedIntelligenceField,
  ResolvedIntelligenceSection,
} from "./types";

export type CompareDensityMode =
  | "minimal"
  | "standard"
  | "detailed"
  | "engineering";

export type CompareViewFilter =
  | "complete"
  | "differences"
  | "technical"
  | "buyer"
  | "compact";

function tierAllowed(
  fieldTier: IntelligenceTier,
  density: CompareDensityMode,
): boolean {
  if (density === "engineering") return true;
  if (density === "detailed") return fieldTier !== "engineering";
  if (density === "standard")
    return fieldTier === "core" || fieldTier === "standard";
  return fieldTier === "core";
}

function rowWinners(
  field: (typeof INTELLIGENCE_SECTIONS)[0]["fields"][0],
  devices: Device[],
): number[] {
  if (!field.score) return [];
  const scores = devices.map((d) => field.score!(createContext(d)));
  const present = scores
    .map((value, index) => ({ value, index }))
    .filter((e): e is { value: number; index: number } => e.value != null);
  if (present.length < 2) return [];
  const target =
    field.higherIsBetter === false
      ? Math.min(...present.map((p) => p.value))
      : Math.max(...present.map((p) => p.value));
  return present.filter((p) => p.value === target).map((p) => p.index);
}

function valuesEqual(values: string[]): boolean {
  return values.every((v) => v === values[0]);
}

function isEmptyValue(v: string): boolean {
  return !v || v === "—" || v === "Not specified";
}

export function resolveIntelligenceSections(
  devices: Device[],
  options: {
    density?: CompareDensityMode;
    view?: CompareViewFilter;
    searchQuery?: string;
    collapseEmpty?: boolean;
    differencesOnly?: boolean;
    hideUnspecified?: boolean;
  } = {},
): ResolvedIntelligenceSection[] {
  const {
    density = "standard",
    view = "complete",
    searchQuery = "",
    collapseEmpty = true,
    differencesOnly = false,
    hideUnspecified = false,
  } = options;

  const effectiveDensity: CompareDensityMode =
    view === "compact" || view === "buyer"
      ? "minimal"
      : view === "technical"
        ? "engineering"
        : density;

  const q = searchQuery.trim().toLowerCase();

  return INTELLIGENCE_SECTIONS.map((section) => {
    const fields: ResolvedIntelligenceField[] = [];

    for (const field of section.fields) {
      if (!tierAllowed(field.tier, effectiveDensity)) continue;
      if (view === "compact" && field.tier !== "core") continue;

      const values = devices.map((d) => {
        const raw = field.resolve(createContext(d));
        return raw?.trim() ? raw : "Not specified";
      });

      if (hideUnspecified && values.every(isEmptyValue)) continue;

      if (differencesOnly || view === "differences") {
        if (valuesEqual(values)) continue;
      }

      if (q) {
        const hit =
          field.label.toLowerCase().includes(q) ||
          section.title.toLowerCase().includes(q) ||
          values.some((v) => v.toLowerCase().includes(q));
        if (!hit) continue;
      }

      fields.push({
        id: field.id,
        label: field.label,
        values,
        winnerIndices: rowWinners(field, devices),
      });
    }

    if (collapseEmpty) {
      const allEmpty = fields.every((f) => f.values.every(isEmptyValue));
      if (allEmpty) return null;
    }

    if (!fields.length) return null;

    return { id: section.id, title: section.title, fields };
  }).filter((s): s is ResolvedIntelligenceSection => s != null);
}

export function resolveDeviceSections(
  device: Device,
  density: CompareDensityMode = "standard",
  options: { hideUnspecified?: boolean } = {},
): ResolvedIntelligenceSection[] {
  return resolveIntelligenceSections([device], {
    density,
    view: "complete",
    collapseEmpty: true,
    hideUnspecified: options.hideUnspecified ?? true,
  });
}

export function buildCommunityInsights(device: Device): CommunityInsights {
  const rating = device.rating ?? 4.2;
  const count = device.communityRatingCount ?? 0;
  const praised: string[] = [];
  const improvements: string[] = [];

  if ((device.battery?.capacity ?? 0) >= 5000) praised.push("Battery life");
  if ((parseChargingWatts(device.battery?.charging) ?? 0) >= 45)
    praised.push("Charging speed");
  if ((device.display?.brightness ?? 0) >= 2000) praised.push("Display quality");
  if ((device.chipset?.benchmark ?? 0) > 1_000_000) praised.push("Performance");
  if (praised.length === 0) praised.push("Build quality", "Value proposition");

  if ((device.weight ?? 0) > 220) improvements.push("Weight reduction");
  if ((mainCameraMp(device) ?? 0) < 50) improvements.push("Camera software");
  if (count < 5) improvements.push("More owner reviews");
  if (improvements.length === 0) improvements.push("Accessory availability");

  const buyAgain = Math.min(96, Math.round(72 + rating * 3));
  const recommend = Math.min(94, buyAgain - 3);

  return {
    ownerSatisfaction: `${rating.toFixed(1)} / 5`,
    mostPraised: praised.slice(0, 4),
    improvements: improvements.slice(0, 3),
    polls: [
      { label: "Would buy again", value: `${buyAgain}%` },
      { label: "Recommended to friends", value: `${recommend}%` },
    ],
    discussionTopics: [...DEVICE_DISCUSSION_TOPICS],
  };
}

function parseChargingWatts(charging: string | undefined): number {
  if (!charging) return 0;
  const match = charging.match(/(\d+)\s*w/i);
  return match ? Number(match[1]) : 0;
}

function mainCameraMp(device: Device): number | null {
  if (!device.cameras?.length) return null;
  return Math.max(...device.cameras.map((c) => c.megapixel));
}
