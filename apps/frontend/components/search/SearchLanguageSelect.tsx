"use client";

import { Languages } from "lucide-react";

import {
  detectBrowserSearchLanguage,
  SEARCH_LANGUAGES,
  languageLabel,
  type SearchLanguageCode,
} from "@/features/phone-finder/search-locale";
import { useSearchLanguage } from "@/lib/use-search-language";
import { cn } from "@/design-system/utils/cn";

export function SearchLanguageSelect({ className }: { className?: string }) {
  const { language, setLanguage } = useSearchLanguage();

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
        title={languageLabel(language)}
      >
        {SEARCH_LANGUAGES.map((entry) => (
          <option key={entry.code} value={entry.code} className="bg-[var(--surface-elevated)] text-[var(--text-primary)]">
            {entry.code === "auto"
              ? `Auto (${SEARCH_LANGUAGES.find((l) => l.code === detectBrowserSearchLanguage())?.nativeLabel ?? "English"})`
              : entry.nativeLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
