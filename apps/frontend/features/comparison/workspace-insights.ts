import type { Device } from "@/lib/api";

import { rowWinnerIndices } from "./spec-rows";
import { COMPARE_SPEC_ROWS } from "./spec-rows";
import type {
  DecisionMatrixRow,
  WorkspaceAdvantage,
} from "./types";
import { computeDeviceIndices } from "./device-indices";

export function buildAdvantageSummary(devices: Device[]): WorkspaceAdvantage[] {
  const advantages: WorkspaceAdvantage[] = [];

  for (const row of COMPARE_SPEC_ROWS) {
    if (!row.score) continue;
    const winners = rowWinnerIndices(row, devices);
    if (winners.length !== 1) continue;
    advantages.push({
      deviceIndex: winners[0],
      label: row.label,
    });
  }

  if (devices.some((d) => d.infrared)) {
    const idx = devices.findIndex((d) => d.infrared);
    if (idx >= 0 && !advantages.some((a) => a.label === "Infrared Support")) {
      advantages.push({ deviceIndex: idx, label: "Infrared Support" });
    }
  }

  if (devices.some((d) => d.nfc)) {
    const idx = devices.findIndex((d) => d.nfc && !devices.every((x) => x.nfc));
    if (idx >= 0 && !advantages.some((a) => a.label === "NFC Ecosystem")) {
      advantages.push({ deviceIndex: idx, label: "NFC Ecosystem" });
    }
  }

  return advantages;
}

export function groupAdvantagesByDevice(
  advantages: WorkspaceAdvantage[],
  deviceCount: number,
): string[][] {
  return Array.from({ length: deviceCount }, (_, i) =>
    advantages.filter((a) => a.deviceIndex === i).map((a) => a.label),
  );
}

export function buildDecisionMatrix(devices: Device[]): DecisionMatrixRow[] {
  const indices = devices.map(computeDeviceIndices);

  const pick = (scores: number[]) => {
    const max = Math.max(...scores);
    const index = scores.indexOf(max);
    return { index, name: devices[index]?.name ?? "" };
  };

  const rows: Array<{ label: string; index: number; name: string }> = [
    {
      label: "Power Users",
      ...pick(indices.map((s) => s.performanceIndex)),
    },
    {
      label: "Battery Enthusiasts",
      ...pick(indices.map((s) => s.batteryExcellence)),
    },
    {
      label: "Content Creators",
      ...pick(indices.map((s) => s.cameraCapability)),
    },
    {
      label: "Travelers",
      ...pick(
        devices.map(
          (d) =>
            (d.battery?.capacity ?? 0) +
            parseChargingWatts(d.battery?.charging) * 10,
        ),
      ),
    },
    {
      label: "Long-Term Ownership",
      ...pick(indices.map((s) => s.softwareLongevity)),
    },
    {
      label: "Value Seekers",
      ...pick(indices.map((s) => s.ownershipValue)),
    },
  ];

  return rows.map((row, i) => ({
    id: `decision-${i}`,
    label: row.label,
    winnerIndex: row.index,
    winnerName: row.name,
  }));
}

function parseChargingWatts(charging: string | undefined): number {
  if (!charging) return 0;
  const match = charging.match(/(\d+)\s*w/i);
  return match ? Number(match[1]) : 0;
}
