"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

import { BrandChip } from "@/components/brands/BrandChip";
import { cn } from "@/design-system/utils/cn";
import type { Device } from "@/lib/api";
import {
  allBrandSummaries,
  pickGlobalBrandUniverse,
  type BrandCategoryGroup,
} from "@/lib/brand-categories";
import { useSiteLanguage } from "@/lib/site-language";

type Props = {
  brandGroups: BrandCategoryGroup[];
  devices?: Device[];
};

export function BrandUniverseSection({ brandGroups, devices = [] }: Props) {
  const [showAll, setShowAll] = useState(false);
  const { t } = useSiteLanguage();

  const globalBrands = useMemo(
    () => pickGlobalBrandUniverse(brandGroups, devices),
    [brandGroups, devices],
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
            {t("home.brandUniverse")}
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
            {t("home.brandUniverseSubtitle")}
          </p>
        </div>
        {everyBrand.length > globalBrands.length ? (
          <button
            type="button"
            onClick={() => setShowAll((open) => !open)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-accent)] bg-[var(--electric-cyan)]/10 px-3 py-1.5 text-sm font-semibold text-[var(--electric-cyan)] transition hover:bg-[var(--electric-cyan)]/15"
          >
            {showAll ? t("home.showLess") : t("home.viewAll")}
            <ArrowRight
              size={14}
              className={showAll ? "rotate-90 transition-transform" : "transition-transform"}
            />
          </button>
        ) : null}
      </div>

      <div
        className={cn(
          "arena-brand-universe-wrap w-full min-w-0",
          showAll && "arena-brand-universe-wrap--all",
        )}
      >
        <div
          className={cn(
            showAll ? "arena-brand-universe-grid" : "arena-brand-universe-row",
          )}
          role="region"
          aria-label={t("home.brandUniverse")}
          tabIndex={showAll ? undefined : 0}
        >
          {brands.map((brand) => (
            <div key={brand.slug} className="arena-brand-universe-item">
              <BrandChip
                as="link"
                href={`/phones?search=${encodeURIComponent(brand.name)}`}
                brand={brand}
                size="lg"
                className="h-full w-full"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
