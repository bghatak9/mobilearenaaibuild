import { colors, cssColorVars } from "./colors";

export type ThemeMode = "light" | "dark";

/** Aurora Glass — dark is the signature Arena experience */
export const themes = {
  dark: {
    background: colors.darkSpace,
    foreground: colors.textPrimary,
    card: colors.surfaceCard,
    muted: colors.textSecondary,
    border: "rgb(255 255 255 / 0.08)",
    brand: colors.arenaBlue,
  },
  light: {
    background: "#f1f5f9",
    foreground: "#0f172a",
    card: "#ffffff",
    muted: "#64748b",
    border: "rgb(15 23 42 / 0.08)",
    brand: colors.arenaBlue,
  },
} as const;

export const themeCssVars = {
  dark: { ...cssColorVars, ...themes.dark },
  light: { ...cssColorVars, ...themes.light },
} as const;

export const STORAGE_KEY = "ma-theme";
export const DEFAULT_THEME: ThemeMode = "dark";
