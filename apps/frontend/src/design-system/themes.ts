import { colors, cssColorVars } from "./colors";

/** Titan Spectrum v1.0 — dark luxury only */
export type ThemeMode = "dark";

export const themes = {
  dark: {
    background: colors.bgPrimary,
    foreground: colors.textPrimary,
    card: colors.surface1,
    muted: colors.textSecondary,
    border: "rgb(255 255 255 / 0.08)",
    brand: colors.blue,
  },
} as const;

export const themeCssVars = {
  dark: { ...cssColorVars, ...themes.dark },
} as const;

export const STORAGE_KEY = "ma-theme";
export const DEFAULT_THEME: ThemeMode = "dark";
