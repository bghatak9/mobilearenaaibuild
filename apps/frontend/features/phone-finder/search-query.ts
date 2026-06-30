import { parseBuyingAssistantQuery, usdToInr } from "./nlp";
import { ALL_PRESETS, presetById } from "./presets";
import {
  getStoredSearchLanguage,
  priceUnderPattern,
  stopwordsForLanguage,
} from "./search-locale";
import type { PhoneFinderFilters, PriceCurrency } from "./types";
import type { SearchLanguageCode } from "./search-locale";

export type ParsedSearchQuery = {
  freeText: string;
  patch: Partial<PhoneFinderFilters>;
};

export function hasStructuredSearchPatch(
  patch: Partial<PhoneFinderFilters>,
): boolean {
  return Object.entries(patch).some(([key, value]) => {
    if (key === "search" || key === "sort" || key === "preset") return false;
    if (value == null || value === "" || value === "All") return false;
    if (typeof value === "boolean" && !value) return false;
    return true;
  });
}

const BRAND_ALIASES: Record<string, string> = {
  samsung: "Samsung",
  apple: "Apple",
  iphone: "Apple",
  google: "Google",
  pixel: "Google",
  oneplus: "OnePlus",
  xiaomi: "Xiaomi",
  redmi: "Xiaomi",
  poco: "Xiaomi",
  motorola: "Motorola",
  nothing: "Nothing",
  oppo: "Oppo",
  vivo: "Vivo",
  realme: "Realme",
  huawei: "Huawei",
  honor: "Honor",
  sony: "Sony",
  nokia: "Nokia",
  asus: "ASUS",
  rog: "ASUS",
};

function parseNumericValue(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "").replace(/gb|mah|w|hz|mp/gi, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parsePriceValue(
  raw: string,
  currency: PriceCurrency,
): { min: number | null; max: number | null } {
  const value = parseNumericValue(raw.replace(/^[<>=]+/, "").replace(/\+$/, ""));
  if (value == null) return { min: null, max: null };

  const isInr = /₹|inr|rs/i.test(raw) || currency === "INR";
  const amount = isInr && currency === "USD" ? Math.round(value / 83) : value;
  const inrAmount = isInr ? value : usdToInr(value);

  const normalized =
    currency === "INR"
      ? isInr
        ? value
        : inrAmount
      : isInr
        ? amount
        : value;

  if (/^</.test(raw) || /^<=/.test(raw) || /under|below/i.test(raw)) {
    return { min: null, max: normalized };
  }
  if (/^>/.test(raw) || /^>=/.test(raw) || /\+$/.test(raw) || /over|above/i.test(raw)) {
    return { min: normalized, max: null };
  }
  return { min: null, max: normalized };
}

/** Parse `brand:samsung ram:8 price:<30000` advanced syntax. */
export function parseAdvancedSearchTokens(
  query: string,
  currency: PriceCurrency,
): { freeText: string; patch: Partial<PhoneFinderFilters> } {
  const patch: Partial<PhoneFinderFilters> = {};
  const freeParts: string[] = [];

  const tokenRe = /(\w+):(\S+)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRe.exec(query)) !== null) {
    freeParts.push(query.slice(lastIndex, match.index).trim());
    lastIndex = match.index + match[0].length;

    const key = match[1].toLowerCase();
    const value = match[2];

    switch (key) {
      case "brand": {
        const brand =
          BRAND_ALIASES[value.toLowerCase()] ??
          value.charAt(0).toUpperCase() + value.slice(1);
        patch.brand = brand;
        break;
      }
      case "ram":
        patch.minRam = parseNumericValue(value);
        break;
      case "storage":
        patch.minStorage = parseNumericValue(value);
        break;
      case "price": {
        const { min, max } = parsePriceValue(value, currency);
        if (min != null) patch.minPrice = min;
        if (max != null) patch.maxPrice = max;
        break;
      }
      case "battery": {
        const n = parseNumericValue(value);
        if (n != null) patch.minBattery = n;
        if (/\+|>/.test(value)) patch.battery5000 = true;
        break;
      }
      case "display": {
        const v = value.toLowerCase();
        if (v.includes("amoled")) patch.displayAmoled = true;
        else if (v.includes("oled")) patch.displayOled = true;
        else if (v.includes("ltpo")) patch.displayLtpo = true;
        const hz = parseNumericValue(v);
        if (hz != null) {
          patch.minRefresh = hz;
          if (hz >= 144) patch.display144Hz = true;
          else if (hz >= 120) patch.display120Hz = true;
          else if (hz >= 90) patch.display90Hz = true;
        }
        break;
      }
      case "camera": {
        const v = value.toLowerCase();
        if (v === "ois") patch.ois = true;
        else {
          const mp = parseNumericValue(v);
          if (mp != null) patch.minCameraMp = mp;
        }
        break;
      }
      case "processor":
      case "chip":
        freeParts.push(value);
        break;
      case "5g":
        patch.fiveG = true;
        break;
      default:
        freeParts.push(match[0]);
    }
  }

  freeParts.push(query.slice(lastIndex).trim());

  return {
    freeText: freeParts.filter(Boolean).join(" ").trim(),
    patch,
  };
}

const NL_PRESET_HINTS: { pattern: RegExp; presetId: string }[] = [
  { pattern: /\bgaming\b|\besports\b/i, presetId: "gaming" },
  { pattern: /\bbest camera\b|\bcamera phone\b|\bphotography\b/i, presetId: "camera" },
  { pattern: /\bbattery\b|\blong battery\b/i, presetId: "battery" },
  { pattern: /\bselfie\b/i, presetId: "selfie" },
  { pattern: /\bcompact\b|\bsmall phone\b/i, presetId: "compact" },
  { pattern: /\blightweight\b|\blight phone\b/i, presetId: "lightweight" },
  { pattern: /\bbusiness\b/i, presetId: "business" },
  { pattern: /\bvalue\b|\bbudget\b/i, presetId: "value" },
];

/** Merge advanced syntax + natural-language into filter patch + free text. */
export function parseSearchQuery(
  raw: string,
  currency: PriceCurrency,
  lang: SearchLanguageCode = getStoredSearchLanguage(),
): ParsedSearchQuery {
  const trimmed = raw.trim();
  if (!trimmed) return { freeText: "", patch: {} };

  const stopwords = stopwordsForLanguage(lang);

  const { freeText: afterAdvanced, patch: advancedPatch } = parseAdvancedSearchTokens(
    trimmed,
    currency,
  );

  const nlp = parseBuyingAssistantQuery(afterAdvanced || trimmed, lang);
  const patch: Partial<PhoneFinderFilters> = { ...advancedPatch };

  if (nlp.maxPrice != null && patch.maxPrice == null) {
    patch.maxPrice =
      currency === "INR" ? usdToInr(nlp.maxPrice) : nlp.maxPrice;
  }
  if (nlp.minPrice != null && patch.minPrice == null) {
    patch.minPrice =
      currency === "INR" ? usdToInr(nlp.minPrice) : nlp.minPrice;
  }

  const underPlain = (afterAdvanced || trimmed).match(
    new RegExp(
      `(?:${priceUnderPattern(lang).source}|under)\\s+[₹$]?\\s*([\\d,]+)\\s*(?:k|K)?`,
      "i",
    ),
  );
  if (underPlain && patch.maxPrice == null) {
    let n = Number(underPlain[1].replace(/,/g, ""));
    if (/k/i.test(underPlain[0]) && n < 1000) n *= 1000;
    patch.maxPrice =
      currency === "INR" || /₹|inr|rs/i.test(trimmed) ? n : n;
  }
  if (nlp.minRam != null && patch.minRam == null) patch.minRam = nlp.minRam;
  if (nlp.minCameraMp != null && patch.minCameraMp == null) {
    patch.minCameraMp = nlp.minCameraMp;
  }
  if (nlp.minBattery != null && patch.minBattery == null) {
    patch.minBattery = nlp.minBattery;
  }
  if (nlp.fiveG === true && patch.fiveG == null) patch.fiveG = true;

  for (const hint of nlp.brandHints) {
    const brand = BRAND_ALIASES[hint];
    if (brand && patch.brand == null) patch.brand = brand;
  }

  const text = (afterAdvanced || trimmed).toLowerCase();

  if (/\b8\s*gb\s*ram\b|\b8gb\b/i.test(text) && patch.minRam == null) {
    patch.minRam = 8;
  }
  if (/\b12\s*gb\s*ram\b|\b12gb\b/i.test(text) && patch.minRam == null) {
    patch.minRam = 12;
  }
  if (/\b256\s*gb\b|\b256gb\b/i.test(text) && patch.minStorage == null) {
    patch.minStorage = 256;
  }
  if (/\b120\s*hz\b|\b120hz\b/i.test(text) && patch.minRefresh == null) {
    patch.minRefresh = 120;
    patch.display120Hz = true;
  }
  if (/\bamoled\b/i.test(text) && patch.displayAmoled == null) {
    patch.displayAmoled = true;
  }
  if (/\b5g\b/i.test(text) && patch.fiveG == null) patch.fiveG = true;
  if (/\bois\b/i.test(text) && patch.ois == null) patch.ois = true;
  if (/\besim\b/i.test(text) && patch.esim == null) patch.esim = true;
  if (/\b\d{4}\s*mah\b/i.test(text) && patch.minBattery == null) {
    const m = text.match(/(\d{4})\s*mah/);
    if (m) patch.minBattery = Number(m[1]);
  }

  for (const { pattern, presetId } of NL_PRESET_HINTS) {
    if (pattern.test(text) && patch.preset == null) {
      patch.preset = presetId;
      const preset = presetById(presetId);
      if (preset) Object.assign(patch, preset.patch);
    }
  }

  if (nlp.gaming === true && patch.preset == null) {
    const gaming = presetById("gaming");
    if (gaming) {
      patch.preset = "gaming";
      Object.assign(patch, gaming.patch);
    }
  }

  let freeText = afterAdvanced || trimmed;
  if (hasStructuredSearchPatch(patch) || patch.preset) {
    const tokens = freeText
      .toLowerCase()
      .split(/[\s,]+/)
      .map((t) => t.replace(/[^\w.+]/g, ""))
      .filter((t) => t.length > 0 && !stopwords.has(t));
    const brandTokens = new Set(
      Object.values(BRAND_ALIASES).map((b) => b.toLowerCase()),
    );
    freeText = tokens
      .filter((t) => !brandTokens.has(t) && !["gaming", "camera", "battery"].includes(t))
      .join(" ");
  }

  return { freeText, patch };
}

export function brandFromQuery(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [alias, brand] of Object.entries(BRAND_ALIASES)) {
    if (lower.includes(alias)) return brand;
  }
  return null;
}

export function presetSuggestionsForQuery(query: string) {
  const q = query.toLowerCase();
  return ALL_PRESETS.filter(
    (p) =>
      p.label.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.id.includes(q),
  ).slice(0, 3);
}
