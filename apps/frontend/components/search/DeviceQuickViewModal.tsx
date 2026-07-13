"use client";

import { DeviceBriefModal } from "@/components/device-brief/DeviceBriefModal";
import type { PriceCurrency } from "@/features/phone-finder/types";
import type { Device } from "@/lib/api";

/** Search palette quick view — powered by the Arena Brief card. */
export function DeviceQuickViewModal({
  device,
  currency,
  open,
  onClose,
  inWishlist: _inWishlist,
  wishlistBusy: _wishlistBusy,
  inCompare,
  compareDisabled,
  onWishlist: _onWishlist,
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
  return (
    <DeviceBriefModal
      device={device}
      open={open}
      onClose={onClose}
      currency={currency}
      inCompare={inCompare}
      compareDisabled={compareDisabled}
      onCompare={onCompare}
    />
  );
}
