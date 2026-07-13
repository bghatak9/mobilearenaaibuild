"use client";

import { Eye, Heart, Scale, Star } from "lucide-react";

import {
  devicePriceInCurrency,
  formatPriceAmount,
} from "@/features/phone-finder/device-utils";
import type { PriceCurrency } from "@/features/phone-finder/types";
import type { Device } from "@/lib/api";
import { computeArenaScore } from "@/lib/arena-score";
import { cn } from "@/design-system/utils/cn";
import { BrandName } from "@/components/brands/BrandName";
import { DeviceName } from "@/components/brands/DeviceName";

function chipsetLabel(device: Device): string {
  const cpu = device.chipset?.cpu?.trim();
  if (!cpu) return "—";
  if (cpu.length <= 32) return cpu;
  return `${cpu.slice(0, 32)}…`;
}

function specLine(device: Device): string {
  const parts: string[] = [];
  if (device.ramGb != null) parts.push(`${device.ramGb}GB`);
  if (device.storageGb != null) parts.push(`${device.storageGb}GB`);
  parts.push(device.fiveG ? "5G" : "4G");
  return parts.join(" • ");
}

export function SearchResultCard({
  device,
  currency,
  active = false,
  inWishlist,
  wishlistBusy = false,
  inCompare = false,
  compareDisabled = false,
  onOpen,
  onWishlist,
  onCompare,
  onQuickView,
  onMouseEnter,
}: {
  device: Device;
  currency: PriceCurrency;
  active?: boolean;
  inWishlist: boolean;
  wishlistBusy?: boolean;
  inCompare?: boolean;
  compareDisabled?: boolean;
  onOpen: () => void;
  onWishlist: () => void;
  onCompare: () => void;
  onQuickView: () => void;
  onMouseEnter?: () => void;
}) {
  const price = devicePriceInCurrency(device, currency);
  const priceLabel = price != null ? formatPriceAmount(price, currency) : "Price TBA";
  const arenaScore = computeArenaScore(device);

  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-[var(--surface-card)]/80 p-3 transition",
        active ? "border-[var(--arena-blue)]/40 bg-[var(--arena-blue)]/10" : "hover:bg-white/5",
      )}
      onMouseEnter={onMouseEnter}
    >
      <button
        type="button"
        className="flex w-full items-start gap-3 text-left"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onOpen}
      >
        <span className="mt-0.5 shrink-0 text-lg" aria-hidden>
          📱
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-[var(--text-primary)]">
            <DeviceName name={device.name} brand={device.brand?.name} />
          </span>
          <span className="block truncate text-xs text-[var(--text-secondary)]">
            {device.brand?.name ? (
              <BrandName name={device.brand.name} />
            ) : (
              "Unknown brand"
            )}
          </span>
          <span className="mt-1 block truncate text-xs text-[var(--text-secondary)]">
            {chipsetLabel(device)}
          </span>
          <span className="mt-0.5 block text-xs text-[var(--text-secondary)]">
            {specLine(device)}
          </span>
          <span className="mt-1 block text-sm font-bold text-[var(--electric-cyan)]">
            {priceLabel}
          </span>
          <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[var(--premium-gold)]">
            <Star size={12} className="fill-[var(--premium-gold)]" />
            Arena Score: {arenaScore}
          </span>
        </span>
      </button>

      <div className="mt-2 flex items-center gap-1 border-t border-white/5 pt-2">
        <button
          type="button"
          title="Wishlist"
          disabled={wishlistBusy}
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.stopPropagation();
            onWishlist();
          }}
          className={cn(
            "flex min-h-[36px] flex-1 items-center justify-center gap-1 rounded-lg border border-white/10 text-xs font-medium transition",
            inWishlist
              ? "text-[var(--rose-alert)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
          )}
        >
          <Heart size={14} className={inWishlist ? "fill-current" : ""} />
          Wishlist
        </button>
        <button
          type="button"
          title="Compare"
          disabled={compareDisabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.stopPropagation();
            onCompare();
          }}
          className={cn(
            "flex min-h-[36px] flex-1 items-center justify-center gap-1 rounded-lg border border-white/10 text-xs font-medium transition",
            inCompare
              ? "text-[var(--electric-cyan)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
          )}
        >
          <Scale size={14} />
          Compare
        </button>
        <button
          type="button"
          title="Quick view"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.stopPropagation();
            onQuickView();
          }}
          className="flex min-h-[36px] flex-1 items-center justify-center gap-1 rounded-lg border border-white/10 text-xs font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
        >
          <Eye size={14} />
          Quick view
        </button>
      </div>
    </div>
  );
}
