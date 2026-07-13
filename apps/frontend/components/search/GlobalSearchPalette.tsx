"use client";

import { Link } from "@/i18n/navigation";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { SearchLanguageSelect } from "@/components/search/SearchLanguageSelect";
import { SearchResultCard } from "@/components/search/SearchResultCard";

import {
  buildGlobalSearchItems,
  buildPhoneFinderHref,
  hrefForSearchItem,
  iconForSearchItem,
  labelForSearchItem,
  loadGlobalSearchDevices,
  refreshGlobalSearchDevices,
  resetGlobalSearchDeviceCache,
  type GlobalSearchItem,
} from "@/features/phone-finder/global-search";
import { highlightParts } from "@/features/phone-finder/search-engine";
import {
  addLocalSearchHistory,
  clearLocalSearchHistory,
  getLocalSearchHistory,
  mergeSearchHistory,
  removeLocalSearchHistory,
  type SearchHistoryItem,
} from "@/features/phone-finder/search-history";
import type { PhoneFinderFilters, PriceCurrency } from "@/features/phone-finder/types";
import { planVoiceSearch } from "@/features/phone-finder/voice-search";
import { executeVoiceSearchPlan } from "@/features/phone-finder/execute-voice-search-plan";
import { VoiceSearchMicButton } from "@/components/search/VoiceSearchMicButton";
import { VoiceSearchStatus } from "@/components/search/VoiceSearchStatus";
import {
  addSearchHistory,
  addWishlistItem,
  clearSearchHistory,
  getDevices,
  getNews,
  getSearchHistory,
  getWishlist,
  removeSearchHistory,
  removeWishlistItem,
  type Device,
  type NewsArticle,
} from "@/lib/api";
import { useCompare } from "@/lib/compare-context";
import { usePreparedVoiceSearch } from "@/lib/use-prepared-voice-search";
import { useSearchLanguage } from "@/lib/use-search-language";
import { useSiteAuth } from "@/lib/site-auth";
import { displayBrandName } from "@/lib/brand-visuals";
import { resolveVisitorGeo } from "@/lib/visitor-geo";
import { cn } from "@/design-system/utils/cn";

const RECENT_KEY = "mobilearena:recent-devices";

type RecentDevice = { name: string; slug: string };

function readRecent(): RecentDevice[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentDevice[];
  } catch {
    return [];
  }
}

function sectionTitleForItem(item: GlobalSearchItem, hasQuery: boolean): string | null {
  switch (item.kind) {
    case "history":
      return "recentSearches";
    case "trending":
      return "trendingToday";
    case "recent":
      return "recentlyViewed";
    case "action":
      return "quickLinks";
    case "suggestion":
      return hasQuery ? "suggestions" : null;
    case "device":
      return hasQuery ? "devices" : null;
    case "news":
      return hasQuery ? "newsArticles" : null;
    default:
      return null;
  }
}

function shouldShowSectionHeader(
  item: GlobalSearchItem,
  prev: GlobalSearchItem | null,
  hasQuery: boolean,
): string | null {
  const title = sectionTitleForItem(item, hasQuery);
  if (!title) return null;
  if (!prev || prev.kind !== item.kind) return title;
  return null;
}

function searchQueryForItem(item: GlobalSearchItem, query: string): string | null {
  switch (item.kind) {
    case "history":
    case "trending":
      return item.query;
    case "suggestion":
      return item.suggestion.query;
    case "device":
      return query.trim() || item.device.name;
    case "news":
      return query.trim() || item.article.title;
    default:
      return null;
  }
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

export function GlobalSearchPalette({
  open,
  onClose,
  initialQuery = "",
  voiceOnOpen = false,
  onVoiceStarted,
}: {
  open: boolean;
  onClose: () => void;
  initialQuery?: string;
  voiceOnOpen?: boolean;
  onVoiceStarted?: () => void;
}) {
  const router = useRouter();
  const locale = useLocale();
  const tSearch = useTranslations("search");
  const compare = useCompare();
  const { user } = useSiteAuth();
  const { language: searchLanguage } = useSearchLanguage();
  const loggedIn = Boolean(user);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [devices, setDevices] = useState<Device[]>([]);
  const [newsHits, setNewsHits] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [currency, setCurrency] = useState<PriceCurrency>("USD");
  const [isMobile, setIsMobile] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState<number | null>(null);
  const [filterPatch, setFilterPatch] = useState<Partial<PhoneFinderFilters> | undefined>();

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchDevices = useCallback(
    () => getDevices(undefined, locale),
    [locale],
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
    if (!open) return;
    setQuery(initialQuery);
    setActiveIndex(0);
    setLoading(true);
    resetGlobalSearchDeviceCache();
    void loadGlobalSearchDevices(fetchDevices, locale)
      .then((cached) => {
        setDevices(cached);
        return refreshGlobalSearchDevices(fetchDevices, locale);
      })
      .then(setDevices)
      .catch(() => setDevices([]))
      .finally(() => setLoading(false));
    void loadHistory();
    void resolveVisitorGeo().then((geo) => {
      if (geo?.countryCode === "IN") setCurrency("INR");
    });
    if (loggedIn) {
      getWishlist()
        .then((items) => setWishlistIds(new Set(items.map((i) => i.device.id))))
        .catch(() => setWishlistIds(new Set()));
    } else {
      setWishlistIds(new Set());
    }
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open, initialQuery, loadHistory, loggedIn, fetchDevices, locale]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setNewsHits([]);
      return;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      void getNews({ locale, search: q })
        .then((articles) => {
          if (active) setNewsHits(articles.slice(0, 6));
        })
        .catch(() => {
          if (active) setNewsHits([]);
        });
    }, 220);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [open, query, locale]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const recentDevices = useMemo(() => (open ? readRecent() : []), [open]);

  const items = useMemo(
    () =>
      buildGlobalSearchItems({
        query,
        devices,
        history,
        recentDevices,
        currency,
        isMobile,
        filterPatch,
        news: newsHits,
      }),
    [query, devices, history, recentDevices, currency, isMobile, filterPatch, searchLanguage, newsHits],
  );

  const hasQuery = Boolean(query.trim());

  useEffect(() => {
    setActiveIndex(0);
  }, [query, items.length]);

  useEffect(() => {
    itemRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const recordSearch = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) return;
      const local = addLocalSearchHistory(trimmed);
      if (loggedIn) {
        try {
          await addSearchHistory(trimmed);
          await loadHistory();
        } catch {
          setHistory(local);
        }
      } else {
        setHistory(local);
      }
    },
    [loggedIn, loadHistory],
  );

  const navigateToItem = useCallback(
    async (item: GlobalSearchItem) => {
      const recordQ = searchQueryForItem(item, query);
      if (recordQ) await recordSearch(recordQ);
      router.push(hrefForSearchItem(item, currency));
      onClose();
    },
    [query, currency, onClose, recordSearch, router],
  );

  const submitQuery = useCallback(async () => {
    const q = query.trim();
    if (!q) return;
    await recordSearch(q);
    router.push(buildPhoneFinderHref(q, undefined, currency));
    onClose();
  }, [query, currency, onClose, recordSearch, router]);

  const handleVoicePrepared = useCallback(
    async (prepared: { searchText: string; translated: boolean }) => {
      const searchLang = prepared.translated ? "en" : searchLanguage;
      const plan = planVoiceSearch(
        prepared.searchText,
        devices,
        currency,
        searchLang,
      );

      await executeVoiceSearchPlan(plan, {
        onSearch: async (q, patch) => {
          setQuery(q);
          setFilterPatch(patch);
          await recordSearch(q);
        },
        onNavigate: (path) => {
          router.push(path);
          onClose();
        },
        onCompare: async (compareDevices) => {
          await recordSearch(prepared.searchText);
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
          onClose();
        },
      });
    },
    [compare, currency, devices, onClose, recordSearch, router, searchLanguage],
  );

  const voice = usePreparedVoiceSearch({
    lang: searchLanguage,
    onPrepared: handleVoicePrepared,
  });

  useEffect(() => {
    if (!open || !voiceOnOpen || !voice.supported) return;
    void voice.toggle();
    onVoiceStarted?.();
  }, [open, voiceOnOpen, voice.supported, voice.toggle, onVoiceStarted]);

  const toggleVoice = useCallback(() => {
    void voice.toggle();
  }, [voice]);

  useEffect(() => {
    if (!open) {
      voice.stop();
      voice.clearStatus();
      setFilterPatch(undefined);
    }
  }, [open, voice]);

  const removeHistoryItem = useCallback(
    async (id: string) => {
      const local = removeLocalSearchHistory(id);
      setHistory(local);
      if (loggedIn && /^\d+$/.test(id)) {
        try {
          const remote = await removeSearchHistory(Number(id));
          setHistory(mergeSearchHistory(local, remote));
        } catch {
          /* keep local state */
        }
      }
    },
    [loggedIn],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, items.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && items[activeIndex]) {
        e.preventDefault();
        void navigateToItem(items[activeIndex]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items, activeIndex, navigateToItem, onClose]);

  async function toggleWishlist(device: Device) {
    if (!loggedIn) {
      router.push("/login");
      onClose();
      return;
    }
    setWishlistBusy(device.id);
    try {
      if (wishlistIds.has(device.id)) {
        await removeWishlistItem(device.id);
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(device.id);
          return next;
        });
      } else {
        await addWishlistItem(device.id, { alertEnabled: true });
        setWishlistIds((prev) => new Set(prev).add(device.id));
      }
    } finally {
      setWishlistBusy(null);
    }
  }

  if (!open || !mounted) return null;

  const palette = (
    <div
      className="fixed inset-0 z-[90] flex flex-col bg-[var(--surface-elevated)] sm:items-center sm:justify-start sm:bg-black/60 sm:px-4 sm:pt-[10vh] sm:backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Global search"
    >
      <button
        type="button"
        className="absolute inset-0 hidden sm:block"
        aria-label="Close search"
        onClick={onClose}
      />

      <div className="relative flex h-full w-full flex-col sm:h-auto sm:max-h-[min(85vh,760px)] sm:max-w-xl sm:rounded-2xl sm:border sm:border-white/10 sm:bg-[var(--surface-elevated)] sm:shadow-2xl">
        <div className="flex items-center gap-2 border-b border-white/10 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4 sm:pt-3">
          <Search size={18} className="shrink-0 text-[var(--text-secondary)]" />
          <input
            ref={inputRef}
            type="text"
            inputMode="search"
            enterKeyHint="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setFilterPatch(undefined);
              voice.clearStatus();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !items[activeIndex]) {
                e.preventDefault();
                void submitQuery();
              }
            }}
            placeholder={tSearch("placeholder")}
            className="min-h-[44px] min-w-0 flex-1 bg-transparent text-base text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
            autoComplete="off"
          />
          <VoiceSearchMicButton
            listening={voice.listening}
            disabled={!voice.supported || voice.translating}
            onClick={toggleVoice}
            className="arena-icon-btn min-h-[44px] min-w-[44px]"
            size={18}
          />
          <button
            type="button"
            onClick={onClose}
            className="arena-icon-btn min-h-[44px] min-w-[44px] shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <VoiceSearchStatus
          listening={voice.listening}
          translating={voice.translating}
          error={voice.error}
          translation={voice.translation}
          className="border-b border-white/5 px-4 py-2"
        />

        <div className="flex-1 overflow-y-auto overscroll-contain px-2 py-2 sm:px-3">
          {loading ? (
            <p className="px-3 py-6 text-sm text-[var(--text-secondary)]">{tSearch("loadingCatalog")}</p>
          ) : items.length === 0 ? (
            <p className="px-3 py-6 text-sm text-[var(--text-secondary)]">
              {tSearch("noMatches")}
            </p>
          ) : (
            <ul className="space-y-1">
              {items.map((item, index) => {
                const rawLabel = labelForSearchItem(item);
                const brandLabel =
                  item.kind === "suggestion" && item.suggestion.kind === "brand"
                    ? displayBrandName(rawLabel)
                    : item.kind === "device" && item.device.brand?.name
                      ? displayBrandName(item.device.brand.name)
                      : item.kind === "suggestion" &&
                          item.suggestion.kind === "device" &&
                          item.suggestion.sublabel
                        ? displayBrandName(item.suggestion.sublabel)
                        : null;
                const label =
                  item.kind === "suggestion" && item.suggestion.kind === "brand"
                    ? (brandLabel ?? rawLabel)
                    : rawLabel;
                const sublabel =
                  item.kind === "device"
                    ? brandLabel
                    : item.kind === "news"
                      ? tSearch("news")
                      : item.kind === "suggestion"
                      ? item.suggestion.kind === "device"
                        ? (brandLabel ?? item.suggestion.sublabel)
                        : item.suggestion.sublabel
                      : item.kind === "history"
                        ? tSearch("recentSearch")
                        : item.kind === "trending"
                          ? tSearch("trendingToday")
                          : item.kind === "recent"
                            ? tSearch("recentlyViewed")
                            : undefined;
                const sectionHeaderKey = shouldShowSectionHeader(
                  item,
                  index > 0 ? items[index - 1] : null,
                  hasQuery,
                );
                const sectionHeader = sectionHeaderKey
                  ? tSearch(sectionHeaderKey as "recentSearches")
                  : null;

                return (
                  <li
                    key={item.id}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                  >
                    {sectionHeader && (
                      <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                        {sectionHeader}
                      </p>
                    )}

                    {item.kind === "device" ? (
                      <SearchResultCard
                        device={item.device}
                        currency={currency}
                        active={index === activeIndex}
                        inWishlist={wishlistIds.has(item.device.id)}
                        wishlistBusy={wishlistBusy === item.device.id}
                        inCompare={compare.has(item.device.slug)}
                        compareDisabled={
                          compare.isFull && !compare.has(item.device.slug)
                        }
                        onMouseEnter={() => setActiveIndex(index)}
                        onOpen={() => void navigateToItem(item)}
                        onWishlist={() => void toggleWishlist(item.device)}
                        onCompare={() =>
                          compare.toggle({
                            id: item.device.id,
                            slug: item.device.slug,
                            name: item.device.name,
                          })
                        }
                        onQuickView={() => void navigateToItem(item)}
                      />
                    ) : (
                    <div
                      className={cn(
                        "flex items-center gap-2 rounded-xl transition",
                        index === activeIndex
                          ? "bg-[var(--arena-blue)]/20"
                          : "hover:bg-white/5",
                      )}
                    >
                      <button
                        type="button"
                        className="flex min-h-[44px] min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-start"
                        onMouseDown={(e) => e.preventDefault()}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => void navigateToItem(item)}
                      >
                        <span className="shrink-0 text-base">{iconForSearchItem(item)}</span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-[var(--text-primary)]">
                            <HighlightText text={label} query={query} />
                          </span>
                          {sublabel && (
                            <span className="block truncate text-xs text-[var(--text-secondary)]">
                              {sublabel}
                            </span>
                          )}
                        </span>
                      </button>

                      {item.kind === "history" && !hasQuery && (
                        <button
                          type="button"
                          title="Remove from history"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={(e) => {
                            e.stopPropagation();
                            void removeHistoryItem(item.id.replace(/^h-/, ""));
                          }}
                          className="me-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-white/10 hover:text-[var(--rose-alert)]"
                          aria-label="Remove from history"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {!hasQuery && history.length > 0 && (
            <div className="mt-2 flex justify-end border-t border-white/5 px-3 pt-2">
              <button
                type="button"
                className="min-h-[44px] text-xs text-[var(--text-secondary)] hover:text-[var(--rose-alert)]"
                onClick={async () => {
                  clearLocalSearchHistory();
                  if (loggedIn) {
                    try {
                      await clearSearchHistory();
                    } catch {
                      /* ignore */
                    }
                  }
                  setHistory([]);
                }}
              >
                Clear search history
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] text-[10px] text-[var(--text-secondary)] sm:text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>
              <kbd className="rounded border border-white/10 px-1">↑↓</kbd> navigate ·{" "}
              <kbd className="rounded border border-white/10 px-1">↵</kbd> open ·{" "}
              <kbd className="rounded border border-white/10 px-1">esc</kbd> close
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <SearchLanguageSelect />
              <Link
                href="/phone-finder"
                onClick={onClose}
                className="font-semibold text-[var(--electric-cyan)] hover:underline"
              >
                Advanced filters →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(palette, document.body);
}
