/** 4px base grid */
export const spacing = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
} as const;

export const radius = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  card: "1.5rem",
  pill: "9999px",
} as const;

export const spaceVars = {
  "--space-1": spacing[1],
  "--space-2": spacing[2],
  "--space-3": spacing[3],
  "--space-4": spacing[4],
  "--space-6": spacing[6],
  "--space-8": spacing[8],
} as const;
