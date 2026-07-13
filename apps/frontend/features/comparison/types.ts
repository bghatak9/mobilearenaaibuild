import type { Device } from "@/lib/api";

export type CompareViewMode =
  | "side-by-side"
  | "differences"
  | "winner"
  | "compact"
  | "print";

/** Workspace comparison modes (research-focused). */
export type WorkspaceComparisonMode =
  | "complete"
  | "differences"
  | "technical"
  | "buyer"
  | "compact";

export type WorkspaceInformationDensity =
  | "minimal"
  | "standard"
  | "detailed"
  | "engineering";

export type WorkspaceDisplayOptions = {
  highlightAdvantages: boolean;
  stickyHeaders: boolean;
  syncScrolling: boolean;
  collapseEmptySections: boolean;
  pinImportantSpecs: boolean;
};

export const DEFAULT_WORKSPACE_DISPLAY: WorkspaceDisplayOptions = {
  highlightAdvantages: true,
  stickyHeaders: true,
  syncScrolling: true,
  collapseEmptySections: true,
  pinImportantSpecs: true,
};

export type DeviceIndexScores = {
  batteryExcellence: number;
  performanceIndex: number;
  cameraCapability: number;
  softwareLongevity: number;
  ownershipValue: number;
};

export type WorkspaceAdvantage = {
  deviceIndex: number;
  label: string;
};

export type DecisionMatrixRow = {
  id: string;
  label: string;
  winnerIndex: number;
  winnerName: string;
};

export type CompareLabId =
  | "camera"
  | "performance"
  | "battery"
  | "display"
  | "network"
  | "software"
  | "repairability"
  | "value"
  | "ownership"
  | "gaming"
  | "business"
  | "creator"
  | "student"
  | "senior"
  | "ecosystem"
  | "regional";

export type CompareHubTab =
  | "overview"
  | "camera"
  | "performance"
  | "battery"
  | "display"
  | "network"
  | "software"
  | "repairability"
  | "value"
  | "ownership"
  | "community"
  | "export";

export type WeightCategory =
  | "camera"
  | "battery"
  | "performance"
  | "display"
  | "software";

export type CompareWeights = Record<WeightCategory, number>;

export const DEFAULT_COMPARE_WEIGHTS: CompareWeights = {
  camera: 40,
  battery: 20,
  performance: 20,
  display: 10,
  software: 10,
};

export type CompareSpecRow = {
  id: string;
  /** Message key under specs.categories.* */
  categoryKey: string;
  /** Message key under specs.labels.* */
  labelKey: string;
  /** English fallbacks for SSR/tests when translator unavailable */
  category: string;
  label: string;
  format: (device: Device) => string;
  score?: (device: Device) => number | null;
  higherIsBetter?: boolean;
  labs?: CompareLabId[];
  compact?: boolean;
};

export type CompareAward = {
  id: string;
  label: string;
  emoji: string;
  deviceIndex: number;
  deviceName: string;
};

export type AiCompareInsight = {
  bestOverall: { index: number; name: string; reason: string };
  bestValue: { index: number; name: string; reason: string };
  bestCamera: { index: number; name: string; reason: string };
  bestBattery: { index: number; name: string; reason: string };
  bestGaming: { index: number; name: string; reason: string };
  bestSoftware: { index: number; name: string; reason: string };
  profiles: string[];
  summary: string;
};

export type WeightedRanking = {
  index: number;
  name: string;
  score: number;
};
