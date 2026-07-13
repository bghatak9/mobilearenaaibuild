/** Accent tokens per intelligence lab section. */
export const INTELLIGENCE_SECTION_ACCENTS: Record<string, string> = {
  general: "--electric-cyan",
  design: "--aurora-purple",
  display: "--electric-cyan",
  performance: "--premium-gold",
  benchmarks: "--premium-gold",
  "camera-rear": "--aurora-purple",
  "camera-front": "--aurora-purple",
  battery: "--emerald-success",
  connectivity: "--electric-cyan",
  network: "--electric-cyan",
  audio: "--orange",
  sensors: "--aurora-purple",
  software: "--electric-cyan",
  ai: "--aurora-purple",
  gaming: "--red",
  repair: "--emerald-success",
  ecosystem: "--electric-cyan",
};

export function accentForIntelligenceSection(sectionId: string): string {
  return INTELLIGENCE_SECTION_ACCENTS[sectionId] ?? "--electric-cyan";
}
