import type { CompareSpecRow } from "./types";
import { COMPARE_SPEC_ROWS } from "./spec-rows";

export type WorkspaceSection = {
  id: string;
  title: string;
  rowIds: string[];
};

/** Research workspace sections — original taxonomy, not gadget-site clones. */
export const WORKSPACE_SECTIONS: WorkspaceSection[] = [
  {
    id: "availability",
    title: "Availability",
    rowIds: ["announced", "released", "storage", "price", "brand"],
  },
  {
    id: "physical",
    title: "Physical Design",
    rowIds: [
      "dimensions",
      "weight",
      "waterproof",
      "fingerprint",
      "display-protection",
    ],
  },
  {
    id: "display",
    title: "Display Laboratory",
    rowIds: [
      "display-type",
      "display-size",
      "refresh-rate",
      "brightness",
      "display-resolution",
      "display-protection",
    ],
  },
  {
    id: "computing",
    title: "Computing Platform",
    rowIds: ["chipset", "fabrication", "gpu", "ram", "storage"],
  },
  {
    id: "performance",
    title: "Performance Observatory",
    rowIds: ["benchmark", "ram", "chipset", "gpu"],
  },
  {
    id: "energy",
    title: "Energy Systems",
    rowIds: [
      "battery-capacity",
      "wired-charging",
      "wireless-charging",
      "reverse-charging",
    ],
  },
  {
    id: "imaging",
    title: "Imaging Architecture",
    rowIds: [
      "camera-count",
      "main-camera",
      "aperture",
      "optical-zoom",
      "ois",
    ],
  },
  {
    id: "communication",
    title: "Communication Systems",
    rowIds: ["five-g", "nfc", "infrared", "fingerprint"],
  },
  {
    id: "software",
    title: "Software Lifecycle",
    rowIds: ["os", "rating", "released"],
  },
];

export function rowsForWorkspaceSection(
  section: WorkspaceSection,
): CompareSpecRow[] {
  const byId = new Map(COMPARE_SPEC_ROWS.map((r) => [r.id, r]));
  const seen = new Set<string>();
  const rows: CompareSpecRow[] = [];
  for (const id of section.rowIds) {
    if (seen.has(id)) continue;
    const row = byId.get(id);
    if (row) {
      seen.add(id);
      rows.push(row);
    }
  }
  return rows;
}

export function allWorkspaceRows(): CompareSpecRow[] {
  const seen = new Set<string>();
  const rows: CompareSpecRow[] = [];
  for (const section of WORKSPACE_SECTIONS) {
    for (const row of rowsForWorkspaceSection(section)) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      rows.push(row);
    }
  }
  return rows;
}
