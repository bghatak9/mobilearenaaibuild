"use client";

import { createPortal } from "react-dom";
import { useEffect } from "react";

import { DeviceArenaBrief } from "@/components/device-brief/DeviceArenaBrief";
import type { PriceCurrency } from "@/features/phone-finder/types";
import { useClientMounted } from "@/hooks/useClientMounted";
import type { Device } from "@/lib/api";

type Props = {
  device: Device | null;
  loading?: boolean;
  open: boolean;
  onClose: () => void;
  currency?: PriceCurrency;
  inCompare?: boolean;
  compareDisabled?: boolean;
  onCompare?: () => void;
};

export function DeviceBriefModal({
  device,
  loading = false,
  open,
  onClose,
  currency = "USD",
  inCompare = false,
  compareDisabled = false,
  onCompare,
}: Props) {
  const mounted = useClientMounted();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="arena-brief-modal"
      role="dialog"
      aria-modal="true"
      aria-busy={loading}
      aria-label={device ? `${device.name} arena brief` : "Loading device brief"}
    >
      <button
        type="button"
        className="arena-brief-modal__backdrop"
        aria-label="Close device brief"
        onClick={onClose}
      />
      <div className="arena-brief-modal__panel">
        {loading || !device ? (
          <div className="arena-brief arena-brief--loading p-8 text-center">
            <div className="arena-brief__loader mx-auto" aria-hidden />
            <p className="mt-4 text-sm font-medium text-[var(--text-secondary)]">
              Loading device intelligence…
            </p>
          </div>
        ) : (
          <DeviceArenaBrief
            device={device}
            currency={currency}
            layout="strip"
            onClose={onClose}
            inCompare={inCompare}
            compareDisabled={compareDisabled}
            onAction={(action) => {
              if (action === "compare") onCompare?.();
              if (
                action === "compare" ||
                action === "intelligence" ||
                action === "discussions" ||
                action === "pricing"
              ) {
                onClose();
              }
            }}
          />
        )}
      </div>
    </div>,
    document.body,
  );
}
