/** Elevation — subtle depth for cards and modals */
export const shadows = {
  none: "none",
  sm: "0 1px 2px rgb(0 0 0 / 0.06)",
  md: "0 4px 12px rgb(0 0 0 / 0.08)",
  lg: "0 8px 24px rgb(0 0 0 / 0.12)",
  xl: "0 16px 40px rgb(0 0 0 / 0.16)",
  header: "0 1px 0 rgb(0 0 0 / 0.08)",
} as const;

export const shadowClasses = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
} as const;
