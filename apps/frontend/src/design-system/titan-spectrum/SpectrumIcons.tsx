import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Original Titan Spectrum icon set — geometric, non-brand silhouettes */

export function SpectrumChipIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...base} {...props}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M9 9h6v6H9z" />
      <path d="M12 4v3M12 17v3M4 12h3M17 12h3" />
    </svg>
  );
}

export function SpectrumCompareIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...base} {...props}>
      <rect x="3" y="5" width="7" height="14" rx="2" />
      <rect x="14" y="5" width="7" height="14" rx="2" />
      <path d="M10.5 12h3M12 10.5v3" />
    </svg>
  );
}

export function SpectrumSignalIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...base} {...props}>
      <path d="M5 17v-2M9 17V11M13 17V8M17 17V5" />
      <circle cx="12" cy="19" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SpectrumLensIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...base} {...props}>
      <circle cx="12" cy="12" r="6.5" />
      <circle cx="12" cy="12" r="2.25" />
      <path d="M17.5 6.5L20 4" />
    </svg>
  );
}

export function SpectrumBatteryIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...base} {...props}>
      <rect x="3" y="7" width="16" height="10" rx="2" />
      <path d="M21 10v4" />
      <path d="M7 10h8" />
    </svg>
  );
}

export function SpectrumGridIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...base} {...props}>
      <rect x="4" y="4" width="6" height="6" rx="1.5" />
      <rect x="14" y="4" width="6" height="6" rx="1.5" />
      <rect x="4" y="14" width="6" height="6" rx="1.5" />
      <rect x="14" y="14" width="6" height="6" rx="1.5" />
    </svg>
  );
}
