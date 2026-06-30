"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  getStoredSearchLanguage,
  speechTagForLanguage,
  type SearchLanguageCode,
} from "@/features/phone-finder/search-locale";

type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult:
    | ((e: {
        results: { [i: number]: { [j: number]: { transcript: string } } };
      }) => void)
    | null;
  onerror: ((e: { error?: string }) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function speechErrorMessage(error: string): string | null {
  switch (error) {
    case "aborted":
      return null;
    case "no-speech":
      return "No speech detected. Tap the mic and try again.";
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone access is blocked. Allow mic permission in your browser settings.";
    case "network":
      return "Voice search needs an internet connection in this browser.";
    case "audio-capture":
      return "No microphone found. Check your audio input device.";
    default:
      return "Could not capture voice. Try typing instead.";
  }
}

/** Request mic access during a user gesture (click/tap). */
export async function primeMicrophone(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return true;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch {
    return false;
  }
}

export function useVoiceSearch(options?: {
  onResult?: (transcript: string) => void;
  onError?: (message: string) => void;
  lang?: SearchLanguageCode;
}) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(false);
  const recRef = useRef<SpeechRecognitionInstance | null>(null);
  const sessionRef = useRef(0);
  const onResultRef = useRef(options?.onResult);
  const onErrorRef = useRef(options?.onError);
  const langRef = useRef<SearchLanguageCode>(options?.lang ?? getStoredSearchLanguage());

  useEffect(() => {
    onResultRef.current = options?.onResult;
    onErrorRef.current = options?.onError;
    langRef.current = options?.lang ?? getStoredSearchLanguage();
  }, [options?.onResult, options?.onError, options?.lang]);

  useEffect(() => {
    setSupported(Boolean(getSpeechRecognition()));
  }, []);

  const detachRecognition = useCallback((rec: SpeechRecognitionInstance) => {
    rec.onstart = null;
    rec.onend = null;
    rec.onresult = null;
    rec.onerror = null;
  }, []);

  const stop = useCallback(() => {
    const rec = recRef.current;
    if (!rec) {
      setListening(false);
      return;
    }
    sessionRef.current += 1;
    detachRecognition(rec);
    try {
      rec.abort();
    } catch {
      /* ignore */
    }
    recRef.current = null;
    setListening(false);
  }, [detachRecognition]);

  const start = useCallback(async () => {
    const SR = getSpeechRecognition();
    if (!SR) {
      onErrorRef.current?.("Voice search requires Chrome, Edge, or Safari.");
      return;
    }

    stop();

    const micReady = await primeMicrophone();
    if (!micReady) {
      onErrorRef.current?.(
        "Microphone access is blocked. Allow mic permission in your browser settings.",
      );
      return;
    }

    const sessionId = sessionRef.current + 1;
    sessionRef.current = sessionId;

    const rec = new SR();
    rec.lang = speechTagForLanguage(langRef.current);
    rec.interimResults = false;
    rec.continuous = false;

    rec.onstart = () => {
      if (sessionId !== sessionRef.current) return;
      setListening(true);
    };

    rec.onend = () => {
      if (sessionId !== sessionRef.current) return;
      setListening(false);
      if (recRef.current === rec) recRef.current = null;
    };

    rec.onresult = (e) => {
      if (sessionId !== sessionRef.current) return;
      const text = e.results[0]?.[0]?.transcript?.trim() ?? "";
      if (!text) return;
      setTranscript(text);
      onResultRef.current?.(text);
    };

    rec.onerror = (e) => {
      if (sessionId !== sessionRef.current) return;
      setListening(false);
      if (recRef.current === rec) recRef.current = null;
      const message = speechErrorMessage(e.error ?? "unknown");
      if (message) onErrorRef.current?.(message);
    };

    recRef.current = rec;

    try {
      rec.start();
    } catch {
      if (sessionId !== sessionRef.current) return;
      setListening(false);
      recRef.current = null;
      onErrorRef.current?.("Voice search is busy. Tap the mic and try again.");
    }
  }, [stop]);

  useEffect(() => () => stop(), [stop]);

  return { listening, transcript, supported, start, stop };
}
