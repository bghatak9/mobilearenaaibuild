"use client";

import { Link } from "@/i18n/navigation";
import { Filter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import PhoneGrid from "@/components/phone/PhoneGrid";
import BrandFilter from "@/components/filters/BrandFilter";
import { Button } from "@/design-system/buttons/Button";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import { Modal } from "@/design-system/modals/Modal";
import { SearchBar } from "@/design-system/forms/SearchBar";
import { Skeleton } from "@/design-system/feedback/Skeleton";
import { getDevices, getBulkUpcomingDevices, getBrandsGrouped, getFavoriteDevices, getToken, getWishlist, type Device } from "@/lib/api";
import {
  brandFilterOptions,
  resolveBrandCatalog,
  type BrandCategoryGroup,
} from "@/lib/brand-categories";
import { getTrendingArenaDevices } from "@/features/phone-finder/device-utils";
import { useSiteLanguage } from "@/lib/site-language";
import { useLocale } from "next-intl";

type Sort = "newest" | "price-asc" | "price-desc" | "rating";

export default function PhonesPageInner() {
  const { t } = useSiteLanguage();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") ?? searchParams.get("brand") ?? "";
  const favoritesOnly =
    searchParams.get("favorites") === "1" ||
    searchParams.get("favorites") === "true";
  const upcomingOnly =
    searchParams.get("upcoming") === "1" ||
    searchParams.get("upcoming") === "true";
  const trendingOnly =
    searchParams.get("trending") === "1" ||
    searchParams.get("trending") === "true";

  const catalogOnly = !favoritesOnly && !upcomingOnly && !trendingOnly;

  const [all, setAll] = useState<Device[]>([]);
  const [brandGroups, setBrandGroups] = useState<BrandCategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);
  const [brand, setBrand] = useState("All");
  const [sort, setSort] = useState<Sort>("newest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (favoritesOnly && !getToken()) {
      router.replace(
        `/login?next=${encodeURIComponent("/phones?favorites=1")}`,
      );
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    const load = favoritesOnly
      ? Promise.all([getFavoriteDevices(), getWishlist(), getDevices(undefined, locale)]).then(
          ([favs, wishlist, catalog]) => {
            const ids = new Set([
              ...favs.map((f) => f.id),
              ...wishlist.map((w) => w.device.id),
            ]);
            const fromCatalog = catalog.filter((d) => ids.has(d.id));
            const catalogIds = new Set(fromCatalog.map((d) => d.id));
            const extras = [...favs, ...wishlist.map((w) => w.device)]
              .filter((f) => !catalogIds.has(f.id))
              .map((f) => f as Device);
            const uniqueExtras = Array.from(
              new Map(extras.map((d) => [d.id, d])).values(),
            );
            return [...fromCatalog, ...uniqueExtras];
          },
        )
      : upcomingOnly
        ? getBulkUpcomingDevices(locale)
        : getDevices(undefined, locale);

    Promise.all([load, getBrandsGrouped(locale)])
      .then(([devices, groups]) => {
        if (active) {
          setAll(devices);
          setBrandGroups(groups);
        }
      })
      .catch(() => {
        if (active) {
          setError(
            favoritesOnly
              ? "Could not load favorite phones. Sign in and try again."
              : "Could not load devices. Is the API running?",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [favoritesOnly, upcomingOnly, trendingOnly, router, locale]);

  useEffect(() => {
    function refreshCatalog() {
      void Promise.all([
        favoritesOnly
          ? Promise.all([getFavoriteDevices(), getWishlist(), getDevices(undefined, locale)]).then(
              ([favs, wishlist, catalog]) => {
                const ids = new Set([
                  ...favs.map((f) => f.id),
                  ...wishlist.map((w) => w.device.id),
                ]);
                const fromCatalog = catalog.filter((d) => ids.has(d.id));
                const catalogIds = new Set(fromCatalog.map((d) => d.id));
                const extras = [...favs, ...wishlist.map((w) => w.device)]
                  .filter((f) => !catalogIds.has(f.id))
                  .map((f) => f as Device);
                const uniqueExtras = Array.from(
                  new Map(extras.map((d) => [d.id, d])).values(),
                );
                return [...fromCatalog, ...uniqueExtras];
              },
            )
          : upcomingOnly
            ? getBulkUpcomingDevices(locale)
            : getDevices(undefined, locale),
        getBrandsGrouped(locale),
      ]).then(([devices, groups]) => {
        setAll(devices);
        setBrandGroups(groups);
      });
    }

    window.addEventListener("focus", refreshCatalog);
    return () => window.removeEventListener("focus", refreshCatalog);
  }, [favoritesOnly, upcomingOnly, trendingOnly, locale]);

  const catalogBrandGroups = useMemo(
    () => resolveBrandCatalog(brandGroups, all),
    [brandGroups, all],
  );

  const brands = useMemo(
    () => brandFilterOptions(catalogBrandGroups, all),
    [catalogBrandGroups, all],
  );

  useEffect(() => {
    if (brand === "All") return;
    if (!brands.includes(brand)) {
      setBrand("All");
    }
  }, [brand, brands]);

  const filtered = useMemo(() => {
    let list = trendingOnly ? getTrendingArenaDevices(all) : all;

    list = list.filter((d) => {
      const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
      if (upcomingOnly || trendingOnly) return matchSearch;
      const matchBrand = brand === "All" || d.brand?.name === brand;
      return matchSearch && matchBrand;
    });

    if (upcomingOnly || trendingOnly) {
      return list;
    }

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return (a.price ?? Infinity) - (b.price ?? Infinity);
        case "price-desc":
          return (b.price ?? -Infinity) - (a.price ?? -Infinity);
        case "rating":
          return (b.rating ?? 0) - (a.rating ?? 0);
        default:
          return b.id - a.id;
      }
    });

    return list;
  }, [all, search, brand, sort, upcomingOnly, trendingOnly]);

  const activeFilterCount =
    catalogOnly ? (brand !== "All" ? 1 : 0) + (sort !== "newest" ? 1 : 0) : 0;

  const filterPanel = catalogOnly ? (
    <>
      <SpectrumPanel className="p-5">
        <h2 className="mb-3 font-bold text-[var(--text-primary)]">{t("phones.sortBy")}</h2>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="w-full rounded-xl border border-white/10 bg-white/5 p-2 text-sm text-[var(--text-primary)]"
        >
          <option value="newest">{t("phones.newest")}</option>
          <option value="price-asc">{t("phones.priceLowHigh")}</option>
          <option value="price-desc">{t("phones.priceHighLow")}</option>
          <option value="rating">{t("phones.bestRated")}</option>
        </select>
      </SpectrumPanel>

      <SpectrumPanel className="mt-5 p-5">
        <h2 className="mb-4 font-bold text-[var(--text-primary)]">
          {t("phones.brands")}
        </h2>
        <BrandFilter
          brands={brands}
          devices={all}
          selected={brand}
          onSelect={setBrand}
        />
      </SpectrumPanel>
    </>
  ) : null;

  const pageTitle = favoritesOnly
    ? t("phones.favoritesTitle")
    : upcomingOnly
      ? t("phones.upcomingTitle")
      : trendingOnly
        ? t("phones.trendingTitle")
        : t("phones.title");

  const pageEyebrow = favoritesOnly
    ? t("phones.favoritesTitle")
    : upcomingOnly
      ? t("phones.upcomingTitle")
      : trendingOnly
        ? t("phones.trendingTitle")
        : t("phones.brands");

  const simplifiedLayout = upcomingOnly || trendingOnly;
  const showPageHeader = favoritesOnly || trendingOnly;
  const showSearch = !upcomingOnly;
  const searchPlaceholder = t("phones.search");

  return (
    <>
      {showPageHeader ? (
        <header className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--electric-cyan)]">
            {pageEyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-[var(--text-primary)]">
            {pageTitle}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {favoritesOnly ? (
              <>
                Phones you saved with the heart icon.{" "}
                <Link href="/phones" className="text-[var(--electric-cyan)] hover:underline">
                  Browse all phones
                </Link>
              </>
            ) : upcomingOnly ? (
              <>
                Bulk-uploaded phones launching soon.{" "}
                <Link href="/phones" className="text-[var(--electric-cyan)] hover:underline">
                  Browse all phones
                </Link>
              </>
            ) : (
              <>
                What the community is exploring right now — ranked by Arena score and ratings.{" "}
                <Link href="/phones" className="text-[var(--electric-cyan)] hover:underline">
                  Browse all phones
                </Link>
              </>
            )}
          </p>
        </header>
      ) : null}

      {showSearch ? (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center lg:hidden">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSubmit={(q) => setSearch(q)}
            onVoiceQuery={(q) => setSearch(q)}
            placeholder={searchPlaceholder}
            className="flex-1"
          />
          {catalogOnly ? (
            <Button
              type="button"
              variant="secondary"
              className="shrink-0"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <Filter size={16} />
              {t("phones.filters")}
              {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className={simplifiedLayout ? "grid gap-6" : "grid gap-6 lg:grid-cols-4"}>
        {catalogOnly ? (
          <aside className="hidden space-y-5 lg:block">{filterPanel}</aside>
        ) : null}

        <div className={simplifiedLayout ? undefined : "lg:col-span-3"}>
          {showSearch ? (
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onSubmit={(q) => setSearch(q)}
              onVoiceQuery={(q) => setSearch(q)}
              placeholder={searchPlaceholder}
              className="mb-6 hidden lg:block"
            />
          ) : null}

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-[22px]" />
              ))}
            </div>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : filtered.length === 0 ? (
            <SpectrumPanel className="p-8 text-center text-[var(--text-secondary)]">
              {t("phones.empty")}
            </SpectrumPanel>
          ) : (
            <PhoneGrid
              devices={filtered}
              pageSize={9}
              swipePaginate={!trendingOnly}
            />
          )}
        </div>
      </div>

      {catalogOnly ? (
        <Modal
          open={mobileFiltersOpen}
          onClose={() => setMobileFiltersOpen(false)}
          title={t("phones.filterTitle")}
          size="lg"
          footer={
            <Button type="button" className="w-full" onClick={() => setMobileFiltersOpen(false)}>
              {t("phones.showCount", {
                count: loading ? "…" : filtered.length,
              })}
            </Button>
          }
        >
          {filterPanel}
        </Modal>
      ) : null}
    </>
  );
}
