"use client";

import type { VoiceTranslationResult } from "@/features/phone-finder/voice-translate";
import { cn } from "@/design-system/utils/cn";

type VoiceSearchStatusProps = {
  listening?: boolean;
  translating?: boolean;
  error?: string | null;
  translation?: VoiceTranslationResult | null;
  className?: string;
};

export function VoiceSearchStatus({
  listening,
  translating,
  error,
  translation,
  className,
}: VoiceSearchStatusProps) {
  if (!listening && !translating && !error && !translation) return null;

  const message =
    error ??
    (translating
      ? "Translating with Google…"
      : listening
        ? "Listening… speak now"
        : translation
          ? translation.translated
            ? `Heard: “${translation.original}” → “${translation.searchText}”`
            : `Heard: “${translation.original}”`
          : null);

  if (!message) return null;

  return (
    <p
      className={cn(
        "text-xs",
        error
          ? "text-[var(--rose-alert)]"
          : listening || translating
            ? "text-[var(--rose-alert)]"
            : "text-[var(--electric-cyan)]",
        className,
      )}
    >
      {message}
    </p>
  );
}
