/** Parse natural-language and voice queries into structured buying intent. */
import {
  cameraPattern,
  comparePattern,
  gamingPattern,
  getStoredSearchLanguage,
  priceUnderPattern,
  type SearchLanguageCode,
  voicePrefixPattern,
} from "./search-locale";

export type ParsedBuyingQuery = {
  search: string;
  maxPrice: number | null;
  minPrice: number | null;
  currency: "USD" | "INR";
  minCameraMp: number | null;
  minBattery: number | null;
  minRam: number | null;
  fiveG: boolean | null;
  gaming: boolean | null;
  brandHints: string[];
  compareSlugs: string[];
  raw: string;
};

const INR_TO_USD = 1 / 83;

export function inrToUsd(inr: number): number {
  return Math.round(inr * INR_TO_USD);
}

export function usdToInr(usd: number): number {
  return Math.round(usd / INR_TO_USD);
}

export function formatMoney(amount: number, currency: "USD" | "INR"): string {
  if (currency === "INR") {
    return `₹${amount.toLocaleString("en-IN")}`;
  }
  return `$${amount.toLocaleString()}`;
}

function extractPrice(
  text: string,
  lang: SearchLanguageCode = getStoredSearchLanguage(),
): {
  max: number | null;
  min: number | null;
  currency: "USD" | "INR";
} {
  let currency: "USD" | "INR" = "USD";
  if (/₹|inr|rs\.?/i.test(text)) currency = "INR";

  const underPattern = priceUnderPattern(lang);
  const under = text.match(
    new RegExp(
      `(?:${underPattern.source}|under|below|max|budget|<)\\s*[₹$]?\\s*([\\d,]+)\\s*(?:k|K|000)?`,
      "i",
    ),
  );
  const over = text.match(
    /(?:over|above|min|>)\s*[₹$]?\s*([\d,]+)\s*(?:k|K|000)?/i,
  );

  function parseNum(raw: string): number {
    const n = Number(raw.replace(/,/g, ""));
    if (!Number.isFinite(n)) return 0;
    if (/k/i.test(text) && n < 1000) return n * 1000;
    return n;
  }

  let max: number | null = null;
  let min: number | null = null;

  if (under) {
    max = parseNum(under[1]);
    if (currency === "INR") max = inrToUsd(max);
  }
  if (over) {
    min = parseNum(over[1]);
    if (currency === "INR") min = inrToUsd(min);
  }

  const standalone = text.match(/[₹$]\s*([\d,]+)\s*(?:k|K)?/i);
  if (!max && standalone) {
    max = parseNum(standalone[1]);
    if (currency === "INR") max = inrToUsd(max);
  }

  return { max, min, currency };
}

function extractCompareSlugs(
  text: string,
  lang: SearchLanguageCode = getStoredSearchLanguage(),
): string[] {
  const vsMatch = text.match(comparePattern(lang));
  if (!vsMatch) {
    const fallback = text.match(
      /compare\s+(.+?)\s+(?:and|vs\.?|versus)\s+(.+)/i,
    );
    if (!fallback) return [];
    return [fallback[1].trim(), fallback[2].trim()];
  }
  return [vsMatch[1].trim(), vsMatch[2].trim()];
}

export function parseBuyingAssistantQuery(
  raw: string,
  lang: SearchLanguageCode = getStoredSearchLanguage(),
): ParsedBuyingQuery {
  const text = raw.trim().toLowerCase();
  const { max, min, currency } = extractPrice(text, lang);

  const brandHints: string[] = [];
  for (const b of [
    "samsung",
    "galaxy",
    "iphone",
    "apple",
    "pixel",
    "google",
    "oneplus",
    "xiaomi",
    "motorola",
    "nothing",
    "oppo",
    "vivo",
    "realme",
  ]) {
    if (text.includes(b)) brandHints.push(b);
  }

  const gaming =
    gamingPattern(lang).test(text) &&
    !/minimal gaming|not gaming|no gaming|casual/.test(text)
      ? true
      : /minimal gaming|not gaming|no gaming|casual/.test(text)
        ? false
        : null;

  const camera = cameraPattern(lang).test(text);
  const battery = /good battery|long battery|battery life|5000|6000/.test(text);

  return {
    search: brandHints.join(" "),
    maxPrice: max,
    minPrice: min,
    currency,
    minCameraMp: camera ? 48 : null,
    minBattery: battery ? 5000 : null,
    minRam: gaming ? 8 : null,
    fiveG: /5g/.test(text) ? true : null,
    gaming,
    brandHints,
    compareSlugs: extractCompareSlugs(raw, lang),
    raw,
  };
}

export type VoiceCommand =
  | { type: "search"; query: string }
  | { type: "filter"; patch: Record<string, unknown> }
  | { type: "compare"; query: string }
  | { type: "wishlist"; query: string }
  | { type: "navigate"; path: string }
  | { type: "unknown"; transcript: string };

export function parseVoiceCommand(
  transcript: string,
  lang: SearchLanguageCode = getStoredSearchLanguage(),
): VoiceCommand {
  const t = transcript.trim().toLowerCase();
  const prefix = voicePrefixPattern(lang);

  if (/open comparisons?|show comparisons?|go to compare/.test(t)) {
    return { type: "navigate", path: "/compare" };
  }
  if (/latest launches?|new phones|upcoming/.test(t)) {
    return { type: "navigate", path: "/phones?upcoming=1" };
  }
  if (/contact( us)?|support|get in touch/.test(t)) {
    return { type: "navigate", path: "/contact" };
  }
  if (/filter.*5g|5g phones?|show 5g/.test(t)) {
    return { type: "filter", patch: { fiveG: true } };
  }
  if (/add .+ to wishlist|wishlist .+/.test(t)) {
    const m = t.match(/(?:add|wishlist)\s+(.+?)(?:\s+to wishlist)?$/i);
    return { type: "wishlist", query: m?.[1]?.trim() ?? t };
  }
  if (comparePattern(lang).test(t) || /compare .+ (?:and|vs|versus) .+/.test(t)) {
    return { type: "compare", query: transcript };
  }
  if (/show\s+.+\s+(?:phones?\s+)?with\s+120\s*hz/i.test(t)) {
    const brand = t.match(/show\s+(\w+)\s+phones?/i)?.[1];
    const patch: Record<string, unknown> = { display120Hz: true, minRefresh: 120 };
    if (brand) {
      patch.brand = brand.charAt(0).toUpperCase() + brand.slice(1);
    }
    return {
      type: "filter",
      patch,
    };
  }
  if (gamingPattern(lang).test(t) || /gaming phones?/.test(t)) {
    return { type: "search", query: "gaming" };
  }
  if (cameraPattern(lang).test(t) || /best camera|camera phone/.test(t)) {
    return { type: "search", query: "camera" };
  }
  if (prefix.test(t) || /show|find|search/.test(t)) {
    return {
      type: "search",
      query: transcript.replace(prefix, "").replace(/^(show|find|search)\s+/i, ""),
    };
  }

  return { type: "unknown", transcript };
}

export function tokensFromImageFilename(name: string): string[] {
  return name
    .replace(/\.[^.]+$/, "")
    .split(/[\s_\-]+/)
    .map((t) => t.toLowerCase())
    .filter((t) => t.length > 2);
}
