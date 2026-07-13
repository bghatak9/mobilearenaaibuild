"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { Check, Languages, Search, Star, X } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  getSiteLanguages,
  type SiteLanguage,
  type SiteLanguageCode,
} from "@/features/i18n";
import { matchesLocaleSearch } from "@/i18n/locale-search";
import { useSiteLanguage } from "@/lib/site-language";
import { cn } from "@/design-system/utils/cn";

const PANEL_WIDTH = 352;
const PANEL_GAP = 8;
const PANEL_MAX_H = 320;

const RECENT_KEY = "mobilearena:recent-locales";
const FAVORITES_KEY = "mobilearena:favorite-locales";
const MAX_RECENT = 6;

type SiteLanguageSelectProps = {
  className?: string;
  variant?: "desktop" | "mobile" | "drawer";
};

function readList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((x) => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

function writeList(key: string, values: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(values));
  } catch {
    /* ignore */
  }
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide opacity-50">
      {children}
    </p>
  );
}

function LocaleOptionRow({
  id,
  entry,
  selected,
  favorite,
  highlighted,
  onSelect,
  onToggleFavorite,
  onHighlight,
  addFavoriteLabel,
  removeFavoriteLabel,
}: {
  id: string;
  entry: SiteLanguage;
  selected: boolean;
  favorite: boolean;
  highlighted: boolean;
  onSelect: (code: SiteLanguageCode) => void;
  onToggleFavorite: (code: string, e: MouseEvent) => void;
  onHighlight?: () => void;
  addFavoriteLabel: string;
  removeFavoriteLabel: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-1 px-1 py-0.5",
        highlighted && "bg-[var(--surface-muted)]",
      )}
      onMouseEnter={onHighlight}
    >
      <div
        id={id}
        role="option"
        aria-selected={selected}
        tabIndex={-1}
        className={cn(
          "flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm",
          selected && "font-medium",
        )}
        onClick={() => onSelect(entry.code)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(entry.code);
          }
        }}
      >
        <span className="min-w-0 flex-1 truncate notranslate" translate="no">
          <span className="block truncate">{entry.nativeLabel}</span>
          <span className="block truncate text-[11px] opacity-55">
            {entry.label}
            {entry.region ? ` · ${entry.region}` : ""}
            {" · "}
            {entry.code}
          </span>
        </span>
        {selected ? <Check size={14} className="shrink-0 opacity-70" aria-hidden /> : null}
      </div>
      <button
        type="button"
        className={cn(
          "rounded p-1 opacity-50 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--electric-cyan)]",
          favorite && "opacity-100 text-amber-400",
        )}
        aria-label={favorite ? removeFavoriteLabel : addFavoriteLabel}
        onClick={(e) => onToggleFavorite(entry.code, e)}
      >
        <Star size={13} fill={favorite ? "currentColor" : "none"} aria-hidden />
      </button>
    </div>
  );
}

/** Accessible language combobox — all config locales, searchable aliases. */
export function SiteLanguageSelect({
  className,
  variant = "desktop",
}: SiteLanguageSelectProps) {
  const { language, setLanguage, t } = useSiteLanguage();
  const tp = useTranslations("languagePicker");
  const compact = variant === "desktop" || variant === "mobile";
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({
    position: "fixed",
    top: 0,
    left: 0,
    width: PANEL_WIDTH,
  });
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const languages = useMemo(() => {
    const list = getSiteLanguages();
    return [...list].sort((a, b) => {
      if (a.code === "en") return -1;
      if (b.code === "en") return 1;
      return a.nativeLabel.localeCompare(b.nativeLabel, "en", {
        sensitivity: "base",
      });
    });
  }, []);

  const current =
    languages.find((e) => e.code === language) ?? languages[0]!;

  useEffect(() => {
    setRecent(readList(RECENT_KEY));
    setFavorites(readList(FAVORITES_KEY));
  }, []);

  const updatePanelPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const width = Math.min(PANEL_WIDTH, window.innerWidth - 24);
    const spaceBelow = window.innerHeight - rect.bottom - PANEL_GAP;
    const spaceAbove = rect.top - PANEL_GAP;
    const openAbove =
      spaceBelow < Math.min(PANEL_MAX_H, 240) && spaceAbove > spaceBelow;
    const maxHeight = Math.max(
      160,
      Math.min(PANEL_MAX_H, openAbove ? spaceAbove : spaceBelow),
    );
    let left = rect.right - width;
    left = Math.max(12, Math.min(left, window.innerWidth - width - 12));
    const top = openAbove
      ? Math.max(12, rect.top - PANEL_GAP - maxHeight)
      : rect.bottom + PANEL_GAP;
    setPanelStyle({
      position: "fixed",
      top,
      left,
      width,
      maxHeight: maxHeight + 48,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePanelPosition();
    const onReposition = () => updatePanelPosition();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, updatePanelPosition]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: Event) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
      setQuery("");
      window.setTimeout(() => triggerRef.current?.focus(), 0);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (open) {
      setHighlight(0);
      window.setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open]);

  const filtered = useMemo(() => {
    return languages.filter((e) => matchesLocaleSearch(e, query));
  }, [languages, query]);

  const popular = useMemo(
    () => languages.filter((e) => e.popular),
    [languages],
  );

  const recentEntries = useMemo(
    () =>
      recent
        .map((code) => languages.find((e) => e.code === code))
        .filter(Boolean) as SiteLanguage[],
    [languages, recent],
  );

  const favoriteEntries = useMemo(
    () =>
      favorites
        .map((code) => languages.find((e) => e.code === code))
        .filter(Boolean) as SiteLanguage[],
    [favorites, languages],
  );

  const searching = Boolean(query.trim());

  const flatOptions = useMemo(() => {
    if (searching) return filtered;
    const seen = new Set<string>();
    const out: SiteLanguage[] = [];
    for (const group of [favoriteEntries, recentEntries, popular, filtered]) {
      for (const entry of group) {
        if (seen.has(entry.code)) continue;
        seen.add(entry.code);
        out.push(entry);
      }
    }
    return out;
  }, [
    favoriteEntries,
    filtered,
    popular,
    recentEntries,
    searching,
  ]);

  const select = useCallback(
    (code: SiteLanguageCode) => {
      setLanguage(code);
      const nextRecent = [code, ...recent.filter((c) => c !== code)].slice(
        0,
        MAX_RECENT,
      );
      setRecent(nextRecent);
      writeList(RECENT_KEY, nextRecent);
      setOpen(false);
      setQuery("");
      window.setTimeout(() => triggerRef.current?.focus(), 0);
    },
    [recent, setLanguage],
  );

  const closePanel = useCallback(() => {
    setOpen(false);
    setQuery("");
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);

  const toggleFavorite = useCallback(
    (code: string, e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const next = favorites.includes(code)
        ? favorites.filter((c) => c !== code)
        : [code, ...favorites].slice(0, 12);
      setFavorites(next);
      writeList(FAVORITES_KEY, next);
    },
    [favorites],
  );

  const onKeyDown = (e: KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      closePanel();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) =>
        Math.min(h + 1, Math.max(flatOptions.length - 1, 0)),
      );
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const choice = flatOptions[highlight];
      if (choice) select(choice.code);
    }
  };

  const favLabels = {
    addFavoriteLabel: tp("addFavorite"),
    removeFavoriteLabel: tp("removeFavorite"),
  };

  const panel =
    open && portalReady
      ? createPortal(
          <div
            ref={panelRef}
            id={listId}
            role="listbox"
            aria-label={t("action.language")}
            className="arena-site-language__panel notranslate fixed z-[220] overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-xl"
            style={panelStyle}
            translate="no"
          >
            <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] px-3 py-2">
              <Search size={14} className="shrink-0 opacity-60" aria-hidden />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlight(0);
                }}
                placeholder={tp("search")}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none focus-visible:outline-none"
                role="combobox"
                aria-expanded={open}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={
                  flatOptions[highlight]
                    ? `${listId}-opt-${flatOptions[highlight]!.code}`
                    : undefined
                }
              />
              <button
                type="button"
                className="rounded p-1 opacity-70 hover:opacity-100"
                aria-label={tp("close")}
                onClick={closePanel}
              >
                <X size={14} />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto py-1">
              {searching ? (
                <>
                  <SectionLabel>{tp("matches", { count: filtered.length })}</SectionLabel>
                  {flatOptions.length === 0 ? (
                    <p className="px-3 py-4 text-sm opacity-60">{tp("empty")}</p>
                  ) : (
                    flatOptions.map((entry, index) => (
                      <LocaleOptionRow
                        key={entry.code}
                        id={`${listId}-opt-${entry.code}`}
                        entry={entry}
                        selected={entry.code === language}
                        favorite={favorites.includes(entry.code)}
                        highlighted={index === highlight}
                        onSelect={select}
                        onToggleFavorite={toggleFavorite}
                        onHighlight={() => setHighlight(index)}
                        {...favLabels}
                      />
                    ))
                  )}
                </>
              ) : (
                <>
                  {favoriteEntries.length > 0 ? (
                    <>
                      <SectionLabel>{tp("favorites")}</SectionLabel>
                      {favoriteEntries.map((entry) => (
                        <LocaleOptionRow
                          key={`fav-${entry.code}`}
                          id={`${listId}-opt-${entry.code}`}
                          entry={entry}
                          selected={entry.code === language}
                          favorite
                          highlighted={false}
                          onSelect={select}
                          onToggleFavorite={toggleFavorite}
                          {...favLabels}
                        />
                      ))}
                    </>
                  ) : null}
                  {recentEntries.length > 0 ? (
                    <>
                      <SectionLabel>{tp("recent")}</SectionLabel>
                      {recentEntries.map((entry) => (
                        <LocaleOptionRow
                          key={`recent-${entry.code}`}
                          id={`${listId}-opt-${entry.code}`}
                          entry={entry}
                          selected={entry.code === language}
                          favorite={favorites.includes(entry.code)}
                          highlighted={false}
                          onSelect={select}
                          onToggleFavorite={toggleFavorite}
                          {...favLabels}
                        />
                      ))}
                    </>
                  ) : null}
                  {popular.length > 0 ? (
                    <>
                      <SectionLabel>{tp("popular")}</SectionLabel>
                      {popular.map((entry) => (
                        <LocaleOptionRow
                          key={`pop-${entry.code}`}
                          id={`${listId}-opt-${entry.code}`}
                          entry={entry}
                          selected={entry.code === language}
                          favorite={favorites.includes(entry.code)}
                          highlighted={false}
                          onSelect={select}
                          onToggleFavorite={toggleFavorite}
                          {...favLabels}
                        />
                      ))}
                    </>
                  ) : null}
                  <SectionLabel>
                    {tp("all", { count: languages.length })}
                  </SectionLabel>
                  {languages.map((entry, index) => {
                    const optionIndex =
                      favoriteEntries.length +
                      recentEntries.length +
                      popular.length +
                      index;
                    return (
                      <LocaleOptionRow
                        key={`all-${entry.code}`}
                        id={`${listId}-opt-${entry.code}`}
                        entry={entry}
                        selected={entry.code === language}
                        favorite={favorites.includes(entry.code)}
                        highlighted={optionIndex === highlight}
                        onSelect={select}
                        onToggleFavorite={toggleFavorite}
                        onHighlight={() => setHighlight(optionIndex)}
                        {...favLabels}
                      />
                    );
                  })}
                </>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      ref={rootRef}
      className={cn(
        "arena-site-language notranslate relative",
        variant === "desktop" && "arena-site-language--desktop",
        variant === "mobile" && "arena-site-language--mobile",
        variant === "drawer" && "arena-site-language--drawer",
        className,
      )}
      translate="no"
      onKeyDown={onKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        className="arena-site-language__select flex items-center gap-1.5"
        aria-label={t("action.language")}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        title={t("action.language")}
        onClick={() => setOpen((v) => !v)}
      >
        <Languages size={compact ? 16 : 15} className="shrink-0" aria-hidden />
        <span
          className="truncate max-w-[7.5rem] text-start"
          suppressHydrationWarning
        >
          {current.nativeLabel}
        </span>
      </button>
      {panel}
    </div>
  );
}
