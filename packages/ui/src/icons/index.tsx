import type { SVGProps } from "react";

/** Original Titan Spectrum logomark — abstract spectrum arc. */
export function TitanLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <rect width="32" height="32" rx="8" fill="#111827" />
      <path
        d="M6 22C10 14 14 10 22 8"
        stroke="url(#titan-arc)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M8 24C12 18 16 14 24 12"
        stroke="#3B82F6"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <circle cx="22" cy="8" r="2.5" fill="#8B5CF6" />
      <defs>
        <linearGradient id="titan-arc" x1="6" y1="22" x2="22" y2="8">
          <stop stopColor="#3B82F6" />
          <stop offset="0.5" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Original smartphone silhouette icon. */
export function SmartphoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <rect
        x="7"
        y="2"
        width="10"
        height="20"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="18" r="1" fill="currentColor" />
      <line
        x1="10"
        y1="5"
        x2="14"
        y2="5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Original spec-sheet grid icon. */
export function SpecGridIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <rect
        x="3"
        y="3"
        width="8"
        height="8"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="13"
        y="3"
        width="8"
        height="8"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="3"
        y="13"
        width="8"
        height="8"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="13"
        y="13"
        width="8"
        height="5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <line
        x1="13"
        y1="21"
        x2="21"
        y2="21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Original compare-scale icon. */
export function CompareScaleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M12 3V21M5 7H19M7 7L5 11M17 7L19 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="4"
        y="13"
        width="6"
        height="5"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="14"
        y="13"
        width="6"
        height="5"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
