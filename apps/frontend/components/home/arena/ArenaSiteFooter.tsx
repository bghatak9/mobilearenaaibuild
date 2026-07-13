"use client";

import { Link } from "@/i18n/navigation";

import {
  FacebookLogo,
  InstagramLogo,
  XLogo,
  YoutubeLogo,
} from "@/components/auth/SocialAuthIcons";
import type { MessageKey } from "@/features/i18n";
import { getSiteSocialLinks, type SiteSocialId } from "@/lib/site-social-links";
import { useSiteLanguage } from "@/lib/site-language";

type FooterLink = { labelKey: MessageKey; href: string };

const COLUMNS: { titleKey: MessageKey; links: FooterLink[] }[] = [
  {
    titleKey: "footer.arena",
    links: [
      { labelKey: "footer.aboutUs", href: "/about" },
      { labelKey: "footer.contact", href: "/contact" },
      { labelKey: "footer.guidelines", href: "/community-guidelines" },
      { labelKey: "footer.discussions", href: "/discussions" },
      { labelKey: "footer.createAccount", href: "/signup" },
    ],
  },
  {
    titleKey: "footer.workWithUs",
    links: [
      { labelKey: "footer.advertise", href: "/contact" },
      { labelKey: "footer.partnerships", href: "/contact" },
      { labelKey: "footer.press", href: "/contact" },
    ],
  },
  {
    titleKey: "footer.discover",
    links: [
      { labelKey: "footer.home", href: "/" },
      { labelKey: "footer.news", href: "/news" },
      { labelKey: "footer.phones", href: "/phones" },
      { labelKey: "footer.brands", href: "/brands" },
      { labelKey: "footer.reviews", href: "/reviews" },
      { labelKey: "footer.compare", href: "/compare" },
      { labelKey: "footer.phoneFinder", href: "/phone-finder" },
      { labelKey: "footer.guides", href: "/guides" },
      { labelKey: "footer.community", href: "/community" },
      { labelKey: "footer.evHub", href: "/ev" },
    ],
  },
  {
    titleKey: "footer.support",
    links: [
      { labelKey: "footer.terms", href: "/terms" },
      { labelKey: "footer.privacy", href: "/privacy" },
      { labelKey: "footer.guidelines", href: "/community-guidelines" },
      { labelKey: "footer.help", href: "/contact" },
    ],
  },
];

const SOCIAL_ICONS = {
  facebook: FacebookLogo,
  youtube: YoutubeLogo,
  x: XLogo,
  instagram: InstagramLogo,
} as const satisfies Record<SiteSocialId, typeof YoutubeLogo>;

export function ArenaSiteFooter() {
  const year = new Date().getFullYear();
  const socials = getSiteSocialLinks();
  const { t } = useSiteLanguage();

  return (
    <footer
      className="ma-footer arena-intl-chrome notranslate"
      aria-label="Site footer"
      translate="no"
    >
      <div className="ma-footer__spectrum" aria-hidden />
      <div className="ma-footer__inner">
        <div className="ma-footer__masthead">
          <div className="ma-footer__brand">
            <Link
              href="/"
              className="ma-footer__mark"
              aria-label="MobileArena home"
            >
              <span className="ma-footer__mark-mobile">Mobile</span>
              <span className="ma-footer__mark-arena">Arena</span>
            </Link>
            <p className="ma-footer__promise">{t("footer.promise")}</p>
          </div>

          <ul className="ma-footer__social" aria-label="Social media">
            {socials.map((link) => {
              const Icon = SOCIAL_ICONS[link.id];
              return (
                <li key={link.id}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    title={link.label}
                  >
                    <Icon className="h-[17px] w-[17px]" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <nav className="ma-footer__columns" aria-label="Footer navigation">
          {COLUMNS.map((column) => (
            <div key={column.titleKey} className="ma-footer__column">
              <p className="ma-footer__heading">{t(column.titleKey)}</p>
              <ul className="ma-footer__list">
                {column.links.map((link) => (
                  <li key={`${link.href}-${link.labelKey}`}>
                    <Link href={link.href}>{t(link.labelKey)}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <p className="ma-footer__copy">{t("footer.copyright", { year })}</p>
      </div>
    </footer>
  );
}
