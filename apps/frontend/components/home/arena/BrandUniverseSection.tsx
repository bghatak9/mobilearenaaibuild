"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

import { BrandChip } from "@/components/brands/BrandChip";
import type { Device } from "@/lib/api";
import {
  allBrandSummaries,
  pickGlobalBrandUniverse,
  type BrandCategoryGroup,
} from "@/lib/brand-categories";

type Props = {
  brandGroups: BrandCategoryGroup[];
  devices?: Device[];
};

export function BrandUniverseSection({ brandGroups, devices = [] }: Props) {
  const [showAll, setShowAll] = useState(false);

  const globalBrands = useMemo(
    () => pickGlobalBrandUniverse(brandGroups),
    [brandGroups],
  );

  const everyBrand = useMemo(
    () => allBrandSummaries(brandGroups, devices),
    [brandGroups, devices],
  );

  const brands = showAll ? everyBrand : globalBrands;

  return (
    <section aria-labelledby="brand-universe" className="arena-home-section">
      <div className="arena-section-header mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="brand-universe"
            className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] md:text-3xl"
          >
            Interactive Brand Universe
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
            Explore the world&apos;s leading smartphone brands
          </p>
        </div>
        {everyBrand.length > globalBrands.length ? (
          <button
            type="button"
            onClick={() => setShowAll((open) => !open)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-accent)] bg-[var(--electric-cyan)]/10 px-3 py-1.5 text-sm font-semibold text-[var(--electric-cyan)] transition hover:bg-[var(--electric-cyan)]/15"
          >
            {showAll ? "Show less" : "View all"}
            <ArrowRight
              size={14}
              className={showAll ? "rotate-90 transition-transform" : "transition-transform"}
            />
          </button>
        ) : null}
      </div>

      <div
        className={
          showAll
            ? "grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            : "grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        }
      >
        {brands.map((brand) => (
          <BrandChip
            key={brand.slug}
            as="link"
            href={`/phones?search=${encodeURIComponent(brand.name)}`}
            brand={brand}
            size="lg"
          />
        ))}
      </div>
    </section>
  );
}
