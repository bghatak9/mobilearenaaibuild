"use client";

import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import { SpotlightBriefCard } from "@/components/home/arena/SpotlightBriefCard";
import {
  HOME_SPOTLIGHT_LIMIT,
  type HomeSpotlightData,
} from "@/lib/home-spotlight";
import { useSiteLanguage } from "@/lib/site-language";

type HomeSpotlightGridProps = {
  data: HomeSpotlightData;
};

function formatPrice(price: number | null | undefined): string | null {
  if (price == null) return null;
  return `$${price.toLocaleString()}`;
}

export function HomeSpotlightGrid({ data }: HomeSpotlightGridProps) {
  const { t } = useSiteLanguage();
  const slots = data.slots.slice(0, HOME_SPOTLIGHT_LIMIT);

  return (
    <section
      aria-label={t("home.featuredDevices")}
      className="arena-home-section w-full min-w-0 overflow-x-clip"
    >
      <header className="mb-4 lg:mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--electric-cyan)]">
          {t("home.arenaPicks")}
        </p>
        <h2 className="mt-1 text-xl font-extrabold tracking-tight text-[var(--text-primary)] md:text-2xl">
          {t("home.featuredDevices")}
        </h2>
      </header>
      {slots.length > 0 ? (
        <div className="grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {slots.map((slot) => {
            const price = formatPrice(slot.device.price);
            return (
              <SpotlightBriefCard key={slot.key} slot={slot} price={price} />
            );
          })}
        </div>
      ) : (
        <SpectrumPanel variant="accent" className="p-10 text-center text-[var(--text-secondary)]">
          {t("home.noFeatured")}
        </SpectrumPanel>
      )}
    </section>
  );
}
