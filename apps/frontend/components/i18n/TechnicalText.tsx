"use client";

import type { HTMLAttributes } from "react";

import { cn } from "@/design-system/utils/cn";

type TechnicalTextProps = {
  value: string | number | null | undefined;
  className?: string;
} & Omit<HTMLAttributes<HTMLSpanElement>, "children" | "className" | "translate">;

/**
 * Spec / unit / OS / chipset copy stays canonical (English / Latin / numerics).
 * Do not locale-map CPU, GPU, SKU, mAh, Hz, etc.
 */
export function TechnicalText({ value, className, ...rest }: TechnicalTextProps) {
  if (value == null || value === "") return null;
  return (
    <span
      className={cn("arena-tech-text notranslate", className)}
      translate="no"
      suppressHydrationWarning
      {...rest}
    >
      {String(value)}
    </span>
  );
}
