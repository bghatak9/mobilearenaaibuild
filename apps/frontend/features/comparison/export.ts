import type { Device } from "@/lib/api";

import { COMPARE_SPEC_ROWS } from "./spec-rows";

export function exportComparisonCsv(devices: Device[]): string {
  const header = ["Specification", ...devices.map((d) => d.name)].join(",");
  const lines = COMPARE_SPEC_ROWS.map((row) => {
    const values = devices.map((d) => {
      const raw = row.format(d).replace(/"/g, '""');
      return `"${raw}"`;
    });
    return [`"${row.label}"`, ...values].join(",");
  });
  return [header, ...lines].join("\n");
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function printComparison() {
  window.print();
}

export async function copyComparisonUrl(slug: string): Promise<boolean> {
  const url = `${window.location.origin}/compare/${slug}`;
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}
