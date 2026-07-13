"use client";

import { Languages } from "lucide-react";

import {
  detectBrowserSearchLanguage,
  SEARCH_LANGUAGES,
  languageLabel,
  type SearchLanguageCode,
} from "@/features/phone-finder/search-locale";
import { useClientMounted } from "@/hooks/useClientMounted";
import { useSearchLanguage } from "@/lib/use-search-language";
import { cn } from "@/design-system/utils/cn";

function autoLanguageLabel(mounted: boolean): string {
  if (!mounted) return "Auto";
  return `Auto (${languageLabel(detectBrowserSearchLanguage())})`;
}

export function SearchLanguageSelect({ className }: { className?: string }) {
  const { language, setLanguage } = useSearchLanguage();
  const mounted = useClientMounted();

  return (
    <label
      className={cn(
        "inline-flex min-h-[40px] w-full items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 text-xs text-[var(--text-secondary)]",
        className,
      )}
    >
      <Languages size={14} className="shrink-0" aria-hidden />
      <span className="sr-only">Search language</span>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as SearchLanguageCode)}
        className="min-w-0 flex-1 cursor-pointer bg-transparent text-xs font-medium text-[var(--text-primary)] outline-none"
        aria-label="Search language"
        title={
          language === "auto"
            ? autoLanguageLabel(mounted)
            : languageLabel(language)
        }
        suppressHydrationWarning
      >
        {SEARCH_LANGUAGES.map((entry) => (
          <option
            key={entry.code}
            value={entry.code}
            className="bg-[var(--surface-elevated)] text-[var(--text-primary)]"
            suppressHydrationWarning={entry.code === "auto"}
          >
            {entry.code === "auto"
              ? autoLanguageLabel(mounted)
              : entry.nativeLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
