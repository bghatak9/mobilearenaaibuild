import type { SearchLanguageCode } from "./search-locale";
import {
  googleTranslateCode,
  resolveSearchLanguage,
  shouldTranslateVoiceTranscript,
} from "./search-locale";
import { normalizeVoiceTranscript } from "./voice-search";

export type VoiceTranslationResult = {
  original: string;
  searchText: string;
  translated: boolean;
  configured: boolean;
  sourceLanguage?: string | null;
};

export type TranslateVoiceResponse = {
  configured: boolean;
  originalText: string;
  translatedText: string;
  target: string;
  sourceLanguage?: string | null;
};

/** Normalize and optionally translate a voice transcript for catalog search. */
export async function prepareVoiceTranscriptForSearch(
  raw: string,
  lang: SearchLanguageCode,
  translate: (input: {
    text: string;
    source?: SearchLanguageCode;
    target?: string;
  }) => Promise<TranslateVoiceResponse>,
): Promise<VoiceTranslationResult> {
  const original = raw.trim();
  if (!original) {
    return {
      original: "",
      searchText: "",
      translated: false,
      configured: false,
    };
  }

  const normalized = normalizeVoiceTranscript(original);
  const needsTranslation = shouldTranslateVoiceTranscript(original, lang);

  if (!needsTranslation) {
    return {
      original,
      searchText: normalized,
      translated: false,
      configured: false,
    };
  }

  try {
    const resolved = resolveSearchLanguage(lang);
    const result = await translate({
      text: original,
      source: lang === "auto" ? "auto" : resolved,
      target: "en",
    });

    if (!result.configured) {
      return {
        original,
        searchText: normalized,
        translated: false,
        configured: false,
      };
    }

    const searchText = normalizeVoiceTranscript(result.translatedText);
    const translated =
      searchText.toLowerCase() !== normalized.toLowerCase() &&
      (result.sourceLanguage ?? "").toLowerCase() !== "en";

    return {
      original,
      searchText: translated ? searchText : normalized,
      translated,
      configured: true,
      sourceLanguage: result.sourceLanguage ?? googleTranslateCode(lang),
    };
  } catch {
    return {
      original,
      searchText: normalized,
      translated: false,
      configured: true,
    };
  }
}
