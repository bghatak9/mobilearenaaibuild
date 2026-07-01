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
import {
  Container,
  Input,
  Button,
  TitanLogo,
  cn,
} from "@mobilearena/ui";

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
      <div className="bg-bg-secondary border-b border-border-soft text-text-primary">
        <Container className="flex items-center gap-4 py-3">
          <button
            aria-label="Menu"
            className="text-text-secondary hover:text-text-primary transition"
          >
            <Menu size={24} />
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 titan-display text-xl tracking-tight"
          >
            <TitanLogo className="h-8 w-8" />
            Mobile<span className="text-blue">Arena</span>
          </Link>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              router.push("/phones");
            }}
            className="flex flex-1 items-center overflow-hidden rounded-[var(--radius-button)] border border-border-soft bg-surface-2"
          >
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search phones, brands, models..."
              inputSize="sm"
              className="border-0 bg-transparent focus:ring-0"
            />
            <Button
              type="submit"
              variant="primary"
              className="rounded-none rounded-r-[var(--radius-button)] px-3 py-2"
              aria-label="Search"
            >
              <Search size={16} />
            </Button>
          </form>

          <div className="hidden items-center gap-4 text-[10px] font-semibold uppercase text-text-muted lg:flex">
            <Stat icon={<Lightbulb size={16} />} label="Tip us" />
            <Stat icon={<PlayCircle size={16} />} label="2.1M" />
            <Stat icon={<Camera size={16} />} label="160K" />
            <Stat icon={<Rss size={16} />} label="RSS" />
          </div>

          <div className="flex items-center gap-3 text-text-muted">
            <Moon size={18} className="cursor-pointer hover:text-text-primary transition" />
            <Car size={18} className="hidden cursor-pointer hover:text-text-primary transition sm:block" />
            <ShoppingCart size={18} className="cursor-pointer hover:text-text-primary transition" />
          </div>

          <div className="hidden items-center gap-3 text-[10px] font-semibold uppercase text-text-muted sm:flex">
            <span className="flex flex-col items-center">
              <User size={16} />
              Sign in
            </span>
            <span className="flex flex-col items-center">
              <User size={16} />
              Sign up
            </span>
          </div>
        </Container>
      </div>

      <nav className="border-b-2 border-blue bg-surface-1">
        <Container className="flex flex-wrap items-stretch text-sm font-semibold text-text-secondary">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "-mb-[2px] border-b-2 px-3 py-3 transition",
                  active
                    ? "border-blue text-blue"
                    : "border-transparent hover:text-blue",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </Container>
      </nav>
    </header>
  );
}

function Stat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex cursor-pointer flex-col items-center hover:text-text-primary transition">
      {icon}
      {label}
    </span>
  );
}
