/**
 * MobileArena Aurora Glass — official palette
 * @see Brand Identity manifesto
 */
export const colors = {
  arenaBlue: "#2563EB",
  electricCyan: "#06B6D4",
  auroraPurple: "#8B5CF6",
  emeraldSuccess: "#10B981",
  premiumGold: "#F59E0B",
  darkSpace: "#0B1220",
  surfaceCard: "#131D31",
  surfaceElevated: "#1A2740",
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
} as const;

export const cssColorVars = {
  "--arena-blue": colors.arenaBlue,
  "--electric-cyan": colors.electricCyan,
  "--aurora-purple": colors.auroraPurple,
  "--emerald-success": colors.emeraldSuccess,
  "--premium-gold": colors.premiumGold,
  "--dark-space": colors.darkSpace,
  "--surface-card": colors.surfaceCard,
  "--surface-elevated": colors.surfaceElevated,
  "--text-primary": colors.textPrimary,
  "--text-secondary": colors.textSecondary,
} as const;
