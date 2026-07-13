import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";

import { cn } from "@/design-system/utils/cn";

type SiteLogoProps = {
  href?: string | null;
  className?: string;
  variant?: "desktop" | "mobile";
  onClick?: () => void;
};

export function SiteLogo({
  href = "/",
  className,
  variant = "desktop",
  onClick,
}: SiteLogoProps) {
  const mobile = variant === "mobile";
  const wrapperClass = mobile ? "arena-mobile-header-logo" : "arena-floating-nav-logo";
  const mobileClass = mobile ? "arena-mobile-header-logo-mobile" : "arena-floating-nav-logo-mobile";
  const arenaClass = mobile ? "arena-mobile-header-logo-arena" : "arena-floating-nav-logo-arena";

  const inner: ReactNode = (
    <span className="arena-site-logo-wordmark notranslate">
      <span className={mobileClass}>Mobile</span>
      <span className={arenaClass}>Arena</span>
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(wrapperClass, "arena-site-logo notranslate", className)}
        aria-label="MobileArena home"
        onClick={onClick}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div
      className={cn(wrapperClass, "arena-site-logo notranslate", className)}
      aria-label="MobileArena"
    >
      {inner}
    </div>
  );
}
