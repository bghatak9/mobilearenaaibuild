/** Typography scale — matches current MobileArena pages */
export const typography = {
  display: {
    size: "2.25rem",
    lineHeight: "1.1",
    weight: "800",
    tracking: "-0.02em",
  },
  h1: { size: "1.875rem", lineHeight: "1.2", weight: "800" },
  h2: { size: "1.5rem", lineHeight: "1.25", weight: "700" },
  h3: { size: "1.25rem", lineHeight: "1.3", weight: "700" },
  h4: { size: "1.125rem", lineHeight: "1.35", weight: "600" },
  body: { size: "1rem", lineHeight: "1.6", weight: "400" },
  bodySm: { size: "0.875rem", lineHeight: "1.5", weight: "400" },
  caption: { size: "0.75rem", lineHeight: "1.4", weight: "500" },
  overline: {
    size: "0.625rem",
    lineHeight: "1.2",
    weight: "700",
    tracking: "0.1em",
  },
} as const;

export const fontFamily = {
  sans: "var(--font-geist-sans), system-ui, sans-serif",
  mono: "var(--font-geist-mono), ui-monospace, monospace",
} as const;

export const typographyClasses = {
  display: "text-4xl font-extrabold tracking-tight",
  h1: "text-3xl font-extrabold",
  h2: "text-2xl font-bold",
  h3: "text-xl font-bold",
  body: "text-base",
  bodySm: "text-sm",
  caption: "text-xs font-medium",
  overline: "text-[10px] font-bold uppercase tracking-widest",
} as const;
