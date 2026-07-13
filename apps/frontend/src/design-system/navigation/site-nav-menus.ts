import { FAVORITES_HREF } from "./site-nav-links";

/**
 * Mega-menu structure uses message keys under `nav.menus.*`.
 * Brand proper nouns stay as literal labels (not machine-translated).
 */
export type NavMenuItem = {
  href: string;
  /** next-intl key, e.g. nav.menus.phones.allPhones */
  labelKey?: string;
  /** Proper noun / brand — not translated */
  labelLiteral?: string;
  descriptionKey?: string;
};

export type NavMenuGroup = {
  titleKey: string;
  items: NavMenuItem[];
};

export type SiteNavMenu = {
  groups: NavMenuGroup[];
};

const POPULAR_BRANDS: NavMenuItem[] = [
  { labelLiteral: "Apple", href: "/phones?search=Apple" },
  { labelLiteral: "Samsung", href: "/phones?search=Samsung" },
  { labelLiteral: "Google Pixel", href: "/phones?search=Google" },
  { labelLiteral: "Xiaomi", href: "/phones?search=Xiaomi" },
  { labelLiteral: "OnePlus", href: "/phones?search=OnePlus" },
  { labelLiteral: "Oppo", href: "/phones?search=Oppo" },
  { labelLiteral: "Vivo", href: "/phones?search=Vivo" },
  { labelLiteral: "Motorola", href: "/phones?search=Motorola" },
  { labelLiteral: "Nothing", href: "/phones?search=Nothing" },
  { labelLiteral: "Sony", href: "/phones?search=Sony" },
];

/** Sub-navigation shown on desktop hover and mobile drawer expand. */
export const SITE_NAV_MENUS: Record<string, SiteNavMenu> = {
  "/phones": {
    groups: [
      {
        titleKey: "nav.menus.phones.browse",
        items: [
          {
            labelKey: "nav.menus.phones.allPhones",
            href: "/phones",
            descriptionKey: "nav.menus.phones.allPhonesDesc",
          },
          {
            labelKey: "nav.menus.phones.favoritePhones",
            href: FAVORITES_HREF,
            descriptionKey: "nav.menus.phones.favoritePhonesDesc",
          },
          {
            labelKey: "nav.menus.phones.upcoming",
            href: "/phones?upcoming=1",
            descriptionKey: "nav.menus.phones.upcomingDesc",
          },
        ],
      },
      {
        titleKey: "nav.menus.phones.popularBrands",
        items: POPULAR_BRANDS,
      },
    ],
  },
  "/phone-finder": {
    groups: [
      {
        titleKey: "nav.menus.finder.title",
        items: [
          {
            labelKey: "nav.menus.finder.open",
            href: "/phone-finder",
            descriptionKey: "nav.menus.finder.openDesc",
          },
          {
            labelKey: "nav.menus.finder.bestCamera",
            href: "/phone-finder?preset=camera",
            descriptionKey: "nav.menus.finder.bestCameraDesc",
          },
          {
            labelKey: "nav.menus.finder.bestBattery",
            href: "/phone-finder?preset=battery",
            descriptionKey: "nav.menus.finder.bestBatteryDesc",
          },
          {
            labelKey: "nav.menus.finder.gaming",
            href: "/phone-finder?preset=gaming",
            descriptionKey: "nav.menus.finder.gamingDesc",
          },
          {
            labelKey: "nav.menus.finder.bestValue",
            href: "/phone-finder?preset=value",
            descriptionKey: "nav.menus.finder.bestValueDesc",
          },
          {
            labelKey: "nav.menus.finder.foldables",
            href: "/phone-finder?preset=foldables",
            descriptionKey: "nav.menus.finder.foldablesDesc",
          },
        ],
      },
      {
        titleKey: "nav.menus.finder.quickPicks",
        items: [
          {
            labelKey: "nav.menus.finder.compact",
            href: "/phone-finder?preset=compact",
          },
          {
            labelKey: "nav.menus.finder.flagshipKillers",
            href: "/phone-finder?preset=flagship-killer",
          },
          {
            labelKey: "nav.menus.finder.under20k",
            href: "/phone-finder?preset=under-20k-inr",
          },
          {
            labelKey: "nav.menus.finder.premiumFlagships",
            href: "/phone-finder?preset=premium-flagships",
          },
        ],
      },
    ],
  },
  "/compare": {
    groups: [
      {
        titleKey: "nav.menus.compare.title",
        items: [
          {
            labelKey: "nav.menus.compare.pick",
            href: "/compare",
            descriptionKey: "nav.menus.compare.pickDesc",
          },
          {
            labelKey: "nav.menus.compare.mine",
            href: "/profile/comparisons",
            descriptionKey: "nav.menus.compare.mineDesc",
          },
          {
            labelKey: "nav.menus.compare.finder",
            href: "/phone-finder",
            descriptionKey: "nav.menus.compare.finderDesc",
          },
        ],
      },
    ],
  },
  "/phones?upcoming=1": {
    groups: [
      {
        titleKey: "nav.menus.upcoming.title",
        items: [
          {
            labelKey: "nav.menus.upcoming.all",
            href: "/phones?upcoming=1",
            descriptionKey: "nav.menus.upcoming.allDesc",
          },
          {
            labelKey: "nav.menus.upcoming.allPhones",
            href: "/phones",
            descriptionKey: "nav.menus.upcoming.allPhonesDesc",
          },
          {
            labelKey: "nav.menus.upcoming.finder",
            href: "/phone-finder",
            descriptionKey: "nav.menus.upcoming.finderDesc",
          },
        ],
      },
    ],
  },
  "/news": {
    groups: [
      {
        titleKey: "nav.menus.news.title",
        items: [
          {
            labelKey: "nav.menus.news.latest",
            href: "/news",
            descriptionKey: "nav.menus.news.latestDesc",
          },
          {
            labelKey: "nav.menus.news.reviews",
            href: "/reviews",
            descriptionKey: "nav.menus.news.reviewsDesc",
          },
          {
            labelKey: "nav.menus.news.community",
            href: "/community",
            descriptionKey: "nav.menus.news.communityDesc",
          },
        ],
      },
    ],
  },
  "/reviews": {
    groups: [
      {
        titleKey: "nav.menus.reviews.title",
        items: [
          {
            labelKey: "nav.menus.reviews.all",
            href: "/reviews",
            descriptionKey: "nav.menus.reviews.allDesc",
          },
          {
            labelKey: "nav.menus.reviews.community",
            href: "/community",
            descriptionKey: "nav.menus.reviews.communityDesc",
          },
          {
            labelKey: "nav.menus.reviews.compare",
            href: "/compare",
            descriptionKey: "nav.menus.reviews.compareDesc",
          },
        ],
      },
    ],
  },
  "/community": {
    groups: [
      {
        titleKey: "nav.menus.community.title",
        items: [
          {
            labelKey: "nav.menus.community.hub",
            href: "/community",
            descriptionKey: "nav.menus.community.hubDesc",
          },
          {
            labelKey: "nav.menus.community.discussions",
            href: "/discussions",
            descriptionKey: "nav.menus.community.discussionsDesc",
          },
          {
            labelKey: "nav.menus.community.guidelines",
            href: "/community-guidelines",
            descriptionKey: "nav.menus.community.guidelinesDesc",
          },
        ],
      },
    ],
  },
  "/ev": {
    groups: [
      {
        titleKey: "nav.menus.ev.title",
        items: [
          {
            labelKey: "nav.menus.ev.hub",
            href: "/ev",
            descriptionKey: "nav.menus.ev.hubDesc",
          },
          {
            labelKey: "nav.menus.ev.cars",
            href: "/ev/cars",
            descriptionKey: "nav.menus.ev.carsDesc",
          },
          {
            labelKey: "nav.menus.ev.suvs",
            href: "/ev/suvs",
            descriptionKey: "nav.menus.ev.suvsDesc",
          },
          {
            labelKey: "nav.menus.ev.trucks",
            href: "/ev/trucks",
            descriptionKey: "nav.menus.ev.trucksDesc",
          },
          {
            labelKey: "nav.menus.ev.bikes",
            href: "/ev/bikes",
            descriptionKey: "nav.menus.ev.bikesDesc",
          },
          {
            labelKey: "nav.menus.ev.news",
            href: "/ev/news",
            descriptionKey: "nav.menus.ev.newsDesc",
          },
          {
            labelKey: "nav.menus.ev.reviews",
            href: "/ev/reviews",
            descriptionKey: "nav.menus.ev.reviewsDesc",
          },
          {
            labelKey: "nav.menus.ev.compare",
            href: "/ev/compare",
            descriptionKey: "nav.menus.ev.compareDesc",
          },
          {
            labelKey: "nav.menus.ev.upcoming",
            href: "/ev/upcoming",
            descriptionKey: "nav.menus.ev.upcomingDesc",
          },
        ],
      },
    ],
  },
  "/contact": {
    groups: [
      {
        titleKey: "nav.menus.contact.title",
        items: [
          {
            labelKey: "nav.menus.contact.us",
            href: "/contact",
            descriptionKey: "nav.menus.contact.usDesc",
          },
          {
            labelKey: "nav.menus.contact.guidelines",
            href: "/community-guidelines",
          },
          {
            labelKey: "nav.menus.contact.terms",
            href: "/terms",
          },
          {
            labelKey: "nav.menus.contact.privacy",
            href: "/privacy",
          },
        ],
      },
    ],
  },
};

export function navMenuForHref(href: string): SiteNavMenu | undefined {
  return SITE_NAV_MENUS[href];
}

export function navMenuItemCount(menu: SiteNavMenu): number {
  return menu.groups.reduce((sum, group) => sum + group.items.length, 0);
}

export function navMenuItemKey(item: NavMenuItem): string {
  return item.href + (item.labelKey ?? item.labelLiteral ?? "");
}
