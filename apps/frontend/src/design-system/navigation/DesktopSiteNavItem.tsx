"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";

import { accentForNavHref } from "@/design-system/titan-spectrum/category-accents";
import { cn } from "@/design-system/utils/cn";

import { isSiteNavLinkActive, type SiteNavIcon } from "./site-nav-links";
import { NavLinkIcon } from "./NavLinkIcon";
import {
  navMenuForHref,
  navMenuItemCount,
  navMenuItemKey,
  type NavMenuItem,
  type SiteNavMenu,
} from "./site-nav-menus";

type DesktopSiteNavItemProps = {
  label: string;
  shortLabel: string;
  href: string;
  icon: SiteNavIcon;
  pathname: string;
  search: string;
};

function useNavMenuLabel() {
  const t = useTranslations();
  return useCallback(
    (item: NavMenuItem) => {
      if (item.labelLiteral) return item.labelLiteral;
      if (item.labelKey) {
        try {
          return t(item.labelKey);
        } catch {
          return item.labelKey;
        }
      }
      return "";
    },
    [t],
  );
}

function NavDropdownPanel({
  menu,
  accent,
}: {
  menu: SiteNavMenu;
  accent: ReturnType<typeof accentForNavHref>;
}) {
  const t = useTranslations();
  const labelFor = useNavMenuLabel();
  const multiColumn = navMenuItemCount(menu) > 6;

  return (
    <div
      className="arena-nav-mega-panel spectrum-panel"
      data-titan-accent={accent}
      role="menu"
      aria-label={t("nav.a11y.sectionLinks")}
    >
      <div
        className={cn(
          "arena-nav-mega-grid",
          multiColumn && "arena-nav-mega-grid-wide",
        )}
      >
        {menu.groups.map((group) => (
          <div key={group.titleKey} className="arena-nav-mega-group">
            <p className="arena-nav-mega-group-title">{t(group.titleKey)}</p>
            <ul className="arena-nav-mega-list">
              {group.items.map((item) => (
                <li key={navMenuItemKey(item)}>
                  <Link href={item.href} className="arena-nav-mega-link" role="menuitem">
                    <span className="arena-nav-mega-link-label">{labelFor(item)}</span>
                    {item.descriptionKey ? (
                      <span className="arena-nav-mega-link-desc">
                        {t(item.descriptionKey)}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DesktopSiteNavItem({
  label,
  shortLabel,
  href,
  icon,
  pathname,
  search,
}: DesktopSiteNavItemProps) {
  const menu = navMenuForHref(href);
  const accent = accentForNavHref(href);
  const active = isSiteNavLinkActive(href, pathname, search);
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const openMenu = useCallback(() => {
    if (!menu) return;
    clearCloseTimer();
    setOpen(true);
  }, [clearCloseTimer, menu]);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  }, [clearCloseTimer]);

  return (
    <div
      className={cn("arena-nav-dropdown", open && "arena-nav-dropdown-open")}
      data-titan-accent={accent}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <Link
        href={href}
        title={label}
        data-titan-accent={accent}
        className={cn(
          "arena-floating-nav-link arena-nav-dropdown-trigger",
          active && "arena-floating-nav-link-active",
          active && href.includes("upcoming=1") && "arena-floating-nav-link-subtle-active",
          menu && "arena-nav-dropdown-trigger-has-menu",
        )}
        aria-expanded={menu ? open : undefined}
        aria-haspopup={menu ? "menu" : undefined}
      >
        <NavLinkIcon name={icon} size={12} className="arena-floating-nav-link-icon" />
        <span className="arena-floating-nav-link-text">{shortLabel}</span>
      </Link>

      {menu && open ? (
        <div
          className="arena-nav-mega-wrap"
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
        >
          <NavDropdownPanel menu={menu} accent={accent} />
        </div>
      ) : null}
    </div>
  );
}
