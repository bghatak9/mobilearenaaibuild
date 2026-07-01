import { colors, cssColorVars } from "./colors";

export type ThemeMode = "light" | "dark";

/** Titan Spectrum — dark luxury is the signature Arena experience */
export const themes = {
  dark: {
    background: colors.darkSpace,
    foreground: colors.textPrimary,
    card: colors.surfaceCard,
    muted: colors.textSecondary,
    border: "rgb(237 234 245 / 0.08)",
    brand: colors.titanBlue,
  },
  light: {
    background: "#f4f2f8",
    foreground: "#12101a",
    card: "#ffffff",
    muted: "#5c586c",
    border: "rgb(18 16 26 / 0.1)",
    brand: colors.titanBlue,
  },
} as const;

export const themeCssVars = {
  dark: { ...cssColorVars, ...themes.dark },
  light: { ...cssColorVars, ...themes.light },
} as const;

export const STORAGE_KEY = "ma-theme";
export const DEFAULT_THEME: ThemeMode = "dark";
