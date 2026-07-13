"use client";

import {
  FacebookLogo,
  InstagramLogo,
  XLogo,
  YoutubeLogo,
} from "@/components/auth/SocialAuthIcons";
import { getSiteSocialLinks, type SiteSocialId } from "@/lib/site-social-links";
import { cn } from "@/design-system/utils/cn";

const SOCIAL_ICONS: Record<SiteSocialId, typeof YoutubeLogo> = {
  facebook: FacebookLogo,
  youtube: YoutubeLogo,
  x: XLogo,
  instagram: InstagramLogo,
};

type Props = {
  className?: string;
  iconClassName?: string;
  /** Drawer uses larger tap targets; footer uses circular brand icons. */
  variant?: "header" | "drawer" | "footer";
};

export function SiteSocialLinks({
  className,
  iconClassName,
  variant = "header",
}: Props) {
  const links = getSiteSocialLinks();

  return (
    <div
      className={cn(
        "arena-site-social",
        variant === "drawer" && "arena-site-social--drawer",
        variant === "footer" && "arena-site-social--footer",
        className,
      )}
      role="list"
      aria-label="Social media"
    >
      {links.map((link) => {
        const Icon = SOCIAL_ICONS[link.id];
        return (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              variant === "header" && "arena-floating-nav-icon arena-site-social__link",
              variant === "drawer" && "arena-site-social__drawer-link",
              variant === "footer" && "arena-site-social__footer-link",
              iconClassName,
            )}
            aria-label={link.label}
            title={link.label}
            role="listitem"
          >
            <Icon
              className={cn(
                "h-[17px] w-[17px]",
                variant === "drawer" && "h-[18px] w-[18px]",
                variant === "footer" && "h-[18px] w-[18px]",
              )}
            />
          </a>
        );
      })}
    </div>
  );
}
