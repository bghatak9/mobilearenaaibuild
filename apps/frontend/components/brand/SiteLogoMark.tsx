"use client";

import { useId } from "react";

import { cn } from "@/design-system/utils/cn";

type SiteLogoMarkProps = {
  size?: number;
  className?: string;
};

export function SiteLogoMark({ size = 28, className }: SiteLogoMarkProps) {
  const gradId = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn("arena-site-logo-mark", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="45%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gradId})`} />
      <rect
        x="9.5"
        y="5.5"
        width="13"
        height="21"
        rx="2.75"
        fill="none"
        stroke="#fff"
        strokeWidth="1.35"
        opacity="0.95"
      />
      <path
        d="M12.5 18.5V12h1.6l1.9 3.4 1.9-3.4H19v6.5"
        fill="none"
        stroke="#fff"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="23.25" r="1" fill="#fff" />
    </svg>
  );
}
