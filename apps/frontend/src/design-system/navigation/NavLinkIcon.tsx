import {
  CalendarClock,
  Car,
  GitCompareArrows,
  Mail,
  Newspaper,
  Search,
  Smartphone,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { SiteNavIcon } from "@/design-system/navigation/site-nav-links";

const ICONS: Record<SiteNavIcon, LucideIcon> = {
  brands: Smartphone,
  finder: Search,
  compare: GitCompareArrows,
  upcoming: CalendarClock,
  news: Newspaper,
  reviews: Star,
  community: Users,
  ev: Car,
  contact: Mail,
};

type NavLinkIconProps = {
  name: SiteNavIcon;
  size?: number;
  className?: string;
};

export function NavLinkIcon({ name, size = 14, className }: NavLinkIconProps) {
  const Icon = ICONS[name];
  return <Icon size={size} strokeWidth={2.25} className={className} aria-hidden />;
}
