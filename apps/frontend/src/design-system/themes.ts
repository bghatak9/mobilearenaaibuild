import { colors, cssColorVars } from "./colors";

/** Titan Spectrum v1.0 */
export type ThemeMode = "light" | "dark";

export const themes = {
  dark: {
    background: colors.bgPrimary,
    foreground: colors.textPrimary,
    card: colors.surface1,
    muted: colors.textSecondary,
    border: "rgb(255 255 255 / 0.08)",
    brand: colors.blue,
  },
  light: {
    background: "#F4F6FA",
    foreground: "#0F172A",
    card: "#FFFFFF",
    muted: "#475569",
    border: "rgb(15 23 42 / 0.1)",
    brand: colors.blue,
  },
} as const;

export const themeCssVars = {
  dark: { ...cssColorVars, ...themes.dark },
  light: { ...cssColorVars, ...themes.light },
} as const;

export const STORAGE_KEY = "ma-theme";
/** Cookie mirror of STORAGE_KEY so SSR can paint the correct theme (no FOUC script). */
export const THEME_COOKIE = "ma-theme";
export const DEFAULT_THEME: ThemeMode = "dark";

