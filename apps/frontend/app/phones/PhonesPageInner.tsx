"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import PhoneGrid from "@/components/phone/PhoneGrid";
import BrandFilter from "@/components/filters/BrandFilter";
import { GlassPanel } from "@/design-system/glass/GlassPanel";
import { SearchBar } from "@/design-system/forms/SearchBar";
import { Skeleton } from "@/design-system/feedback/Skeleton";
import { getDevices, getBulkUpcomingDevices, getBrandsGrouped, getFavoriteDevices, getToken, getWishlist, type Device } from "@/lib/api";
import {
  brandFilterOptions,
  resolveBrandCatalog,
  type BrandCategoryGroup,
} from "@/lib/brand-categories";

type Sort = "newest" | "price-asc" | "price-desc" | "rating";

export default function PhonesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") ?? searchParams.get("brand") ?? "";
  const favoritesOnly =
    searchParams.get("favorites") === "1" ||
    searchParams.get("favorites") === "true";
  const upcomingOnly =
    searchParams.get("upcoming") === "1" ||
    searchParams.get("upcoming") === "true";

  const [all, setAll] = useState<Device[]>([]);
  const [brandGroups, setBrandGroups] = useState<BrandCategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);
  const [brand, setBrand] = useState("All");
  const [sort, setSort] = useState<Sort>("newest");

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
      ? Promise.all([getFavoriteDevices(), getWishlist(), getDevices()]).then(
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
        ? getBulkUpcomingDevices()
        : getDevices();

    Promise.all([load, getBrandsGrouped()])
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
  }, [favoritesOnly, upcomingOnly, router]);

  useEffect(() => {
    function refreshCatalog() {
      void Promise.all([
        favoritesOnly
          ? Promise.all([getFavoriteDevices(), getWishlist(), getDevices()]).then(
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
            ? getBulkUpcomingDevices()
            : getDevices(),
        getBrandsGrouped(),
      ]).then(([devices, groups]) => {
        setAll(devices);
        setBrandGroups(groups);
      });
    }

    window.addEventListener("focus", refreshCatalog);
    return () => window.removeEventListener("focus", refreshCatalog);
  }, [favoritesOnly, upcomingOnly]);

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
    let list = all.filter((d) => {
      const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
      const matchBrand = brand === "All" || d.brand?.name === brand;
      return matchSearch && matchBrand;
    });

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
  }, [all, search, brand, sort]);

  return (
    <>
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--electric-cyan)]">
          {favoritesOnly
            ? "Your collection"
            : upcomingOnly
              ? "Launch radar"
              : "Brands"}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-[var(--text-primary)]">
          {favoritesOnly
            ? "Favorite Phones"
            : upcomingOnly
              ? "Upcoming Devices"
              : "Phones"}
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
              Browse every brand in the Arena catalog. Use{" "}
              <Link href="/phone-finder" className="text-[var(--electric-cyan)] hover:underline">
                Phone Finder
              </Link>{" "}
              for advanced filters.
            </>
          )}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-4">
        <aside className="space-y-5">
          <GlassPanel className="p-5">
            <h2 className="mb-3 font-bold text-[var(--text-primary)]">Sort by</h2>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="w-full rounded-xl border border-white/10 bg-white/5 p-2 text-sm text-[var(--text-primary)]"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Best rated</option>
            </select>
          </GlassPanel>

          <GlassPanel className="p-5">
            <h2 className="mb-4 font-bold text-[var(--text-primary)]">Brands</h2>
            <BrandFilter
              brands={brands}
              devices={all}
              selected={brand}
              onSelect={setBrand}
            />
          </GlassPanel>
        </aside>

        <div className="lg:col-span-3">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSubmit={(q) => setSearch(q)}
            onVoiceQuery={(q) => setSearch(q)}
            placeholder="Search phones..."
            className="mb-6"
          />

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-[22px]" />
              ))}
            </div>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : filtered.length === 0 ? (
            <GlassPanel className="p-8 text-center text-[var(--text-secondary)]">
              {favoritesOnly
                ? "No favorite phones yet. Save phones with the heart on search results or add them from your profile."
                : "No phones match your filters."}
            </GlassPanel>
          ) : (
            <PhoneGrid devices={filtered} />
          )}
        </div>
      </div>
    </>
  );
}
