import type { Device, Review } from "@/lib/api";

export const HOME_SPOTLIGHT_LIMIT = 12;

export type SpotlightTone =
  | "blue"
  | "cyan"
  | "purple"
  | "rose"
  | "gold"
  | "emerald";

export type SpotlightDevice = {
  name: string;
  slug: string;
  price?: number | null;
  rating?: number | null;
  image?: string;
  specLine?: string;
};

export type SpotlightSlotData = {
  key: string;
  title: string;
  tone: SpotlightTone;
  device: SpotlightDevice;
};

export type HomeSpotlightData = {
  slots: SpotlightSlotData[];
};

const EXTRA_TONES: SpotlightTone[] = [
  "blue",
  "cyan",
  "purple",
  "rose",
  "gold",
  "emerald",
];

function toSpotlightDevice(device: Device): SpotlightDevice {
  const specParts: string[] = [];
  if (device.display?.size) specParts.push(`${device.display.size}"`);
  if (device.display?.refreshRate) specParts.push(`${device.display.refreshRate}Hz`);
  if (device.battery?.capacity) specParts.push(`${device.battery.capacity}mAh`);

  return {
    name: device.name,
    slug: device.slug,
    price: device.price,
    rating: device.rating,
    image: device.images?.[0]?.url,
    specLine: specParts.length > 0 ? specParts.join(" · ") : device.os ?? undefined,
  };
}

function deviceScore(device: Device): number {
  const rating = device.rating ?? 0;
  const benchmark = device.chipset?.benchmark ?? 0;
  const priceBoost = device.price != null && device.price < 900 ? 0.15 : 0;
  return rating * 2 + benchmark / 1_000_000 + priceBoost;
}

function pickFromPool(
  devices: Device[],
  compare: (a: Device, b: Device) => number,
  exclude: Set<string>,
): Device | null {
  const pool = devices.filter((d) => !exclude.has(d.slug));
  if (pool.length === 0) return null;
  const pick = [...pool].sort(compare)[0]!;
  exclude.add(pick.slug);
  return pick;
}

function pickBestReviewDevice(
  devices: Device[],
  reviews: Review[],
  exclude: Set<string>,
): Device | null {
  if (reviews.length > 0) {
    const bestReview = [...reviews].sort((a, b) => b.score - a.score)[0]!;
    const fromReview =
      bestReview.device ??
      devices.find((d) => d.id === bestReview.deviceId) ??
      null;
    if (fromReview && !exclude.has(fromReview.slug)) {
      exclude.add(fromReview.slug);
      return fromReview;
    }
  }

  return pickFromPool(
    devices,
    (a, b) => (b.rating ?? 0) - (a.rating ?? 0) || deviceScore(b) - deviceScore(a),
    exclude,
  );
}

function pickUpcoming(upcoming: Device[], exclude: Set<string>): Device | null {
  const pool = upcoming.filter((d) => !exclude.has(d.slug));
  if (pool.length === 0) return null;

  const pick = [...pool].sort((a, b) => {
    const da = a.releasedDate ?? a.announcedDate ?? "";
    const db = b.releasedDate ?? b.announcedDate ?? "";
    if (da && db) return da.localeCompare(db);
    if (da) return -1;
    if (db) return 1;
    return a.name.localeCompare(b.name);
  })[0]!;

  exclude.add(pick.slug);
  return pick;
}

function addSlot(
  slots: SpotlightSlotData[],
  key: string,
  title: string,
  tone: SpotlightTone,
  device: Device | null,
): void {
  if (!device || slots.length >= HOME_SPOTLIGHT_LIMIT) return;
  slots.push({
    key: `${key}-${device.slug}`,
    title,
    tone,
    device: toSpotlightDevice(device),
  });
}

export function buildHomeSpotlight(
  devices: Device[],
  reviews: Review[],
  upcoming: Device[],
): HomeSpotlightData {
  const used = new Set<string>();
  const slots: SpotlightSlotData[] = [];

  addSlot(
    slots,
    "searched",
    "Most Searched Device",
    "cyan",
    pickFromPool(
      devices,
      (a, b) => {
        const ba = a.chipset?.benchmark ?? 0;
        const bb = b.chipset?.benchmark ?? 0;
        if (bb !== ba) return bb - ba;
        return (b.rating ?? 0) - (a.rating ?? 0);
      },
      used,
    ),
  );

  addSlot(
    slots,
    "reviews",
    "Best Reviews Device",
    "purple",
    pickBestReviewDevice(devices, reviews, used),
  );

  addSlot(
    slots,
    "loved",
    "Most Loved Device",
    "rose",
    pickFromPool(devices, (a, b) => deviceScore(b) - deviceScore(a), used),
  );

  addSlot(
    slots,
    "rated",
    "Best Rated Device",
    "gold",
    pickFromPool(
      devices,
      (a, b) => (b.rating ?? 0) - (a.rating ?? 0) || deviceScore(b) - deviceScore(a),
      used,
    ),
  );

  addSlot(
    slots,
    "upcoming",
    "Upcoming Device",
    "emerald",
    pickUpcoming(upcoming, used),
  );

  addSlot(
    slots,
    "trending",
    "Trending Device",
    "blue",
    pickFromPool(
      devices,
      (a, b) => (b.chipset?.benchmark ?? 0) - (a.chipset?.benchmark ?? 0),
      used,
    ),
  );

  const fillers = [...devices]
    .filter((d) => !used.has(d.slug))
    .sort((a, b) => deviceScore(b) - deviceScore(a));

  for (let i = 0; i < fillers.length && slots.length < HOME_SPOTLIGHT_LIMIT; i++) {
    const device = fillers[i]!;
    used.add(device.slug);
    addSlot(
      slots,
      `featured-${i}`,
      "Featured Device",
      EXTRA_TONES[i % EXTRA_TONES.length]!,
      device,
    );
  }

  return { slots: slots.slice(0, HOME_SPOTLIGHT_LIMIT) };
}
