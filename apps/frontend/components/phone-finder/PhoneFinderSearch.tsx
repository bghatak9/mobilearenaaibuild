"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Clock, Search, TrendingUp, X } from "lucide-react";

import { VoiceSearchMicButton } from "@/components/search/VoiceSearchMicButton";
import { VoiceSearchStatus } from "@/components/search/VoiceSearchStatus";
import {
  buildSearchSuggestions,
  getDailyTrendingSearches,
  highlightParts,
  type SearchSuggestion,
} from "@/features/phone-finder/search-engine";
import { executeVoiceSearchPlan } from "@/features/phone-finder/execute-voice-search-plan";
import { planVoiceSearch } from "@/features/phone-finder/voice-search";
import {
  addLocalSearchHistory,
  clearLocalSearchHistory,
  getLocalSearchHistory,
  mergeSearchHistory,
  removeLocalSearchHistory,
  type SearchHistoryItem,
} from "@/features/phone-finder/search-history";
import type { PhoneFinderFilters } from "@/features/phone-finder/types";
import {
  addSearchHistory,
  clearSearchHistory,
  getSearchHistory,
  getToken,
  removeSearchHistory,
  type Device,
} from "@/lib/api";
import { cn } from "@/design-system/utils/cn";
import { SearchLanguageSelect } from "@/components/search/SearchLanguageSelect";
import { useCompare } from "@/lib/compare-context";
import { usePreparedVoiceSearch } from "@/lib/use-prepared-voice-search";
import { useSearchLanguage } from "@/lib/use-search-language";

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

function HighlightText({ text, query }: { text: string; query: string }) {
  const parts = highlightParts(text, query);
  return (
    <>
      {parts.map((part, i) =>
        part.match ? (
          <mark
            key={i}
            className="rounded bg-[var(--electric-cyan)]/25 text-[var(--electric-cyan)]"
          >
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  );
}

export function PhoneFinderSearch({
  value,
  devices,
  brands,
  filters,
  onChange,
  onCommit,
  onApplySuggestion,
  onFocusChange,
  className,
  layout = "default",
}: {
  value: string;
  devices: Device[];
  brands: string[];
  filters: PhoneFinderFilters;
  onChange: (query: string) => void;
  onCommit: (query: string) => void;
  onApplySuggestion: (query: string, patch?: Partial<PhoneFinderFilters>) => void;
  onFocusChange?: (focused: boolean) => void;
  className?: string;
  layout?: "default" | "sidebar";
}) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const compare = useCompare();
  const { language: searchLanguage } = useSearchLanguage();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const debouncedValue = useDebouncedValue(value, 400);
  const loggedIn = Boolean(getToken());

  const suggestionLimit = isMobile ? 5 : 8;
  const trending = useMemo(
    () => getDailyTrendingSearches(filters.priceCurrency),
    [filters.priceCurrency],
  );

  const loadHistory = useCallback(async () => {
    const local = getLocalSearchHistory();
    if (!loggedIn) {
      setHistory(local);
      return;
    }
    try {
      const remote = await getSearchHistory();
      setHistory(mergeSearchHistory(local, remote));
    } catch {
      setHistory(local);
    }
  }, [loggedIn]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    onCommit(debouncedValue);
  }, [debouncedValue, onCommit]);

  const suggestions = useMemo(
    () =>
      buildSearchSuggestions(value, devices, brands, {
        history: history.map((h) => h.query),
        trending,
        currency: filters.priceCurrency,
        limit: suggestionLimit,
      }),
    [value, devices, brands, history, trending, filters.priceCurrency, suggestionLimit],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [value, suggestions.length]);

  const applySuggestion = useCallback(
    async (suggestion: SearchSuggestion) => {
      onChange(suggestion.query);
      onApplySuggestion(suggestion.query, suggestion.patch);
      setOpen(false);

      const local = addLocalSearchHistory(suggestion.query);
      if (loggedIn) {
        try {
          await addSearchHistory(suggestion.query);
          await loadHistory();
        } catch {
          setHistory(local);
        }
      } else {
        setHistory(local);
      }
    },
    [loggedIn, loadHistory, onChange, onApplySuggestion],
  );

  const handleVoicePrepared = useCallback(
    async (prepared: { searchText: string; translated: boolean }) => {
      const searchLang = prepared.translated ? "en" : searchLanguage;
      const plan = planVoiceSearch(
        prepared.searchText,
        devices,
        filters.priceCurrency,
        searchLang,
      );

      await executeVoiceSearchPlan(plan, {
        onSearch: async (query, patch) => {
          onChange(query);
          onApplySuggestion(query, patch);
          setOpen(false);
          const local = addLocalSearchHistory(query);
          if (loggedIn) {
            try {
              await addSearchHistory(query);
              await loadHistory();
            } catch {
              setHistory(local);
            }
          } else {
            setHistory(local);
          }
        },
        onNavigate: (path) => router.push(path),
        onCompare: async (compareDevices) => {
          for (const device of compareDevices) {
            if (!compare.has(device.slug)) {
              compare.toggle({
                id: device.id,
                slug: device.slug,
                name: device.name,
              });
            }
          }
          router.push(
            `/compare/${compareDevices.map((d) => d.slug).join("-vs-")}`,
          );
        },
      });
    },
    [
      compare,
      devices,
      filters.priceCurrency,
      loadHistory,
      loggedIn,
      onApplySuggestion,
      onChange,
      router,
      searchLanguage,
    ],
  );

  const voice = usePreparedVoiceSearch({
    lang: searchLanguage,
    onPrepared: handleVoicePrepared,
  });

  const commitCurrent = useCallback(async () => {
    const q = value.trim();
    onCommit(q);
    setOpen(false);

    if (!q) return;

    const local = addLocalSearchHistory(q);
    if (loggedIn) {
      try {
        await addSearchHistory(q);
        await loadHistory();
      } catch {
        setHistory(local);
      }
    } else {
      setHistory(local);
    }
  }, [value, onCommit, loggedIn, loadHistory]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = suggestions[activeIndex];
      if (pick && open) void applySuggestion(pick);
      else void commitCurrent();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  async function handleClearHistory() {
    const local = clearLocalSearchHistory();
    if (loggedIn) {
      try {
        await clearSearchHistory();
      } catch {
        /* ignore */
      }
    }
    setHistory(local);
  }

  async function handleRemoveHistory(id: string) {
    const local = removeLocalSearchHistory(id);
    if (loggedIn && !id.startsWith("local-")) {
      try {
        await removeSearchHistory(Number(id));
      } catch {
        /* ignore */
      }
    }
    setHistory(local);
    void loadHistory();
  }

  const showPanel = open && (value.trim().length > 0 || history.length > 0);
  const isSidebar = layout === "sidebar";

  return (
    <div ref={panelRef} className={cn("relative w-full", className)}>
      <div className={cn(isSidebar ? "space-y-2" : "flex items-start gap-2")}>
        <div className="relative min-w-0 flex-1">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void commitCurrent();
            }}
            className="relative"
          >
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
              aria-hidden
            />
            <input
              ref={inputRef}
              type="text"
              inputMode="search"
              enterKeyHint="search"
              value={value}
              onChange={(e) => {
                voice.clearStatus();
                onChange(e.target.value);
                setOpen(true);
              }}
              onFocus={() => {
                onFocusChange?.(true);
                setOpen(true);
              }}
              onBlur={() => onFocusChange?.(false)}
              onKeyDown={handleInputKeyDown}
              placeholder={
                isSidebar
                  ? "Search device…"
                  : "Search phones, brands, specs… try brand:samsung ram:8"
              }
              role="combobox"
              aria-expanded={showPanel}
              aria-controls={listId}
              aria-autocomplete="list"
              className={cn(
                "w-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] pl-10 text-sm text-[var(--text-primary)] outline-none transition duration-150",
                isSidebar ? "rounded-xl py-2.5" : "rounded-full py-2.5",
                voice.supported ? (value ? "pr-[4.5rem]" : "pr-11") : "pr-4",
                "focus:border-[var(--ma-brand)]/50 focus:ring-2 focus:ring-[var(--ma-brand)]/25",
              )}
            />
            {voice.supported && (
              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center">
                <VoiceSearchMicButton
                  listening={voice.listening}
                  disabled={voice.translating}
                  onClick={() => void voice.toggle()}
                />
              </div>
            )}
            {value && (
              <button
                type="button"
                onClick={() => {
                  voice.clearStatus();
                  onChange("");
                  onCommit("");
                  inputRef.current?.focus();
                }}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                  voice.supported ? "right-10" : "right-3",
                )}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </form>

          {showPanel && (
            <div
              id={listId}
              role="listbox"
              className={cn(
                "absolute z-50 mt-2 max-h-[min(70vh,420px)] overflow-y-auto rounded-2xl border border-white/10 bg-[var(--surface-elevated)] shadow-2xl",
                isSidebar ? "left-0 right-0 w-full" : "w-full",
              )}
            >
          {!value.trim() && history.length > 0 && (
            <div className="border-b border-white/5 p-2">
              <div className="flex items-center justify-between px-2 py-1">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                  <Clock size={12} />
                  Recent searches
                </p>
                <button
                  type="button"
                  onClick={() => void handleClearHistory()}
                  className="text-[10px] text-[var(--text-secondary)] hover:text-[var(--rose-alert)]"
                >
                  Clear all
                </button>
              </div>
              {history.slice(0, isMobile ? 5 : 8).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-1 rounded-xl hover:bg-white/5"
                >
                  <button
                    type="button"
                    role="option"
                    className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-primary)]"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() =>
                      void applySuggestion({
                        id: item.id,
                        label: item.query,
                        kind: "history",
                        icon: "🕐",
                        query: item.query,
                      })
                    }
                  >
                    <span>🕐</span>
                    {item.query}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleRemoveHistory(item.id)}
                    className="shrink-0 px-2 text-[var(--text-secondary)] hover:text-[var(--rose-alert)]"
                    aria-label={`Remove ${item.query}`}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {!value.trim() && (
            <div className="border-b border-white/5 p-2">
              <p className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                <TrendingUp size={12} className="text-[var(--electric-cyan)]" />
                Trending today
              </p>
              {trending.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="option"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-white/5"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    void applySuggestion({
                      id: `trend-${item}`,
                      label: item,
                      kind: "trending",
                      icon: "🔥",
                      query: item,
                    })
                  }
                >
                  <span>🔥</span>
                  {item}
                </button>
              ))}
            </div>
          )}

          {value.trim().length > 0 && (
            <div className="p-2">
              {suggestions.length === 0 ? (
                <p className="px-3 py-4 text-sm text-[var(--text-secondary)]">
                  No suggestions — press Enter to search
                </p>
              ) : (
                suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-xl px-3 py-2 text-left transition",
                      index === activeIndex
                        ? "bg-[var(--arena-blue)]/20"
                        : "hover:bg-white/5",
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => void applySuggestion(suggestion)}
                  >
                    <span className="mt-0.5 shrink-0">{suggestion.icon}</span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-[var(--text-primary)]">
                        <HighlightText text={suggestion.label} query={value} />
                      </span>
                      {suggestion.sublabel && (
                        <span className="block text-xs text-[var(--text-secondary)]">
                          {suggestion.sublabel}
                        </span>
                      )}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}

          {value.trim().length > 0 && !isSidebar && (
            <div className="border-t border-white/5 px-3 py-2 text-[10px] text-[var(--text-secondary)]">
              Advanced: brand:samsung ram:8 price:&lt;30000 display:amoled camera:ois
            </div>
          )}
            </div>
          )}
        </div>
        {!isSidebar ? <SearchLanguageSelect className="mt-0.5 shrink-0" /> : null}
      </div>
      {isSidebar ? (
        <SearchLanguageSelect className="w-full justify-between px-1" />
      ) : null}
      <VoiceSearchStatus
        listening={voice.listening}
        translating={voice.translating}
        error={voice.error}
        translation={voice.translation}
        className="mt-2 px-1"
      />
    </div>
  );
}
