import Link from "next/link";
import { Search, List, Volume2 } from "lucide-react";
import { Card } from "@mobilearena/ui";

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
    <Card className="overflow-hidden p-0 hover:transform-none hover:shadow-card">
      <div className="flex items-center justify-center gap-2 bg-surface-2 py-2 text-sm font-semibold text-text-primary">
        <Search size={14} /> PHONE FINDER
      </div>

      <div className="grid grid-cols-3">
        {BRANDS.map((brand) => (
          <Link
            key={brand}
            href="/phones"
            className="border-b border-r border-border-soft px-2 py-2 text-center text-[11px] font-medium text-text-secondary transition hover:bg-surface-2 hover:text-blue"
          >
            {brand}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 border-t border-border-soft text-xs font-semibold text-text-muted">
        <Link
          href="/phones"
          className="flex items-center justify-center gap-1.5 border-r border-border-soft py-2 transition hover:bg-surface-2 hover:text-blue"
        >
          <List size={13} /> ALL BRANDS
        </Link>
        <Link
          href="/news"
          className="flex items-center justify-center gap-1.5 py-2 transition hover:bg-surface-2 hover:text-blue"
        >
          <Volume2 size={13} /> RUMOR MILL
        </Link>
      </div>
    </Card>
  );
}
