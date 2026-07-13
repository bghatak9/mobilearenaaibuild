import type { Device } from "@/lib/api";

/** Nested extended specs — merged from API `device.intelligence` JSON. */
export type DeviceIntelligencePayload = Record<string, unknown>;

export type IntelligenceTier = "core" | "standard" | "extended" | "engineering";

export type IntelligenceContext = {
  device: Device;
  payload: DeviceIntelligencePayload;
};

export type IntelligenceFieldDef = {
  id: string;
  label: string;
  tier: IntelligenceTier;
  resolve: (ctx: IntelligenceContext) => string | null | undefined;
  score?: (ctx: IntelligenceContext) => number | null;
  higherIsBetter?: boolean;
};

export type IntelligenceSectionDef = {
  id: string;
  title: string;
  fields: IntelligenceFieldDef[];
};

export type ResolvedIntelligenceField = {
  id: string;
  label: string;
  values: string[];
  winnerIndices: number[];
};

export type ResolvedIntelligenceSection = {
  id: string;
  title: string;
  fields: ResolvedIntelligenceField[];
};

export type CommunityInsights = {
  ownerSatisfaction: string;
  mostPraised: string[];
  improvements: string[];
  polls: { label: string; value: string }[];
  discussionTopics: string[];
};
