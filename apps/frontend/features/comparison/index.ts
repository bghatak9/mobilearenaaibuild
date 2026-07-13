export * from "./types";
export * from "./spec-rows";
export * from "./scoring";
export * from "./community";
export * from "./export";
export * from "./device-indices";
export * from "./workspace-sections";
export * from "./workspace-insights";

export const COMPARE_HUB_LINKS = [
  { href: "/compare", label: "Hub", description: "Comparison Tools home" },
  { href: "/compare/select", label: "Select", description: "Pick 2–6 devices" },
  { href: "/compare/trending", label: "Trending", description: "Popular matchups" },
  { href: "/compare/advanced", label: "Advanced", description: "AI wizard & weights" },
] as const;

export const COMPARE_LAB_LINKS = [
  { id: "camera", label: "Camera Lab", emoji: "📷" },
  { id: "display", label: "Display Science", emoji: "🖥️" },
  { id: "performance", label: "Performance", emoji: "⚡" },
  { id: "gaming", label: "Gaming Mode", emoji: "🎮" },
  { id: "battery", label: "Battery Intel", emoji: "🔋" },
  { id: "network", label: "Connectivity", emoji: "📡" },
  { id: "software", label: "Software Lifecycle", emoji: "🔄" },
  { id: "repairability", label: "Repairability", emoji: "🔧" },
  { id: "value", label: "Price Intelligence", emoji: "💰" },
  { id: "ownership", label: "Ownership Cost", emoji: "📊" },
] as const;
