import type { Device } from "@/lib/api";
import { computeArenaScore } from "@/lib/arena-score";
import { buildCommunityInsights } from "@/features/device-intelligence";
import {
  formatDate,
  mainCameraMp,
  parseChargingWatts,
} from "@/features/device-intelligence/format";
import {
  activeAffiliateOffers,
  devicePriceInCurrency,
  formatPriceAmount,
} from "@/features/phone-finder/device-utils";
import type { PriceCurrency } from "@/features/phone-finder/types";

export type BriefPillarId = "vision" | "optics" | "compute" | "endurance";

export type DeviceBriefPillar = {
  id: BriefPillarId;
  label: string;
  headline: string;
  detail: string;
  accentVar: string;
};

export type DeviceBriefMeta = {
  text: string;
};

export type DeviceBriefAffiliateOffer = {
  partner: string;
  price: number;
  currency: PriceCurrency;
  affiliateUrl: string;
};

export type DeviceBriefData = {
  slug: string;
  name: string;
  brand?: string;
  category?: string;
  gallery: string[];
  displaySize?: string;
  arenaScore: number;
  arenaTier: string;
  meta: DeviceBriefMeta[];
  satisfaction: string;
  rebuyLabel: string;
  pillars: DeviceBriefPillar[];
  priceLabel: string;
  priceKnown: boolean;
  affiliateOffers: DeviceBriefAffiliateOffer[];
};

function arenaTier(score: number): string {
  if (score >= 90) return "Elite tier";
  if (score >= 80) return "Flagship tier";
  if (score >= 65) return "Strong tier";
  if (score >= 50) return "Balanced tier";
  return "Entry tier";
}

function thicknessFromDimensions(dimensions?: string | null): string | null {
  if (!dimensions) return null;
  const match = dimensions.match(/([\d.]+)\s*mm/i);
  return match ? `${match[1]}mm depth` : null;
}

function storageLine(device: Device): string | null {
  const parts: string[] = [];
  if (device.storageGb != null) parts.push(`${device.storageGb}GB onboard`);
  if (device.ramGb != null) parts.push(`${device.ramGb}GB RAM`);
  return parts.length ? parts.join(" · ") : null;
}

function osLine(device: Device): string | null {
  if (!device.os) return null;
  const updates = device.intelligence?.general as Record<string, unknown> | undefined;
  const guaranteed =
    typeof updates?.guaranteedUpdates === "string"
      ? updates.guaranteedUpdates
      : null;
  return guaranteed ? `${device.os} · ${guaranteed}` : device.os;
}

function videoDetail(device: Device): string {
  const fromPayload = device.intelligence?.camera as Record<string, unknown> | undefined;
  if (typeof fromPayload?.maxVideo === "string") return fromPayload.maxVideo;
  const tele = device.cameras?.find((c) => /tele|periscope/i.test(c.type));
  if (tele) return `${tele.megapixel}MP tele`;
  return device.cameras?.length && device.cameras.length > 2 ? "Multi-lens" : "4K ready";
}

export function buildDeviceBrief(
  device: Device,
  currency: PriceCurrency = "USD",
): DeviceBriefData {
  const arenaScore = computeArenaScore(device);
  const insights = buildCommunityInsights(device);
  const mp = mainCameraMp(device);
  const chargingW = parseChargingWatts(device.battery?.charging ?? undefined);
  const depth = thicknessFromDimensions(device.dimensions);
  const price = devicePriceInCurrency(device, currency);
  const priceKnown = price != null;
  const affiliateOffers = activeAffiliateOffers(device, currency).map((offer) => ({
    partner: offer.partner,
    price: offer.price,
    currency: offer.currency as PriceCurrency,
    affiliateUrl: offer.affiliateUrl,
  }));
  const gallery =
    device.images?.map((img) => img.url).filter(Boolean) ?? [];

  const meta: DeviceBriefMeta[] = [
    { text: `Market · ${price != null ? formatPriceAmount(price, currency) : "price TBA"}` },
    device.releasedDate || device.announcedDate
      ? {
          text: device.releasedDate
            ? `Launched ${formatDate(device.releasedDate)}`
            : `Announced ${formatDate(device.announcedDate)}`,
        }
      : null,
    device.weight || depth
      ? {
          text: [device.weight ? `${device.weight}g` : null, depth]
            .filter(Boolean)
            .join(" · "),
        }
      : null,
    osLine(device) ? { text: osLine(device)! } : null,
    storageLine(device) ? { text: storageLine(device)! } : null,
  ].filter((line): line is DeviceBriefMeta => line != null);

  const pillars: DeviceBriefPillar[] = [
    {
      id: "vision",
      label: "Vision",
      headline: device.display ? `${device.display.size}"` : "—",
      detail: device.display
        ? `${device.display.resolution} · ${device.display.refreshRate}Hz`
        : "Display data pending",
      accentVar: "--electric-cyan",
    },
    {
      id: "optics",
      label: "Optics",
      headline: mp != null ? `${mp}MP` : "—",
      detail: videoDetail(device),
      accentVar: "--aurora-purple",
    },
    {
      id: "compute",
      label: "Compute",
      headline: device.ramGb != null ? `${device.ramGb}GB` : "—",
      detail: device.chipset?.cpu?.split(" ").slice(0, 3).join(" ") ?? "Chipset TBA",
      accentVar: "--premium-gold",
    },
    {
      id: "endurance",
      label: "Endurance",
      headline: device.battery?.capacity
        ? `${device.battery.capacity}mAh`
        : "—",
      detail: chargingW
        ? `${chargingW}W wired${device.battery?.wireless ? " · wireless" : ""}`
        : device.battery?.charging ?? "Power data pending",
      accentVar: "--emerald-success",
    },
  ];

  return {
    slug: device.slug,
    name: device.name,
    brand: device.brand?.name,
    category: device.category?.name,
    gallery,
    displaySize: device.display?.size ? String(device.display.size) : undefined,
    arenaScore,
    arenaTier: arenaTier(arenaScore),
    meta,
    satisfaction: insights.ownerSatisfaction,
    rebuyLabel: insights.polls[0]?.value ?? "—",
    pillars,
    priceLabel:
      price != null ? formatPriceAmount(price, currency) : "Market price TBA",
    priceKnown,
    affiliateOffers,
  };
}
