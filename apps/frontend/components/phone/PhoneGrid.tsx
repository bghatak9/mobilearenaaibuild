"use client";

import { useCallback, useEffect, useState } from "react";

import { computeArenaScore } from "@/lib/arena-score";
import {
  addWishlistItem,
  getDevices,
  getWishlist,
  removeWishlistItem,
  type Device,
} from "@/lib/api";
import {
  devicePriceInCurrency,
  formatPriceAmount,
} from "@/features/phone-finder/device-utils";
import { highlightParts } from "@/features/phone-finder/search-engine";
import type { PriceCurrency } from "@/features/phone-finder/types";
import { ArenaCard } from "@/design-system/cards/ArenaCard";

export default function PhoneGrid({
  search,
  searchQuery,
  devices: controlled,
  showArenaScore = false,
  priceCurrency,
  wishlistIds: controlledWishlistIds,
  onWishlistChange,
}: {
  search?: string;
  searchQuery?: string;
  devices?: Device[];
  showArenaScore?: boolean;
  priceCurrency?: PriceCurrency;
  wishlistIds?: Set<number>;
  onWishlistChange?: () => void;
}) {
  const [devices, setDevices] = useState<Device[]>(controlled ?? []);
  const [loading, setLoading] = useState(!controlled);
  const [error, setError] = useState<string | null>(null);
  const [localWishlist, setLocalWishlist] = useState<Set<number>>(new Set());
  const [wishlistBusy, setWishlistBusy] = useState<number | null>(null);

  const wishlistIds = controlledWishlistIds ?? localWishlist;

  useEffect(() => {
    if (controlled) {
      setDevices(controlled);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    getDevices(search)
      .then((data) => {
        if (active) setDevices(data);
      })
      .catch(() => {
        if (active) setError("Could not load devices. Is the API running?");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search, controlled]);

  useEffect(() => {
    if (controlledWishlistIds) return;
    getWishlist()
      .then((items) => setLocalWishlist(new Set(items.map((i) => i.device.id))))
      .catch(() => setLocalWishlist(new Set()));
  }, [controlledWishlistIds]);

  const toggleWishlist = useCallback(
    async (deviceId: number) => {
      setWishlistBusy(deviceId);
      try {
        if (wishlistIds.has(deviceId)) {
          await removeWishlistItem(deviceId);
          if (!controlledWishlistIds) {
            setLocalWishlist((prev) => {
              const next = new Set(prev);
              next.delete(deviceId);
              return next;
            });
          }
        } else {
          await addWishlistItem(deviceId, { alertEnabled: true });
          if (!controlledWishlistIds) {
            setLocalWishlist((prev) => new Set(prev).add(deviceId));
          }
        }
        onWishlistChange?.();
      } finally {
        setWishlistBusy(null);
      }
    },
    [wishlistIds, controlledWishlistIds, onWishlistChange],
  );

  if (loading) {
    return <p className="p-4 text-[var(--text-secondary)]">Loading devices…</p>;
  }
  if (error) return <p className="p-4 text-red-400">{error}</p>;
  if (!devices.length) {
    return <p className="p-4 text-[var(--text-secondary)]">No devices found.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {devices.map((device) => {
        const arenaScore = showArenaScore ? computeArenaScore(device) : undefined;
        const communityScore = device.rating
          ? Math.round(device.rating * 10)
          : undefined;
        const affiliatePrice =
          priceCurrency != null
            ? devicePriceInCurrency(device, priceCurrency)
            : null;
        const priceLabel =
          affiliatePrice != null && priceCurrency != null
            ? formatPriceAmount(affiliatePrice, priceCurrency)
            : device.price != null
              ? `$${device.price.toLocaleString()}`
              : undefined;
        const title =
          searchQuery?.trim() ? (
            <>
              {highlightParts(device.name, searchQuery).map((part, i) =>
                part.match ? (
                  <mark
                    key={i}
                    className="rounded bg-[var(--electric-cyan)]/25 text-[var(--electric-cyan)]"
                  >
                    {part.text}
                  </mark>
                ) : (
                  <span key={i}>{part.text}</span>
                ),
              )}
            </>
          ) : (
            device.name
          );
        return (
          <ArenaCard
            key={device.id}
            href={`/phones/${device.slug}`}
            slug={device.slug}
            deviceId={device.id}
            title={title}
            deviceName={device.name}
            subtitle={device.brand?.name}
            chip={device.chipset?.cpu?.split(" ").slice(0, 2).join(" ")}
            specPreview={
              device.display
                ? `${device.display.size}" · ${device.display.refreshRate}Hz · ${device.ramGb ?? "?"}GB`
                : undefined
            }
            price={priceLabel}
            image={device.images?.[0]?.url}
            badge={
              arenaScore != null && arenaScore >= 85
                ? "Arena Elite"
                : device.rating && device.rating >= 8
                  ? "Top Rated"
                  : undefined
            }
            communityScore={communityScore}
            arenaScore={arenaScore}
            inWishlist={wishlistIds.has(device.id)}
            onToggleWishlist={(id) => void toggleWishlist(id)}
            wishlistLoading={wishlistBusy === device.id}
          />
        );
      })}
    </div>
  );
}
