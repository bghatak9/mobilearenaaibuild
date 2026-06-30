"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  prepareVoiceTranscriptForSearch,
  type VoiceTranslationResult,
} from "@/features/phone-finder/voice-translate";
import type { SearchLanguageCode } from "@/features/phone-finder/search-locale";
import { translateVoiceQuery } from "@/lib/api";
import { primeMicrophone, useVoiceSearch } from "@/lib/use-voice-search";

export function usePreparedVoiceSearch(options: {
  lang: SearchLanguageCode;
  onPrepared: (prepared: VoiceTranslationResult) => void | Promise<void>;
}) {
  const [translating, setTranslating] = useState(false);
  const [translation, setTranslation] = useState<VoiceTranslationResult | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const onPreparedRef = useRef(options.onPrepared);

  useEffect(() => {
    onPreparedRef.current = options.onPrepared;
  }, [options.onPrepared]);

  const onResult = useCallback(
    async (raw: string) => {
      setError(null);
      setTranslating(true);
      try {
        const prepared = await prepareVoiceTranscriptForSearch(
          raw,
          options.lang,
          translateVoiceQuery,
        );
        setTranslation(prepared);
        await onPreparedRef.current(prepared);
      } catch {
        setError("Voice search failed. Try again or type your search.");
      } finally {
        setTranslating(false);
      }
    },
    [options.lang],
  );

  const voice = useVoiceSearch({
    onResult,
    onError: setError,
    lang: options.lang,
  });

  const toggle = useCallback(async () => {
    if (voice.listening) {
      voice.stop();
      return;
    }
    setError(null);
    setTranslation(null);
    const ok = await primeMicrophone();
    if (!ok) {
      setError(
        "Microphone access is blocked. Allow mic permission in your browser settings.",
      );
      return;
    }
    voice.start();
  }, [voice]);

  const clearStatus = useCallback(() => {
    setTranslation(null);
    setError(null);
  }, []);

  return {
    ...voice,
    translating,
    translation,
    error,
    toggle,
    clearStatus,
    setError,
  };
}
