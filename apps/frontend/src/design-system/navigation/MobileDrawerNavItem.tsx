"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

import { accentForNavHref } from "@/design-system/titan-spectrum/category-accents";
import { cn } from "@/design-system/utils/cn";

import { isSiteNavLinkActive } from "./site-nav-links";
import {
  navMenuForHref,
  navMenuItemKey,
  type NavMenuItem,
} from "./site-nav-menus";

type MobileDrawerNavItemProps = {
  label: string;
  href: string;
  pathname: string;
  search: string;
  onNavigate: () => void;
};

export function MobileDrawerNavItem({
  label,
  href,
  pathname,
  search,
  onNavigate,
}: MobileDrawerNavItemProps) {
  const t = useTranslations();
  const menu = navMenuForHref(href);
  const accent = accentForNavHref(href);
  const active = isSiteNavLinkActive(href, pathname, search);

  const labelFor = (item: NavMenuItem) => {
    if (item.labelLiteral) return item.labelLiteral;
    if (item.labelKey) {
      try {
        return t(item.labelKey);
      } catch {
        return item.labelKey;
      }
    }
    return "";
  };

  return (
    <div className="arena-mobile-drawer-section" data-titan-accent={accent}>
      <Link
        href={href}
        className={cn(
          "arena-mobile-drawer-link",
          active && "arena-mobile-drawer-link-active",
        )}
        onClick={onNavigate}
      >
        {label}
      </Link>

      {menu ? (
        <div className="arena-mobile-drawer-submenu">
          {menu.groups.map((group) => (
            <div key={group.titleKey} className="arena-mobile-drawer-submenu-group">
              <p className="arena-mobile-drawer-submenu-title">{t(group.titleKey)}</p>
              <ul className="arena-mobile-drawer-submenu-list">
                {group.items.map((item) => (
                  <li key={navMenuItemKey(item)}>
                    <Link
                      href={item.href}
                      className="arena-mobile-drawer-sublink"
                      onClick={onNavigate}
                    >
                      {labelFor(item)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
