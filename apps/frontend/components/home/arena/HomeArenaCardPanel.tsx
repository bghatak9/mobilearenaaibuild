"use client";

import { useMemo } from "react";
import { ChevronDown } from "lucide-react";

import { ArenaCard } from "@/design-system/cards/ArenaCard";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import { cn } from "@/design-system/utils/cn";
import { BrandName } from "@/components/brands/BrandName";
import { DeviceName } from "@/components/brands/DeviceName";
import type { Device } from "@/lib/api";
import { useSiteLanguage } from "@/lib/site-language";

export const HOME_ARENA_CARD_PAGE_SIZE = 6;

export type HomeArenaCardPanelProps = {
  devices: Device[];
  emptyMessage?: string;
  regionLabel: string;
  pageLabelPrefix: string;
  getBadge?: (device: Device, index: number) => string | undefined;
  getChip?: (device: Device) => string | undefined;
  getSpecPreview?: (device: Device) => string | undefined;
};

function chunkDevices<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}

export function HomeArenaCardPanel({
  devices,
  emptyMessage = "Devices appear here as the catalog grows.",
  regionLabel,
  pageLabelPrefix,
  getBadge,
  getChip,
  getSpecPreview,
}: HomeArenaCardPanelProps) {
  const { t } = useSiteLanguage();
  const pages = useMemo(
    () => chunkDevices(devices, HOME_ARENA_CARD_PAGE_SIZE),
    [devices],
  );

  if (!devices.length) {
    return (
      <SpectrumPanel variant="accent" className="p-10 text-center text-[var(--text-secondary)]">
        {emptyMessage}
      </SpectrumPanel>
    );
  }

  return (
    <div className="arena-home-device-stack w-full min-w-0" role="region" aria-label={regionLabel}>
      {pages.map((page, pageIndex) => (
        <section
          key={pageIndex}
          className={cn(
            "arena-home-device-page",
            pageIndex > 0 && "arena-home-device-page--split",
          )}
          aria-label={`${pageLabelPrefix} page ${pageIndex + 1} of ${pages.length}`}
        >
          <div className="arena-home-device-grid">
            {page.map((device, indexInPage) => {
              const index = pageIndex * HOME_ARENA_CARD_PAGE_SIZE + indexInPage;
              return (
                <div key={device.id} className="arena-home-device-grid-item">
                  <ArenaCard
                    href={`/phones/${device.slug}`}
                    slug={device.slug}
                    deviceId={device.id}
                    title={<DeviceName name={device.name} brand={device.brand?.name} />}
                    subtitle={
                      device.brand?.name ? (
                        <BrandName name={device.brand.name} />
                      ) : undefined
                    }
                    chip={getChip?.(device)}
                    specPreview={getSpecPreview?.(device)}
                    price={
                      device.price != null ? `$${device.price.toLocaleString()}` : undefined
                    }
                    image={device.images?.[0]?.url}
                    badge={getBadge?.(device, index)}
                    communityScore={
                      device.rating ? Math.round(device.rating * 10) : undefined
                    }
                    dense
                  />
                </div>
              );
            })}
          </div>
        </section>
      ))}
      {pages.length > 1 ? (
        <p className="arena-home-device-panel-hint flex items-center justify-center gap-1 text-xs font-medium text-[var(--text-secondary)]">
          {t("home.scrollMore")}
          <ChevronDown size={14} className="text-[var(--electric-cyan)]" aria-hidden />
        </p>
      ) : null}
    </div>
  );
}
