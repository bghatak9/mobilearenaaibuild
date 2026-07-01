/**
 * Titan Spectrum — official palette
 */
export const colors = {
  titanVoid: "#0D0C12",
  titanSurface: "#16141F",
  titanElevated: "#1E1C2A",
  titanBlue: "#5B8AFF",
  titanPurple: "#A67BFF",
  titanCyan: "#3DD9C8",
  titanGreen: "#4ADE80",
  titanOrange: "#FFA04D",
  titanPink: "#FF7EB3",
  textPrimary: "#EDEAF5",
  textSecondary: "#9B97AD",
  /** @deprecated use titanBlue */
  arenaBlue: "#5B8AFF",
  /** @deprecated use titanCyan */
  electricCyan: "#3DD9C8",
  /** @deprecated use titanPurple */
  auroraPurple: "#A67BFF",
  emeraldSuccess: "#4ADE80",
  premiumGold: "#FFA04D",
  darkSpace: "#0D0C12",
  surfaceCard: "#16141F",
  surfaceElevated: "#1E1C2A",
} as const;

export const cssColorVars = {
  "--titan-void": colors.titanVoid,
  "--titan-surface": colors.titanSurface,
  "--titan-blue": colors.titanBlue,
  "--titan-purple": colors.titanPurple,
  "--titan-cyan": colors.titanCyan,
  "--titan-green": colors.titanGreen,
  "--titan-orange": colors.titanOrange,
  "--titan-pink": colors.titanPink,
  "--arena-blue": colors.titanBlue,
  "--electric-cyan": colors.titanCyan,
  "--aurora-purple": colors.titanPurple,
  "--emerald-success": colors.titanGreen,
  "--premium-gold": colors.titanOrange,
  "--dark-space": colors.titanVoid,
  "--surface-card": colors.titanSurface,
  "--surface-elevated": colors.titanElevated,
  "--text-primary": colors.textPrimary,
  "--text-secondary": colors.textSecondary,
} as const;
