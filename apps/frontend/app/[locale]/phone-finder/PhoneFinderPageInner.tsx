"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

import { LifestyleCategoriesBar } from "@/components/phone-finder/LifestyleCategoriesBar";
import { AiHubPanel } from "@/components/phone-finder/AiHubPanel";
import { PhoneFinderFilterPanel } from "@/components/phone-finder/FilterPanel";
import { PresetChips } from "@/components/phone-finder/PresetChips";
import { PhoneFinderSearch } from "@/components/phone-finder/PhoneFinderSearch";
import { PollsReviewsPanel } from "@/components/phone-finder/PollsReviewsPanel";
import { TrendingSearches } from "@/components/phone-finder/TrendingSearches";
import PhoneGrid from "@/components/phone/PhoneGrid";
import { Button } from "@/design-system/buttons/Button";
import { Skeleton } from "@/design-system/feedback/Skeleton";
import { Breadcrumbs } from "@/design-system/navigation/Breadcrumbs";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import { Modal } from "@/design-system/modals/Modal";
import {
  applyPhoneFinderFilters,
  applyPreset,
  countActiveFilters,
  DEFAULT_PHONE_FINDER_FILTERS,
  filtersFromSearchParams,
  filtersToSearchParams,
  priceBoundsForCurrency,
  priceSliderStep,
  recordFinderSearch,
  topReviewedDevices,
  type PhoneFinderFilters,
} from "@/features/phone-finder";
import {
  getDevices,
  getBrandsGrouped,
  getMyProfile,
  getToken,
  getWishlist,
  type Device,
  type ProfileBadge,
} from "@/lib/api";
import {
  brandFilterOptions,
  resolveBrandCatalog,
  type BrandCategoryGroup,
} from "@/lib/brand-categories";
import { GamificationStrip } from "@/components/phone-finder/GamificationStrip";
import { resolveVisitorGeo } from "@/lib/visitor-geo";
import { useSearchLanguage } from "@/lib/use-search-language";
import { useSiteAuth } from "@/lib/site-auth";
import { useSiteLanguage } from "@/lib/site-language";
import { useLocale } from "next-intl";

export default function PhoneFinderPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language: searchLanguage } = useSearchLanguage();
  const { user, ready: authReady } = useSiteAuth();
  const { t } = useSiteLanguage();
  const locale = useLocale();

  const [all, setAll] = useState<Device[]>([]);
  const [brandGroups, setBrandGroups] = useState<BrandCategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PhoneFinderFilters>(() =>
    filtersFromSearchParams(searchParams),
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [badges, setBadges] = useState<ProfileBadge[]>([]);
  const [compareAnchorSlug, setCompareAnchorSlug] = useState("");
  const [upgradeQuery, setUpgradeQuery] = useState("");
  const [searchInput, setSearchInput] = useState(() =>
    filtersFromSearchParams(searchParams).search,
  );
  const searchFocusedRef = useRef(false);
  const urlSearchRef = useRef(searchInput);

  useEffect(() => {
    let active = true;

    Promise.all([getDevices(undefined, locale), getBrandsGrouped(locale)])
      .then(([devices, groups]) => {
        if (!active) return;
        setAll(devices);
        setBrandGroups(groups);
      })
      .catch(() => {
        if (active) {
          setError("Could not load devices. Is the API running?");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [locale]);

  useEffect(() => {
    function refreshCatalog() {
      void Promise.all([getDevices(undefined, locale), getBrandsGrouped(locale)]).then(
        ([devices, groups]) => {
          setAll(devices);
          setBrandGroups(groups);
        },
      );
    }

    window.addEventListener("focus", refreshCatalog);
    return () => window.removeEventListener("focus", refreshCatalog);
  }, [locale]);

  useEffect(() => {
    if (searchFocusedRef.current) return;
    const parsed = filtersFromSearchParams(searchParams);
    if (parsed.search === urlSearchRef.current) return;
    urlSearchRef.current = parsed.search;
    setFilters(parsed);
    setSearchInput(parsed.search);
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get("priceCurrency") || searchParams.get("priceCountry")) return;
    resolveVisitorGeo()
      .then((geo) => {
        if (!geo?.countryCode) return;
        setFilters((current) =>
          current.priceCurrency === "USD"
            ? {
                ...current,
                priceCurrency: geo.countryCode === "IN" ? "INR" : "USD",
              }
            : current,
        );
      })
      .catch(() => undefined);
  }, [searchParams]);

  useEffect(() => {
    if (!getToken()) return;
    getWishlist()
      .then((items) => setWishlistIds(new Set(items.map((i) => i.device.id))))
      .catch(() => setWishlistIds(new Set()));
    getMyProfile()
      .then((p) => setBadges(p.badges?.earned ?? []))
      .catch(() => setBadges([]));
  }, []);

  const catalogBrandGroups = useMemo(
    () => resolveBrandCatalog(brandGroups, all),
    [brandGroups, all],
  );
  const brands = useMemo(
    () => brandFilterOptions(catalogBrandGroups, all),
    [catalogBrandGroups, all],
  );
  const priceStep = useMemo(
    () => priceSliderStep(filters.priceCurrency),
    [filters.priceCurrency],
  );
  const bounds = useMemo(
    () => priceBoundsForCurrency(all, filters.priceCurrency),
    [all, filters.priceCurrency],
  );

  const effectiveFilters = useMemo(
    () => ({ ...filters, search: searchInput }),
    [filters, searchInput],
  );

  const filtered = useMemo(
    () => applyPhoneFinderFilters(all, effectiveFilters),
    [all, effectiveFilters, searchLanguage],
  );

  const reviewedInResults = useMemo(
    () => topReviewedDevices(filtered, 5),
    [filtered],
  );

  const pushFiltersToUrl = useCallback(
    (next: PhoneFinderFilters) => {
      const qs = filtersToSearchParams(next).toString();
      if (qs === searchParams.toString()) return;
      router.replace(qs ? `/phone-finder?${qs}` : "/phone-finder", {
        scroll: false,
      });
    },
    [router, searchParams],
  );

  const syncSearchToUrl = useCallback(
    (q: string) => {
      urlSearchRef.current = q;
      let next: PhoneFinderFilters | null = null;
      setFilters((current) => {
        next = { ...current, search: q };
        return next;
      });
      if (next) pushFiltersToUrl(next);
      if (q.trim()) recordFinderSearch(q);
    },
    [pushFiltersToUrl],
  );

  const applySearchSuggestion = useCallback(
    (q: string, patch?: Partial<PhoneFinderFilters>) => {
      urlSearchRef.current = q;
      setSearchInput(q);
      let next: PhoneFinderFilters | null = null;
      setFilters((current) => {
        next = { ...current, search: q, ...(patch ?? {}) };
        return next;
      });
      if (next) {
        if (q.trim()) recordFinderSearch(q);
        pushFiltersToUrl(next);
      }
    },
    [pushFiltersToUrl],
  );

  function updateFilters(next: PhoneFinderFilters) {
    urlSearchRef.current = next.search;
    setFilters(next);
    setSearchInput(next.search);
    if (next.search.trim()) recordFinderSearch(next.search);
    pushFiltersToUrl(next);
  }

  function handleTrendingPick(params: URLSearchParams, label: string) {
    recordFinderSearch(label);
    const incoming = filtersFromSearchParams(params);
    updateFilters({ ...filters, ...incoming });
  }

  function handlePreset(presetId: string) {
    updateFilters(applyPreset(presetId, filters, DEFAULT_PHONE_FINDER_FILTERS));
  }

  const activeCount = countActiveFilters(filters);

  const filterPanel = (
    <PhoneFinderFilterPanel
      filters={filters}
      onChange={(next) => {
        updateFilters(next);
        setMobileFiltersOpen(false);
      }}
      searchValue={searchInput}
      devices={all}
      brands={brands}
      onSearchChange={setSearchInput}
      onSearchCommit={syncSearchToUrl}
      onApplySuggestion={applySearchSuggestion}
      onSearchFocusChange={(focused) => {
        searchFocusedRef.current = focused;
      }}
      priceMin={bounds.min}
      priceMax={bounds.max}
      priceCurrency={filters.priceCurrency}
      priceStep={priceStep}
      resultCount={filtered.length}
      totalCount={all.length}
    />
  );

  return (
    <>
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: t("common.home"), href: "/" },
          { label: t("finder.title") },
        ]}
      />

      <div className="mb-6 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center lg:hidden">
        <PhoneFinderSearch
          value={searchInput}
          devices={all}
          brands={brands}
          filters={filters}
          onChange={setSearchInput}
          onCommit={syncSearchToUrl}
          onApplySuggestion={applySearchSuggestion}
          onFocusChange={(focused) => {
            searchFocusedRef.current = focused;
          }}
          className="min-w-0 flex-1"
        />
        <Button
          type="button"
          variant="secondary"
          className="w-full shrink-0 sm:w-auto lg:hidden"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <Filter size={16} />
          {t("finder.filters.title")}
          {activeCount > 0 ? ` (${activeCount})` : ""}
        </Button>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-4">
        <aside className="min-w-0 lg:col-span-1">
          <div className="hidden lg:block">{filterPanel}</div>
          <p className="mt-0 text-xs text-[var(--text-secondary)] lg:sr-only">
            {t("finder.tapFilters")}
          </p>
        </aside>

        <div className="min-w-0 lg:col-span-3">
          <p className="mb-4 text-sm text-[var(--text-secondary)]">
            {t("finder.matchCount", {
              filtered: loading ? "…" : filtered.length,
              total: all.length,
            })}
          </p>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-[22px]" />
              ))}
            </div>
          ) : error ? (
            <p className="text-[var(--rose-alert)]">{error}</p>
          ) : filtered.length === 0 ? (
            <SpectrumPanel className="p-10 text-center">
              <p className="font-semibold text-[var(--text-primary)]">
                {t("finder.empty")}
              </p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {t("finder.emptyHint")}
              </p>
              <Button
                type="button"
                variant="secondary"
                className="mt-4"
                onClick={() => updateFilters({ ...DEFAULT_PHONE_FINDER_FILTERS })}
              >
                {t("finder.resetAll")}
              </Button>
            </SpectrumPanel>
          ) : (
            <PhoneGrid
              devices={filtered}
              showArenaScore
              pageSize={9}
              priceCurrency={filters.priceCurrency}
              searchQuery={searchInput}
              wishlistIds={wishlistIds}
              onWishlistChange={() => {
                if (!getToken()) return;
                getWishlist()
                  .then((items) =>
                    setWishlistIds(new Set(items.map((i) => i.device.id))),
                  )
                  .catch(() => undefined);
              }}
            />
          )}
        </div>
      </div>

      <section className="mt-12 min-w-0 border-t border-white/10 pt-10">
        <p className="mb-6 text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
          {t("finder.moreTools")}
        </p>

        {authReady && user && badges.length > 0 && (
          <GamificationStrip earned={badges} />
        )}

        <PresetChips
          className="mb-6"
          activePreset={filters.preset}
          onSelectPreset={handlePreset}
        />

        <LifestyleCategoriesBar
          className="mb-6"
          activePreset={filters.preset}
          onSelectPreset={handlePreset}
        />

        <TrendingSearches onPick={handleTrendingPick} priceCurrency={filters.priceCurrency} />

        <PollsReviewsPanel reviewedDevices={reviewedInResults} />

        <AiHubPanel
          devices={all}
          brands={brands}
          wishlistIds={wishlistIds}
          compareAnchorSlug={compareAnchorSlug}
          onCompareAnchorChange={setCompareAnchorSlug}
          upgradeQuery={upgradeQuery}
          onUpgradeQueryChange={setUpgradeQuery}
          onApplySearch={(q) => syncSearchToUrl(q)}
          onApplyFilters={(patch) =>
            updateFilters({ ...filters, ...(patch as Partial<PhoneFinderFilters>) })
          }
          onNavigate={(path) => router.push(path)}
        />
      </section>

      <Modal
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title={t("finder.filterTitle")}
        size="lg"
        footer={
          <Button type="button" className="w-full" onClick={() => setMobileFiltersOpen(false)}>
            {t("finder.showCount", {
              count: loading ? "…" : filtered.length,
            })}
          </Button>
        }
      >
        {filterPanel}
      </Modal>
    </>
  );
}
