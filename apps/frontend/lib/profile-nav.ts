import type { LucideIcon } from "lucide-react";
import {
  Award,
  Bell,
  Bookmark,
  GitCompare,
  Heart,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Shield,
  Star,
  UserPen,
  Vote,
  Image,
} from "lucide-react";

export type ProfileNavItem = {
  /** next-intl key under `dashboard.*` */
  labelKey:
    | "title"
    | "editProfile"
    | "changeAvatar"
    | "favorites"
    | "bookmarks"
    | "wishlist"
    | "comparisons"
    | "notifications"
    | "comments"
    | "reviews"
    | "polls"
    | "reputation"
    | "settings"
    | "security";
  href: string;
  icon: LucideIcon;
  badgeKey?: keyof import("@/lib/api").UserProfile["stats"];
};

export const PROFILE_NAV: ProfileNavItem[] = [
  { labelKey: "title", href: "/profile", icon: LayoutDashboard },
  { labelKey: "editProfile", href: "/profile/edit", icon: UserPen },
  { labelKey: "changeAvatar", href: "/profile/avatar", icon: Image },
  { labelKey: "favorites", href: "/profile/favorites", icon: Heart, badgeKey: "favoriteDevices" },
  { labelKey: "bookmarks", href: "/profile/bookmarks", icon: Bookmark, badgeKey: "bookmarks" },
  { labelKey: "wishlist", href: "/profile/wishlist", icon: Star, badgeKey: "wishlist" },
  {
    labelKey: "comparisons",
    href: "/profile/comparisons",
    icon: GitCompare,
    badgeKey: "savedComparisons",
  },
  {
    labelKey: "notifications",
    href: "/notifications",
    icon: Bell,
    badgeKey: "notificationsUnread",
  },
  { labelKey: "comments", href: "/profile/comments", icon: MessageSquare, badgeKey: "comments" },
  { labelKey: "reviews", href: "/profile/reviews", icon: Star, badgeKey: "ratings" },
  { labelKey: "polls", href: "/profile/polls", icon: Vote, badgeKey: "pollVotes" },
  { labelKey: "reputation", href: "/profile/reputation", icon: Award },
  { labelKey: "settings", href: "/profile/settings", icon: Settings },
  { labelKey: "security", href: "/profile/security", icon: Shield },
];

export function bookmarkHref(
  entityType: "DEVICE" | "NEWS" | "REVIEW",
  slug: string | null,
): string {
  if (!slug) return "#";
  switch (entityType) {
    case "DEVICE":
      return `/phones/${slug}`;
    case "NEWS":
      return `/news/${slug}`;
    case "REVIEW":
      return `/reviews/${slug}`;
    default:
      return "#";
  }
}
