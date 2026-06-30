import type { BrandSummary } from "@/lib/api";

export type BrandVisual = {
  accent: string;
  accentSoft: string;
  gradient: string;
  monogram: string;
};

const KNOWN_BRANDS: Record<string, Omit<BrandVisual, "monogram">> = {
  apple: {
    accent: "#f5f5f7",
    accentSoft: "rgb(245 245 247 / 0.12)",
    gradient: "linear-gradient(135deg, #3a3a3c 0%, #f5f5f7 100%)",
  },
  samsung: {
    accent: "#6ea8ff",
    accentSoft: "rgb(110 168 255 / 0.16)",
    gradient: "linear-gradient(135deg, #0b2d7a 0%, #6ea8ff 100%)",
  },
  google: {
    accent: "#8ab4f8",
    accentSoft: "rgb(138 180 248 / 0.16)",
    gradient: "linear-gradient(135deg, #4285f4 0%, #34a853 45%, #fbbc05 75%, #ea4335 100%)",
  },
  oneplus: {
    accent: "#ff6b7d",
    accentSoft: "rgb(255 107 125 / 0.16)",
    gradient: "linear-gradient(135deg, #eb0028 0%, #ff6b7d 100%)",
  },
  xiaomi: {
    accent: "#ff8a3d",
    accentSoft: "rgb(255 138 61 / 0.16)",
    gradient: "linear-gradient(135deg, #ff6900 0%, #ffb347 100%)",
  },
  oppo: {
    accent: "#4ade80",
    accentSoft: "rgb(74 222 128 / 0.16)",
    gradient: "linear-gradient(135deg, #0f6b45 0%, #4ade80 100%)",
  },
  vivo: {
    accent: "#60a5fa",
    accentSoft: "rgb(96 165 250 / 0.16)",
    gradient: "linear-gradient(135deg, #1d4ed8 0%, #60a5fa 100%)",
  },
  realme: {
    accent: "#facc15",
    accentSoft: "rgb(250 204 21 / 0.16)",
    gradient: "linear-gradient(135deg, #ca8a04 0%, #facc15 100%)",
  },
  motorola: {
    accent: "#7dd3fc",
    accentSoft: "rgb(125 211 252 / 0.16)",
    gradient: "linear-gradient(135deg, #0369a1 0%, #7dd3fc 100%)",
  },
  nothing: {
    accent: "#e2e8f0",
    accentSoft: "rgb(226 232 240 / 0.12)",
    gradient: "linear-gradient(135deg, #111827 0%, #e2e8f0 100%)",
  },
  asus: {
    accent: "#f87171",
    accentSoft: "rgb(248 113 113 / 0.16)",
    gradient: "linear-gradient(135deg, #111827 0%, #dc2626 100%)",
  },
  sony: {
    accent: "#cbd5e1",
    accentSoft: "rgb(203 213 225 / 0.12)",
    gradient: "linear-gradient(135deg, #0f172a 0%, #64748b 100%)",
  },
  huawei: {
    accent: "#fb7185",
    accentSoft: "rgb(251 113 133 / 0.16)",
    gradient: "linear-gradient(135deg, #be123c 0%, #fb7185 100%)",
  },
  honor: {
    accent: "#22d3ee",
    accentSoft: "rgb(34 211 238 / 0.16)",
    gradient: "linear-gradient(135deg, #0e7490 0%, #22d3ee 100%)",
  },
  poco: {
    accent: "#fde047",
    accentSoft: "rgb(253 224 71 / 0.16)",
    gradient: "linear-gradient(135deg, #ca8a04 0%, #fde047 100%)",
  },
  nokia: {
    accent: "#38bdf8",
    accentSoft: "rgb(56 189 248 / 0.16)",
    gradient: "linear-gradient(135deg, #0369a1 0%, #38bdf8 100%)",
  },
  redmi: {
    accent: "#f87171",
    accentSoft: "rgb(248 113 113 / 0.16)",
    gradient: "linear-gradient(135deg, #b91c1c 0%, #f87171 100%)",
  },
  iqoo: {
    accent: "#f59e0b",
    accentSoft: "rgb(245 158 11 / 0.16)",
    gradient: "linear-gradient(135deg, #b45309 0%, #fbbf24 100%)",
  },
};

function hashHue(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

function fallbackVisual(slug: string, name: string): BrandVisual {
  const hue = hashHue(slug || name);
  return {
    accent: `hsl(${hue} 78% 68%)`,
    accentSoft: `hsl(${hue} 78% 68% / 0.16)`,
    gradient: `linear-gradient(135deg, hsl(${hue} 70% 42%) 0%, hsl(${(hue + 36) % 360} 82% 62%) 100%)`,
    monogram: (name.trim()[0] ?? "?").toUpperCase(),
  };
}

export function getBrandVisual(brand: Pick<BrandSummary, "name" | "slug">): BrandVisual {
  const key = brand.slug.toLowerCase();
  const known = KNOWN_BRANDS[key];
  const monogram = (brand.name.trim()[0] ?? "?").toUpperCase();
  if (known) {
    return { ...known, monogram };
  }
  return fallbackVisual(key, brand.name);
}

export function displayBrandName(name: string): string {
  const special: Record<string, string> = {
    iphone: "iPhone",
    oppo: "OPPO",
    vivo: "vivo",
    iqoo: "iQOO",
    poco: "POCO",
    redmi: "Redmi",
    oneplus: "OnePlus",
    realme: "realme",
    nothing: "Nothing",
    asus: "ASUS",
    lg: "LG",
    htc: "HTC",
    tcl: "TCL",
  };
  const lower = name.toLowerCase();
  if (special[lower]) return special[lower];
  if (lower === "iphone" || name === "iPhone") return "iPhone";
  return name;
}
