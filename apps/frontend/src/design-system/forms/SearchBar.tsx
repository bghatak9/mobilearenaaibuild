"use client";

import { Search } from "lucide-react";
import {
  forwardRef,
  useCallback,
  type FormEvent,
  type InputHTMLAttributes,
} from "react";

import { VoiceSearchMicButton } from "@/components/search/VoiceSearchMicButton";
import { VoiceSearchStatus } from "@/components/search/VoiceSearchStatus";
import { cn } from "@/design-system/utils/cn";
import { usePreparedVoiceSearch } from "@/lib/use-prepared-voice-search";
import { useSearchLanguage } from "@/lib/use-search-language";

export type SearchBarProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "onSubmit"
> & {
  onSubmit?: (query: string) => void;
  onVoiceQuery?: (query: string) => void;
  enableVoice?: boolean;
  showVoiceStatus?: boolean;
};

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      className,
      onSubmit,
      onVoiceQuery,
      enableVoice = true,
      showVoiceStatus = true,
      placeholder = "Search phones, brands, news…",
      value,
      onChange,
      ...props
    },
    ref,
  ) => {
    const { language } = useSearchLanguage();

    const applyVoiceQuery = useCallback(
      async (prepared: { searchText: string }) => {
        const q = prepared.searchText.trim();
        if (!q) return;
        if (onVoiceQuery) {
          onVoiceQuery(q);
        } else {
          onSubmit?.(q);
        }
      },
      [onSubmit, onVoiceQuery],
    );

    const voice = usePreparedVoiceSearch({
      lang: language,
      onPrepared: applyVoiceQuery,
    });

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const q = String(fd.get("q") ?? "").trim();
      voice.clearStatus();
      onSubmit?.(q);
    }

    const hasVoice = enableVoice && voice.supported;

    return (
      <div className={cn("w-full space-y-2", className)}>
        <form onSubmit={handleSubmit} className="relative w-full">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
            aria-hidden
          />
          <input
            ref={ref}
            name="q"
            type="text"
            inputMode="search"
            enterKeyHint="search"
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
              voice.clearStatus();
              onChange?.(e);
            }}
            className={cn(
              "w-full rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] py-2.5 pl-10",
              "text-sm text-[var(--text-primary)] outline-none transition duration-150",
              "focus:border-[var(--ma-brand)]/50 focus:ring-2 focus:ring-[var(--ma-brand)]/25",
              hasVoice ? "pr-12" : "pr-4",
            )}
            {...props}
          />
          {hasVoice && (
            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
              <VoiceSearchMicButton
                listening={voice.listening}
                disabled={voice.translating}
                onClick={() => void voice.toggle()}
              />
            </div>
          )}
        </form>
        {showVoiceStatus && (
          <VoiceSearchStatus
            listening={voice.listening}
            translating={voice.translating}
            error={voice.error}
            translation={voice.translation}
          />
        )}
      </div>
    );
  },
);
SearchBar.displayName = "SearchBar";
