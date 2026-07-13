"use client";

import type { HTMLAttributes } from "react";

import { cn } from "@/design-system/utils/cn";

type DeviceNameProps = {
  /** Localized display name from API (falls back to canonical English). */
  name: string;
  brand?: string | null;
  className?: string;
} & Omit<HTMLAttributes<HTMLSpanElement>, "children" | "className" | "translate">;

/**
 * Device display name from the API (already locale-resolved with EN fallback).
 * Marked notranslate so Google Translate does not re-process CMS copy.
 * Chipset / SKU / numerics still use TechnicalText separately.
 */
export function DeviceName({
  name,
  brand: _brand,
  className,
  ...rest
}: DeviceNameProps) {
  void _brand;
  return (
    <span
      className={cn("arena-device-name notranslate", className)}
      translate="no"
      suppressHydrationWarning
      {...rest}
    >
      {name}
    </span>
  );
}
