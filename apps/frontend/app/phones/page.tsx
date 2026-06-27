"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PhoneGrid from "@/components/phone/PhoneGrid";
import BrandFilter from "@/components/filters/BrandFilter";
import { getDevices, type Device } from "@/lib/api";

type Sort = "newest" | "price-asc" | "price-desc" | "rating";

export default function PhonesPage() {
  const [all, setAll] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("All");
  const [sort, setSort] = useState<Sort>("newest");

  useEffect(() => {
    getDevices()
      .then(setAll)
      .catch(() => setError("Could not load devices. Is the API running?"))
      .finally(() => setLoading(false));
  }, []);

  const brands = useMemo(() => {
    const names = Array.from(
      new Set(all.map((d) => d.brand?.name).filter(Boolean) as string[]),
    ).sort();
    return ["All", ...names];
  }, [all]);

  const filtered = useMemo(() => {
    let list = all.filter((d) => {
      const matchSearch = d.name
        .toLowerCase()
        .includes(search.toLowerCase());
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
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header />

      <section className="mx-auto max-w-7xl px-5 py-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Phone Finder</h1>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Filters */}
          <aside className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="mb-3 font-bold text-gray-900">Sort by</h2>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="w-full rounded-lg border border-gray-300 p-2 text-sm"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Best rated</option>
              </select>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="mb-4 font-bold text-gray-900">Brands</h2>
              <BrandFilter brands={brands} selected={brand} onSelect={setBrand} />
            </div>
          </aside>

          {/* Results */}
          <div className="lg:col-span-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search phones..."
              className="mb-6 w-full rounded-xl border border-gray-300 px-4 py-3"
            />

            {loading ? (
              <p className="p-4 text-gray-500">Loading devices…</p>
            ) : error ? (
              <p className="p-4 text-red-500">{error}</p>
            ) : (
              <PhoneGrid devices={filtered} />
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
