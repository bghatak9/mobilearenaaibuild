import Link from "next/link";
import {
  CalendarClock,
  Crown,
  Heart,
  Search,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import {
  HOME_SPOTLIGHT_LIMIT,
  type HomeSpotlightData,
  type SpotlightSlotData,
} from "@/lib/home-spotlight";

type HomeSpotlightGridProps = {
  data: HomeSpotlightData;
};

const SLOT_ICONS: Record<string, LucideIcon> = {
  searched: Search,
  reviews: Star,
  loved: Heart,
  rated: Crown,
  upcoming: CalendarClock,
  trending: Zap,
};

function slotIcon(slot: SpotlightSlotData): LucideIcon {
  const prefix = slot.key.split("-")[0] ?? "";
  return SLOT_ICONS[prefix] ?? Sparkles;
}

function formatPrice(price: number | null | undefined): string | null {
  if (price == null) return null;
  return `$${price.toLocaleString()}`;
}

export function HomeSpotlightGrid({ data }: HomeSpotlightGridProps) {
  const slots = data.slots.slice(0, HOME_SPOTLIGHT_LIMIT);

  return (
    <section
      aria-label="Featured devices"
      className="arena-home-section w-full min-w-0 overflow-x-clip"
    >
      <header className="mb-4 lg:mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--electric-cyan)]">
          Arena picks
        </p>
        <h2 className="mt-1 text-xl font-extrabold tracking-tight text-[var(--text-primary)] md:text-2xl">
          Featured devices
        </h2>
      </header>
      {slots.length > 0 ? (
        <div className="grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {slots.map((slot) => {
            const Icon = slotIcon(slot);
            const device = slot.device;
            const price = formatPrice(device.price);

            return (
              <Link
                key={slot.key}
                href={`/phones/${device.slug}`}
                className={`arena-spotlight-card arena-spotlight-card-${slot.tone} group`}
              >
                <div className="arena-spotlight-card-inner">
                  <p className="arena-spotlight-label">
                    <Icon size={14} className="shrink-0" />
                    {slot.title}
                  </p>

                  <div className="arena-spotlight-card-body mt-3 flex items-center gap-3">
                    <div className="arena-spotlight-thumb arena-spotlight-thumb-lg">
                      {device.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={device.image}
                          alt=""
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        <span className="text-2xl opacity-50">📱</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="arena-spotlight-headline">{device.name}</h2>
                      {device.specLine ? (
                        <p className="arena-spotlight-detail">{device.specLine}</p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {price ? (
                          <span className="arena-spotlight-meta">{price}</span>
                        ) : null}
                        {device.rating != null ? (
                          <span className="arena-spotlight-meta">
                            {device.rating.toFixed(1)} / 10
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <SpectrumPanel variant="accent" className="p-10 text-center text-[var(--text-secondary)]">
          Devices will appear here once the catalog is populated.{" "}
          <Link href="/phones" className="font-semibold text-[var(--electric-cyan)] hover:underline">
            Browse phones
          </Link>
        </SpectrumPanel>
      )}
    </section>
  );
}
