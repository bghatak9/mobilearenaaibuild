import Link from "next/link";
import { Search, List, Volume2 } from "lucide-react";

// Row-wise order to match the 3-column GSMArena-style brand grid.
const BRANDS = [
  "SAMSUNG", "GOOGLE", "LENOVO",
  "APPLE", "ASUS", "MICROSOFT",
  "XIAOMI", "INFINIX", "ALCATEL",
  "ONEPLUS", "TECNO", "ZTE",
  "REALME", "ITEL", "MEIZU",
  "OPPO", "MOTOROLA", "BLACKVIEW",
  "VIVO", "NOKIA", "DOOGEE",
  "HONOR", "SONY", "CUBOT",
  "POCO", "LG", "OUKITEL",
  "NOTHING", "HTC", "SHARP",
];

export default function PhoneFinderBox() {
  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
      <div className="flex items-center justify-center gap-2 bg-zinc-900 py-2 text-sm font-semibold text-white">
        <Search size={14} /> PHONE FINDER
      </div>

      <div className="grid grid-cols-3">
        {BRANDS.map((brand) => (
          <Link
            key={brand}
            href="/phones"
            className="border-b border-r border-gray-100 px-2 py-2 text-center text-[11px] font-medium text-zinc-700 transition hover:bg-gray-50 hover:text-red-600"
          >
            {brand}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 border-t border-gray-200 text-xs font-semibold text-zinc-600">
        <Link
          href="/phones"
          className="flex items-center justify-center gap-1.5 border-r border-gray-200 py-2 hover:bg-gray-50 hover:text-red-600"
        >
          <List size={13} /> ALL BRANDS
        </Link>
        <Link
          href="/news"
          className="flex items-center justify-center gap-1.5 py-2 hover:bg-gray-50 hover:text-red-600"
        >
          <Volume2 size={13} /> RUMOR MILL
        </Link>
      </div>
    </div>
  );
}
