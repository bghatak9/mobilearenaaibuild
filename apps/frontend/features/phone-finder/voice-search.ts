import type { Device } from "@/lib/api";

import { parseVoiceCommand } from "./nlp";
import { parseSearchQuery } from "./search-query";
import {
  comparePattern,
  getStoredSearchLanguage,
  type SearchLanguageCode,
} from "./search-locale";
import type { PhoneFinderFilters, PriceCurrency } from "./types";

const SMALL_NUMBERS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
};

const TENS_NUMBERS: Record<string, number> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

function spokenPhraseToNumber(phrase: string): number | null {
  const parts = phrase.toLowerCase().split(/[\s-]+/).filter(Boolean);
  let total = 0;
  for (const part of parts) {
    if (part === "hundred") {
      total = (total || 1) * 100;
      continue;
    }
    if (part === "thousand") {
      total = (total || 1) * 1000;
      continue;
    }
    if (SMALL_NUMBERS[part] != null) total += SMALL_NUMBERS[part];
    else if (TENS_NUMBERS[part] != null) total += TENS_NUMBERS[part];
    else return null;
  }
  return total > 0 ? total : null;
}

/** Convert spoken numbers and common voice quirks into searchable text. */
export function normalizeVoiceTranscript(raw: string): string {
  let text = raw.trim();

  text = text.replace(
    /\b((?:(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:[\s-]+(?:one|two|three|four|five|six|seven|eight|nine))?|(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen)))\s+thousand\b/gi,
    (_, phrase: string) => {
      const n = spokenPhraseToNumber(phrase);
      return n != null ? String(n * 1000) : phrase;
    },
  );

  text = text.replace(/\bunder\s+thirty\s+thousand\b/gi, "under 30000");
  text = text.replace(/\bunder\s+twenty\s+thousand\b/gi, "under 20000");
  text = text.replace(/\bunder\s+fifty\s+thousand\b/gi, "under 50000");
  text = text.replace(/\bone\s+lakh\b/gi, "100000");
  text = text.replace(/\b120\s*hertz\b/gi, "120Hz");
  text = text.replace(/\biphone\b/gi, "iPhone");
  text = text.replace(/\boppo\b/gi, "Oppo");

  return text;
}

export type VoiceSearchPlan =
  | { type: "search"; query: string; patch?: Partial<PhoneFinderFilters> }
  | { type: "compare"; devices: Device[] }
  | { type: "navigate"; path: string };

function matchDeviceHint(devices: Device[], hint: string): Device | null {
  const cleaned = hint
    .toLowerCase()
    .replace(/\b(flagships?|phones?|mobiles?|devices?|the)\b/g, " ")
    .trim();
  const tokens = cleaned.split(/[\s,]+/).filter((t) => t.length > 1);
  if (tokens.length === 0) return null;

  let best: { device: Device; score: number } | null = null;
  for (const device of devices) {
    const hay = [
      device.name,
      device.slug?.replace(/-/g, " "),
      device.brand?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    let score = 0;
    for (const token of tokens) {
      if (hay.includes(token)) score += 12;
      if (device.brand?.name?.toLowerCase().includes(token)) score += 8;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { device, score };
    }
  }
  return best?.device ?? null;
}

export function devicesForCompareVoiceQuery(
  devices: Device[],
  query: string,
  lang: SearchLanguageCode = getStoredSearchLanguage(),
): Device[] {
  const match = query.match(comparePattern(lang));
  if (!match) return [];
  const left = matchDeviceHint(devices, match[1]);
  const right = matchDeviceHint(devices, match[2]);
  return [left, right].filter((d): d is Device => d != null);
}

export function planVoiceSearch(
  transcript: string,
  devices: Device[],
  currency: PriceCurrency,
  lang: SearchLanguageCode = getStoredSearchLanguage(),
): VoiceSearchPlan {
  const normalized = normalizeVoiceTranscript(transcript);
  const cmd = parseVoiceCommand(normalized, lang);

  switch (cmd.type) {
    case "navigate":
      return { type: "navigate", path: cmd.path };
    case "compare": {
      const matched = devicesForCompareVoiceQuery(devices, normalized, lang);
      if (matched.length >= 2) return { type: "compare", devices: matched };
      return { type: "search", query: normalized };
    }
    case "filter":
      return {
        type: "search",
        query: normalized,
        patch: cmd.patch as Partial<PhoneFinderFilters>,
      };
    case "search":
      return {
        type: "search",
        query: cmd.query || normalized,
        patch: parseSearchQuery(cmd.query || normalized, currency, lang).patch,
      };
    default:
      return {
        type: "search",
        query: normalized,
        patch: parseSearchQuery(normalized, currency, lang).patch,
      };
  }
}
