import type { Device } from "@/lib/api";

import { rowWinnerIndices } from "./spec-rows";
import { COMPARE_SPEC_ROWS } from "./spec-rows";
import type {
  AiCompareInsight,
  CompareAward,
  CompareWeights,
  WeightedRanking,
} from "./types";

function mainCameraMp(device: Device): number | null {
  if (!device.cameras?.length) return null;
  return Math.max(...device.cameras.map((c) => c.megapixel));
}

function categoryScore(
  devices: Device[],
  scores: (number | null)[],
): number[] {
  const max = Math.max(...scores.filter((v): v is number => v != null), 1);
  return scores.map((v) => (v != null ? Math.round((v / max) * 100) : 0));
}

export function computeWeightedRankings(
  devices: Device[],
  weights: CompareWeights,
): WeightedRanking[] {
  const cameraScores = categoryScore(
    devices,
    devices.map((d) => mainCameraMp(d)),
  );
  const batteryScores = categoryScore(
    devices,
    devices.map((d) => d.battery?.capacity ?? null),
  );
  const performanceScores = categoryScore(
    devices,
    devices.map((d) => d.chipset?.benchmark ?? d.ramGb ?? null),
  );
  const displayScores = categoryScore(
    devices,
    devices.map(
      (d) =>
        (d.display?.brightness ?? 0) * 0.6 + (d.display?.refreshRate ?? 0) * 0.4,
    ),
  );
  const softwareScores = categoryScore(
    devices,
    devices.map((d) => (d.rating != null ? d.rating * 10 : null)),
  );

  const totalWeight =
    weights.camera +
    weights.battery +
    weights.performance +
    weights.display +
    weights.software;

  return devices
    .map((device, index) => {
      const score = Math.round(
        (cameraScores[index] * weights.camera +
          batteryScores[index] * weights.battery +
          performanceScores[index] * weights.performance +
          displayScores[index] * weights.display +
          softwareScores[index] * weights.software) /
          Math.max(totalWeight, 1),
      );
      return { index, name: device.name, score };
    })
    .sort((a, b) => b.score - a.score);
}

export function buildAiInsights(devices: Device[]): AiCompareInsight {
  const rankings = computeWeightedRankings(devices, {
    camera: 25,
    battery: 20,
    performance: 25,
    display: 15,
    software: 15,
  });

  const valueRankings = devices
    .map((d, index) => ({
      index,
      name: d.name,
      value:
        d.price != null && d.chipset?.benchmark
          ? d.chipset.benchmark / d.price
          : d.rating ?? 0,
    }))
    .sort((a, b) => b.value - a.value);

  const cameraWinners = rowWinnerIndices(
    COMPARE_SPEC_ROWS.find((r) => r.id === "main-camera")!,
    devices,
  );
  const batteryWinners = rowWinnerIndices(
    COMPARE_SPEC_ROWS.find((r) => r.id === "battery-capacity")!,
    devices,
  );
  const perfWinners = rowWinnerIndices(
    COMPARE_SPEC_ROWS.find((r) => r.id === "benchmark")!,
    devices,
  );

  const bestOverall = rankings[0];
  const bestValue = valueRankings[0];
  const bestCamera = devices[cameraWinners[0] ?? rankings[0].index];
  const bestBattery = devices[batteryWinners[0] ?? rankings[0].index];
  const bestGaming = devices[perfWinners[0] ?? rankings[0].index];
  const bestSoftware = [...devices].sort(
    (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
  )[0];

  const profiles: string[] = [];
  if (cameraWinners.length) profiles.push("photographers");
  if (perfWinners.length) profiles.push("mobile gamers");
  if (bestValue.index === valueRankings[0].index) profiles.push("budget-conscious buyers");
  if ((bestBattery.battery?.capacity ?? 0) >= 5000) profiles.push("power users");
  if ((bestSoftware.rating ?? 0) >= 8) profiles.push("content creators");
  profiles.push("business users", "students");

  const uniqueProfiles = [...new Set(profiles)];

  return {
    bestOverall: {
      index: bestOverall.index,
      name: bestOverall.name,
      reason: `Highest weighted Arena score (${bestOverall.score}/100) across camera, battery, performance, display, and software.`,
    },
    bestValue: {
      index: bestValue.index,
      name: bestValue.name,
      reason: "Best balance of performance specs and price in this lineup.",
    },
    bestCamera: {
      index: devices.indexOf(bestCamera),
      name: bestCamera.name,
      reason: `Leads on megapixels (${mainCameraMp(bestCamera) ?? "—"} MP) and lens hardware.`,
    },
    bestBattery: {
      index: devices.indexOf(bestBattery),
      name: bestBattery.name,
      reason: `Largest battery pack at ${bestBattery.battery?.capacity ?? "—"} mAh.`,
    },
    bestGaming: {
      index: devices.indexOf(bestGaming),
      name: bestGaming.name,
      reason: `Top benchmark and performance metrics for sustained gaming loads.`,
    },
    bestSoftware: {
      index: devices.indexOf(bestSoftware),
      name: bestSoftware.name,
      reason: `Strongest community software experience rating (${bestSoftware.rating?.toFixed(1) ?? "—"}/10).`,
    },
    profiles: uniqueProfiles,
    summary: `Recommended for ${uniqueProfiles.slice(0, 6).join(", ")}.`,
  };
}

export function buildLabAwards(
  lab: string,
  devices: Device[],
): CompareAward[] {
  const awards: CompareAward[] = [];

  const addAward = (
    id: string,
    label: string,
    emoji: string,
    rowId: string,
  ) => {
    const row = COMPARE_SPEC_ROWS.find((r) => r.id === rowId);
    if (!row) return;
    const winners = rowWinnerIndices(row, devices);
    if (!winners.length) return;
    const index = winners[0];
    awards.push({
      id,
      label,
      emoji,
      deviceIndex: index,
      deviceName: devices[index]?.name ?? "",
    });
  };

  if (lab === "camera") {
    addAward("zoom", "Best Zoom", "🏆", "optical-zoom");
    addAward("camera", "Best Portraits", "🏆", "main-camera");
    addAward("night", "Best Night Photography", "🏆", "aperture");
    addAward("video", "Best Video Creator Phone", "🏆", "main-camera");
  } else if (lab === "display") {
    addAward("outdoor", "Best Outdoor Display", "🏆", "brightness");
    addAward("refresh", "Best Eye Comfort", "🏆", "refresh-rate");
    addAward("color", "Best Color Accuracy", "🏆", "display-resolution");
    addAward("hdr", "Best HDR Experience", "🏆", "brightness");
  } else if (lab === "software") {
    addAward("support", "Longest Support", "🏆", "rating");
    addAward("dev", "Best Developer Device", "🏆", "os");
    addAward("clean", "Cleanest Experience", "🏆", "rating");
  } else if (lab === "ecosystem") {
    addAward("eco", "Best Ecosystem", "🏆", "nfc");
    addAward("prod", "Best Productivity Experience", "🏆", "nfc");
  }

  return awards;
}

export function estimateOwnershipCost(device: Device): {
  insurance: number;
  battery: number;
  screen: number;
  accessories: number;
  total3Year: number;
} {
  const base = device.price ?? 50000;
  const insurance = Math.round(base * 0.05);
  const battery = Math.round(base * 0.03);
  const screen = Math.round(base * 0.1);
  const accessories = Math.round(base * 0.06);
  return {
    insurance,
    battery,
    screen,
    accessories,
    total3Year: base + (insurance + battery + screen + accessories) * 3,
  };
}

export function priceTimeline(device: Device): { label: string; price: string }[] {
  const launch = device.price;
  if (launch == null) return [];
  const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
  return [
    { label: "Launch", price: fmt(launch) },
    { label: "6 Months", price: fmt(launch * 0.89) },
    { label: "12 Months", price: fmt(launch * 0.78) },
  ];
}
