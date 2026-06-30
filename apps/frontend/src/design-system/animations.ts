/** Motion language — fast, meaningful (150–250ms). Respects reduced-motion in CSS. */
export const animations = {
  duration: {
    fast: 150,
    base: 200,
    slow: 250,
  },
  easing: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
  },
} as const;

/** Tailwind-friendly duration class names */
export const motionClasses = {
  fast: "duration-150",
  base: "duration-200",
  slow: "duration-250",
  ease: "ease-out",
} as const;
