"use client";

import { cn } from "@/design-system/utils/cn";
import {
  BrandCategoryHeading,
  BrandChip,
} from "@/components/brands/BrandChip";
import type { BrandCategoryGroup } from "@/lib/brand-categories";

type CategorizedBrandFilterProps = {
  groups: BrandCategoryGroup[];
  selected: string;
  onSelect: (brand: string) => void;
};

export default function CategorizedBrandFilter({
  groups,
  selected,
  onSelect,
}: CategorizedBrandFilterProps) {
  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => onSelect("All")}
        className={cn(
          "w-full rounded-2xl border px-3 py-2.5 text-left text-sm font-bold tracking-tight transition",
          selected === "All"
            ? "border-[var(--electric-cyan)]/60 bg-[var(--arena-blue)]/20 text-[var(--electric-cyan)]"
            : "border-white/10 bg-white/[0.04] text-[var(--text-primary)] hover:border-white/20",
        )}
      >
        All brands
      </button>

      {groups.map((group) => (
        <div key={group.category.slug}>
          <BrandCategoryHeading name={group.category.name} />
          <div className="space-y-2">
            {group.brands.map((brand) => (
              <BrandChip
                key={brand.id}
                brand={brand}
                variant="filter"
                active={selected === brand.name}
                onClick={() => onSelect(brand.name)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
