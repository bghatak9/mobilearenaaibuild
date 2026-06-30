"use client";

import Link from "next/link";
import { Eye, Heart, Scale, Star } from "lucide-react";

import {
  devicePriceInCurrency,
  formatPriceAmount,
} from "@/features/phone-finder/device-utils";
import type { PriceCurrency } from "@/features/phone-finder/types";
import { Modal } from "@/design-system/modals/Modal";
import { Button } from "@/design-system/buttons/Button";
import type { Device } from "@/lib/api";
import { computeArenaScore } from "@/lib/arena-score";
import { cn } from "@/design-system/utils/cn";

export function DeviceQuickViewModal({
  device,
  currency,
  open,
  onClose,
  inWishlist,
  wishlistBusy,
  inCompare,
  compareDisabled,
  onWishlist,
  onCompare,
}: {
  device: Device | null;
  currency: PriceCurrency;
  open: boolean;
  onClose: () => void;
  inWishlist: boolean;
  wishlistBusy?: boolean;
  inCompare?: boolean;
  compareDisabled?: boolean;
  onWishlist: () => void;
  onCompare: () => void;
}) {
  if (!device) return null;

  const price = devicePriceInCurrency(device, currency);
  const priceLabel = price != null ? formatPriceAmount(price, currency) : "Price TBA";
  const arenaScore = computeArenaScore(device);
  const image = device.images?.[0]?.url;

  return (
    <Modal open={open} onClose={onClose} title={device.name} size="lg">
      <div className="space-y-4">
        {image ? (
          <div className="flex justify-center rounded-xl bg-white/5 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={device.name}
              className="max-h-48 object-contain"
            />
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-xl bg-white/5 text-4xl">
            📱
          </div>
        )}

        <div className="grid gap-2 text-sm text-[var(--text-secondary)] sm:grid-cols-2">
          <p>
            <span className="font-semibold text-[var(--text-primary)]">Brand:</span>{" "}
            {device.brand?.name ?? "—"}
          </p>
          <p>
            <span className="font-semibold text-[var(--text-primary)]">Chipset:</span>{" "}
            {device.chipset?.cpu ?? "—"}
          </p>
          <p>
            <span className="font-semibold text-[var(--text-primary)]">RAM / Storage:</span>{" "}
            {device.ramGb ?? "?"}GB / {device.storageGb ?? "?"}GB
          </p>
          <p>
            <span className="font-semibold text-[var(--text-primary)]">Display:</span>{" "}
            {device.display
              ? `${device.display.size}" ${device.display.type} ${device.display.refreshRate}Hz`
              : "—"}
          </p>
          <p>
            <span className="font-semibold text-[var(--text-primary)]">Battery:</span>{" "}
            {device.battery?.capacity ? `${device.battery.capacity} mAh` : "—"}
          </p>
          <p>
            <span className="font-semibold text-[var(--text-primary)]">Price:</span>{" "}
            <span className="font-bold text-[var(--electric-cyan)]">{priceLabel}</span>
          </p>
        </div>

        <p className="inline-flex items-center gap-1.5 rounded-full border border-[var(--premium-gold)]/30 bg-[var(--premium-gold)]/10 px-3 py-1 text-sm font-semibold text-[var(--premium-gold)]">
          <Star size={14} className="fill-[var(--premium-gold)]" />
          Arena Score: {arenaScore}
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            disabled={wishlistBusy}
            onClick={onWishlist}
            className={cn(inWishlist && "text-[var(--rose-alert)]")}
          >
            <Heart size={16} className={inWishlist ? "fill-current" : ""} />
            {inWishlist ? "In wishlist" : "Wishlist"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={compareDisabled}
            onClick={onCompare}
            className={cn(inCompare && "text-[var(--electric-cyan)]")}
          >
            <Scale size={16} />
            {inCompare ? "In compare" : "Compare"}
          </Button>
          <Link href={`/phones/${device.slug}`} onClick={onClose}>
            <Button type="button">
              <Eye size={16} />
              Full details
            </Button>
          </Link>
        </div>
      </div>
    </Modal>
  );
}
