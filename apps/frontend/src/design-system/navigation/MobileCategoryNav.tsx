"use client";

import { Link } from "@/i18n/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/design-system/utils/cn";
import { accentForNavHref } from "@/design-system/titan-spectrum/category-accents";
import {
  isSiteNavLinkActive,
  SITE_NAV_LINKS,
  SITE_NAV_MESSAGE_KEYS,
} from "@/design-system/navigation/site-nav-links";
import { useSiteLanguage } from "@/lib/site-language";

/** Horizontal quick nav — same links as desktop + scroll hint arrow. */
export function MobileCategoryNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const { t } = useSiteLanguage();
  const tNav = useTranslations("nav");

  return (
    <nav className="arena-mobile-category-nav" aria-label={tNav("a11y.main")}>
      <div className="arena-mobile-category-scroll">
        {SITE_NAV_LINKS.map((link) => {
          const active = isSiteNavLinkActive(link.href, pathname, search);
          const keys = SITE_NAV_MESSAGE_KEYS[link.icon];
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
              {t(keys.label)}
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
