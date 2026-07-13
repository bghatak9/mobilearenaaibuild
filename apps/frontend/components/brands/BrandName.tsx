"use client";

import type { HTMLAttributes } from "react";

import { cn } from "@/design-system/utils/cn";

type BrandNameProps = {
  /** Localized brand label from API (EN fallback). */
  name: string;
  className?: string;
} & Omit<HTMLAttributes<HTMLSpanElement>, "children" | "className" | "translate">;

/**
 * Brand display name from the API (locale-resolved). Protected from GT overlay.
 */
export function BrandName({ name, className, ...rest }: BrandNameProps) {
  return (
    <span
      className={cn("arena-brand-name notranslate", className)}
      translate="no"
      suppressHydrationWarning
      {...rest}
    >
      {name}
    </span>
  );
}
