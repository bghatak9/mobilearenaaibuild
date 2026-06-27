export default function PhoneFinder() {
  const brands = [
    "Samsung",
    "Apple",
    "Xiaomi",
    "OnePlus",
    "Vivo",
    "Oppo",
    "Realme",
    "Nothing",
    "Honor",
    "Motorola",
    "Google",
    "Tecno",
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-white font-semibold">
          Phone Finder
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2 p-4">
        {brands.map((brand) => (
          <button
            key={brand}
            className="text-left text-sm text-zinc-300 hover:text-white"
          >
            {brand}
          </button>
        ))}
      </div>
    </div>
  );
}