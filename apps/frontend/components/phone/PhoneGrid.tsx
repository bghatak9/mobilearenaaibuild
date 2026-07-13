"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { SwipePageShell } from "@/components/phone/SwipePageShell";
import { ArenaCard } from "@/design-system/cards/ArenaCard";
import {
  devicePriceInCurrency,
  formatPriceAmount,
} from "@/features/phone-finder/device-utils";
import { highlightParts } from "@/features/phone-finder/search-engine";
import type { PriceCurrency } from "@/features/phone-finder/types";
import { useSwipePagination } from "@/hooks/useSwipePagination";
import { computeArenaScore } from "@/lib/arena-score";
import {
  addWishlistItem,
  getDevices,
  getWishlist,
  removeWishlistItem,
  type Device,
} from "@/lib/api";
import { BrandName } from "@/components/brands/BrandName";
import { DeviceName } from "@/components/brands/DeviceName";
import { useLocale, useTranslations } from "next-intl";

export default function PhoneGrid({
  search,
  searchQuery,
  devices: controlled,
  showArenaScore = false,
  priceCurrency,
  wishlistIds: controlledWishlistIds,
  onWishlistChange,
  swipePaginate = true,
  pageSize,
}: {
  search?: string;
  searchQuery?: string;
  devices?: Device[];
  showArenaScore?: boolean;
  priceCurrency?: PriceCurrency;
  wishlistIds?: Set<number>;
  onWishlistChange?: () => void;
  /** Swipe left/right to move between pages of results. */
  swipePaginate?: boolean;
  pageSize?: number;
}) {
  const locale = useLocale();
  const t = useTranslations("phones");
  const [devices, setDevices] = useState<Device[]>(controlled ?? []);
  const [loading, setLoading] = useState(!controlled);
  const [error, setError] = useState<string | null>(null);
  const [localWishlist, setLocalWishlist] = useState<Set<number>>(new Set());
  const [wishlistBusy, setWishlistBusy] = useState<number | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  const {
    page,
    totalPages,
    slice: visibleDevices,
    swipeEnabled,
    goNextPage,
    goPrevPage,
    setPageWithDir,
    slideClassSuffix,
    isPaginated,
  } = useSwipePagination(devices, {
    pageSize,
    disabled: !swipePaginate,
  });

  const wishlistIds = controlledWishlistIds ?? localWishlist;

  useEffect(() => {
    if (!swipeEnabled) return;
    shellRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [page, swipeEnabled]);

  useEffect(() => {
    if (controlled) {
      setDevices(controlled);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    getDevices(search, locale)
      .then((data) => {
        if (active) setDevices(data);
      })
      .catch(() => {
        if (active) setError(t("loadError"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search, controlled, locale, t]);

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
    return (
      <p className="p-4 text-[var(--text-secondary)]">{t("loadingDevices")}</p>
    );
  }
  if (error) return <p className="p-4 text-red-400">{error}</p>;
  if (!devices.length) {
    return (
      <p className="p-4 text-[var(--text-secondary)]">{t("noDevices")}</p>
    );
  }

  const slideClassName = [
    "arena-swipe-page-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3",
    isPaginated ? slideClassSuffix : "",
  ].join(" ");

  return (
    <div ref={shellRef} className="min-w-0">
      <SwipePageShell
        page={page}
        totalPages={totalPages}
        swipeEnabled={swipeEnabled}
        onSwipeLeft={goNextPage}
        onSwipeRight={goPrevPage}
        onPageChange={setPageWithDir}
        slideClassName={slideClassName}
      >
        {visibleDevices.map((device) => {
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
                ? `$${device.price.toLocaleString("en-US")}`
                : undefined;
          const title = searchQuery?.trim() ? (
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
            <DeviceName name={device.name} brand={device.brand?.name} />
          );
          return (
            <ArenaCard
              key={device.id}
              href={`/phones/${device.slug}`}
              slug={device.slug}
              deviceId={device.id}
              title={title}
              deviceName={device.name}
              subtitle={
                device.brand?.name ? (
                  <BrandName name={device.brand.name} />
                ) : undefined
              }
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
                  ? t("arenaElite")
                  : device.rating && device.rating >= 8
                    ? t("topRated")
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
      </SwipePageShell>
    </div>
  );
}
