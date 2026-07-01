"use client";

type BrandFilterProps = {
  brands: string[];
  selected: string | null;
  onSelect: (brand: string) => void;
};

export default function BrandFilter({
  brands,
  selected,
  onSelect,
}: BrandFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {brands.map((brand: string) => (
        <button
          key={brand}
          type="button"
          onClick={() => onSelect(brand)}
          className={`rounded-[var(--radius-chip)] border px-4 py-2 text-sm font-medium transition ${
            selected === brand
              ? "titan-btn-primary border-transparent text-white"
              : "border-border-soft text-text-secondary hover:border-blue hover:text-blue"
          }`}
        >
          {brand}
        </button>
      ))}
    </div>
  );
}