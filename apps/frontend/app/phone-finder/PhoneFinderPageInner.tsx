"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Share2 } from "lucide-react";

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

export default function PhoneFinderPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language: searchLanguage } = useSearchLanguage();

  const [all, setAll] = useState<Device[]>([]);
  const [brandGroups, setBrandGroups] = useState<BrandCategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PhoneFinderFilters>(() =>
    filtersFromSearchParams(searchParams),
  );
  const [copied, setCopied] = useState(false);
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

    Promise.all([getDevices(), getBrandsGrouped()])
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
  }, []);

  useEffect(() => {
    function refreshCatalog() {
      void Promise.all([getDevices(), getBrandsGrouped()]).then(
        ([devices, groups]) => {
          setAll(devices);
          setBrandGroups(groups);
        },
      );
    }

    window.addEventListener("focus", refreshCatalog);
    return () => window.removeEventListener("focus", refreshCatalog);
  }, []);

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

  async function shareFilters() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/phone-finder?${filtersToSearchParams(filters).toString()}`
        : "/phone-finder";
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
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
        items={[{ label: "Home", href: "/" }, { label: "Phone Finder" }]}
      />

      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--electric-cyan)]">
            MobileArena Phone Finder
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-[var(--text-primary)]">
            Find your perfect phone
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)]">
            Filter by price, specs, and hardware first — then explore AI tools and
            community picks below your results.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => void shareFilters()}>
            <Share2 size={16} />
            {copied ? "Link copied" : "Share search"}
          </Button>
        </div>
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center lg:hidden">
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
          className="flex-1"
        />
        <Button
          type="button"
          variant="secondary"
          className="shrink-0 lg:hidden"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <Filter size={16} />
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <div className="hidden lg:block">{filterPanel}</div>
          <p className="mt-0 text-xs text-[var(--text-secondary)] lg:sr-only">
            Tap Filters above to refine results.
          </p>
        </aside>

        <div className="lg:col-span-3">
          <p className="mb-4 text-sm text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)]">
              {loading ? "…" : filtered.length}
            </span>{" "}
            of {all.length} phones match your filters
          </p>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-[22px]" />
              ))}
            </div>
          ) : error ? (
            <p className="text-[var(--rose-alert)]">{error}</p>
          ) : filtered.length === 0 ? (
            <SpectrumPanel className="p-10 text-center">
              <p className="font-semibold text-[var(--text-primary)]">
                No phones match these filters
              </p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Adjust filters in the sidebar or reset to start over.
              </p>
              <Button
                type="button"
                variant="secondary"
                className="mt-4"
                onClick={() => updateFilters({ ...DEFAULT_PHONE_FINDER_FILTERS })}
              >
                Reset all filters
              </Button>
            </SpectrumPanel>
          ) : (
            <PhoneGrid
              devices={filtered}
              showArenaScore
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

      <section className="mt-12 border-t border-white/10 pt-10">
        <p className="mb-6 text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
          More discovery tools
        </p>

        {getToken() && badges.length > 0 && <GamificationStrip earned={badges} />}

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
        title="Phone Finder filters"
        size="lg"
        footer={
          <Button type="button" className="w-full" onClick={() => setMobileFiltersOpen(false)}>
            Show {loading ? "…" : filtered.length} phones
          </Button>
        }
      >
        {filterPanel}
      </Modal>
    </>
  );
}
