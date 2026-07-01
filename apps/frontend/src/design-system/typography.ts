/** Titan Spectrum typography scale */
export const typography = {
  display: {
    size: "2.25rem",
    lineHeight: "1.1",
    weight: "700",
    tracking: "-0.03em",
  },
  h1: { size: "1.875rem", lineHeight: "1.2", weight: "700" },
  h2: { size: "1.5rem", lineHeight: "1.25", weight: "700" },
  h3: { size: "1.25rem", lineHeight: "1.3", weight: "600" },
  h4: { size: "1.125rem", lineHeight: "1.35", weight: "600" },
  body: { size: "1rem", lineHeight: "1.6", weight: "400" },
  bodySm: { size: "0.875rem", lineHeight: "1.5", weight: "400" },
  caption: { size: "0.75rem", lineHeight: "1.4", weight: "500" },
  overline: {
    size: "0.625rem",
    lineHeight: "1.2",
    weight: "700",
    tracking: "0.08em",
  },
  spec: { size: "0.875rem", lineHeight: "1.45", weight: "400" },
} as const;

export const fontFamily = {
  sans: "var(--font-inter), system-ui, sans-serif",
  display: "var(--font-space-grotesk), var(--font-inter), system-ui, sans-serif",
  mono: "var(--font-jetbrains-mono), ui-monospace, monospace",
} as const;

export const typographyClasses = {
  display: "titan-display text-4xl font-bold tracking-tight",
  h1: "titan-display text-3xl font-bold",
  h2: "titan-display text-2xl font-bold",
  h3: "titan-display text-xl font-semibold",
  body: "titan-body text-base",
  bodySm: "titan-body text-sm",
  caption: "titan-body text-xs font-medium",
  overline: "titan-body text-[10px] font-bold uppercase tracking-widest",
  spec: "titan-mono text-sm",
} as const;
