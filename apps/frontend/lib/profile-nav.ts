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
  label: string;
  href: string;
  icon: LucideIcon;
  badgeKey?: keyof import("@/lib/api").UserProfile["stats"];
};

export const PROFILE_NAV: ProfileNavItem[] = [
  { label: "Dashboard", href: "/profile", icon: LayoutDashboard },
  { label: "Edit Profile", href: "/profile/edit", icon: UserPen },
  { label: "Change Avatar", href: "/profile/avatar", icon: Image },
  { label: "Favorites", href: "/profile/favorites", icon: Heart, badgeKey: "favoriteDevices" },
  { label: "Bookmarks", href: "/profile/bookmarks", icon: Bookmark, badgeKey: "bookmarks" },
  { label: "Wishlist", href: "/profile/wishlist", icon: Star, badgeKey: "wishlist" },
  {
    label: "Saved Comparisons",
    href: "/profile/comparisons",
    icon: GitCompare,
    badgeKey: "savedComparisons",
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    badgeKey: "notificationsUnread",
  },
  { label: "My Comments", href: "/profile/comments", icon: MessageSquare, badgeKey: "comments" },
  { label: "My Reviews", href: "/profile/reviews", icon: Star, badgeKey: "ratings" },
  { label: "Poll History", href: "/profile/polls", icon: Vote, badgeKey: "pollVotes" },
  { label: "Reputation & Badges", href: "/profile/reputation", icon: Award },
  { label: "Account Settings", href: "/profile/settings", icon: Settings },
  { label: "Security", href: "/profile/security", icon: Shield },
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
