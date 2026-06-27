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
    <div className="flex gap-2 flex-wrap">
      {brands.map((brand: string) => (
        <button
          key={brand}
          onClick={() => onSelect(brand)}
          className={`px-4 py-2 rounded-full border ${
            selected === brand
              ? "bg-black text-white"
              : ""
          }`}
        >
          {brand}
        </button>
      ))}
    </div>
  );
}