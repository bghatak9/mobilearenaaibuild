"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  Search,
  Lightbulb,
  PlayCircle,
  Camera,
  Rss,
  Moon,
  Car,
  ShoppingCart,
  User,
} from "lucide-react";

const NAV = [
  { label: "HOME", href: "/" },
  { label: "NEWS", href: "/news" },
  { label: "REVIEWS", href: "/reviews" },
  { label: "VIDEOS", href: "/videos" },
  { label: "FEATURED", href: "/featured" },
  { label: "PHONE FINDER", href: "/phones" },
  { label: "DEALS", href: "/deals" },
  { label: "MERCH", href: "/merch" },
  { label: "COVERAGE", href: "/coverage" },
  { label: "CONTACT", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40">
      {/* Top dark bar */}
      <div className="bg-zinc-950 text-white">
        <div className="mx-auto flex max-w-[1100px] items-center gap-4 px-4 py-3">
          <button aria-label="Menu" className="text-white/90 hover:text-white">
            <Menu size={24} />
          </button>

          <Link href="/" className="text-2xl font-extrabold tracking-tight">
            Mobile<span className="text-red-600">Arena</span>
          </Link>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              router.push("/phones");
            }}
            className="flex flex-1 items-center overflow-hidden rounded bg-zinc-800"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search phones, brands, models..."
              className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder:text-zinc-500 outline-none"
            />
            <button
              type="submit"
              className="bg-red-600 px-3 py-2 text-white hover:bg-red-500"
              aria-label="Search"
            >
              <Search size={16} />
            </button>
          </form>

          <div className="hidden items-center gap-4 text-[10px] font-semibold uppercase text-zinc-300 lg:flex">
            <Stat icon={<Lightbulb size={16} />} label="Tip us" />
            <Stat icon={<PlayCircle size={16} />} label="2.1M" />
            <Stat icon={<Camera size={16} />} label="160K" />
            <Stat icon={<Rss size={16} />} label="RSS" />
          </div>

          <div className="flex items-center gap-3 text-zinc-300">
            <Moon size={18} className="cursor-pointer hover:text-white" />
            <Car size={18} className="hidden cursor-pointer hover:text-white sm:block" />
            <ShoppingCart size={18} className="cursor-pointer hover:text-white" />
          </div>

          <div className="hidden items-center gap-3 text-[10px] font-semibold uppercase text-zinc-300 sm:flex">
            <span className="flex flex-col items-center">
              <User size={16} />
              Sign in
            </span>
            <span className="flex flex-col items-center">
              <User size={16} />
              Sign up
            </span>
          </div>
        </div>
      </div>

      {/* Nav bar */}
      <nav className="border-b-2 border-red-600 bg-white">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-stretch px-4 text-sm font-semibold text-zinc-800">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`-mb-[2px] border-b-2 px-3 py-3 transition ${
                  active
                    ? "border-red-600 text-red-600"
                    : "border-transparent hover:text-red-600"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

function Stat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex cursor-pointer flex-col items-center hover:text-white">
      {icon}
      {label}
    </span>
  );
}
