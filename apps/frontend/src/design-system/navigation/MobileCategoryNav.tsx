"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { cn } from "@/design-system/utils/cn";
import { accentForNavHref } from "@/design-system/titan-spectrum/category-accents";
import {
  isSiteNavLinkActive,
  SITE_NAV_LINKS,
} from "@/design-system/navigation/site-nav-links";

/** Horizontal quick nav — same links as desktop + scroll hint arrow. */
export function MobileCategoryNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  return (
    <nav className="arena-mobile-category-nav" aria-label="Main navigation">
      <div className="arena-mobile-category-scroll">
        {SITE_NAV_LINKS.map((link) => {
          const active = isSiteNavLinkActive(link.href, pathname, search);
          return (
            <Link
              key={link.href}
              href={link.href}
              data-titan-accent={accentForNavHref(link.href)}
              className={cn(
                "arena-mobile-category-link",
                active && "arena-mobile-category-link-active",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
      <span className="arena-mobile-category-more" aria-hidden>
        <ChevronRight size={16} strokeWidth={2.75} />
      </span>
    </nav>
  );
}
