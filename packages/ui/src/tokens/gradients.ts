export const titanGradients = {
  ocean: "titan-gradient-ocean",
  cosmic: "titan-gradient-cosmic",
  neon: "titan-gradient-neon",
  neonAnimated: "titan-gradient-neon-animated",
} as const;

export type TitanGradient = keyof typeof titanGradients;

/** Gradients reserved for hero sections, buttons, CTAs, and premium badges only. */
export const HERO_GRADIENTS = [
  titanGradients.ocean,
  titanGradients.cosmic,
  titanGradients.neon,
] as const;
