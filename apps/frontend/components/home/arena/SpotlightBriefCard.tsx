"use client";

import {
  CalendarClock,
  Crown,
  Heart,
  Search,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";

import { DeviceBriefLink } from "@/components/device-brief/DeviceBriefLink";
import { DeviceName } from "@/components/brands/DeviceName";
import type { MessageKey } from "@/features/i18n";
import type { SpotlightSlotData } from "@/lib/home-spotlight";
import { useSiteLanguage } from "@/lib/site-language";

const SLOT_TITLE_KEYS: Record<string, MessageKey> = {
  searched: "home.spotlightSearched",
  reviews: "home.spotlightReviews",
  loved: "home.spotlightLoved",
  rated: "home.spotlightRated",
  upcoming: "home.spotlightUpcoming",
  trending: "home.spotlightTrending",
};

function slotPrefix(slot: SpotlightSlotData): string {
  return slot.key.split("-")[0] ?? "";
}

function renderSlotIcon(slot: SpotlightSlotData): ReactNode {
  const className = "shrink-0";
  const size = 14;
  switch (slotPrefix(slot)) {
    case "searched":
      return <Search size={size} className={className} />;
    case "reviews":
      return <Star size={size} className={className} />;
    case "loved":
      return <Heart size={size} className={className} />;
    case "rated":
      return <Crown size={size} className={className} />;
    case "upcoming":
      return <CalendarClock size={size} className={className} />;
    case "trending":
      return <Zap size={size} className={className} />;
    default:
      return <Sparkles size={size} className={className} />;
  }
}

type Props = {
  slot: SpotlightSlotData;
  price: string | null;
};

export function SpotlightBriefCard({ slot, price }: Props) {
  const { t } = useSiteLanguage();
  const device = slot.device;
  const titleKey = SLOT_TITLE_KEYS[slotPrefix(slot)];
  const title = titleKey ? t(titleKey) : t("home.spotlightFeatured");

  return (
    <DeviceBriefLink
      href={`/phones/${device.slug}`}
      className={`arena-spotlight-card arena-spotlight-card-${slot.tone} group`}
    >
      <div className="arena-spotlight-card-inner">
        <p className="arena-spotlight-label">
          {renderSlotIcon(slot)}
          {title}
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
            <h2 className="arena-spotlight-headline">
              <DeviceName name={device.name} brand={device.brand} />
            </h2>
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
    </DeviceBriefLink>
  );
}
