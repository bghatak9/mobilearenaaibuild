import type { UserRole } from "./roles";
import {
  getImportKindsForRole,
  canImportPaidAds,
  canViewRevenueAnalytics,
} from "./content-permissions";

export type AdminNavItemDef = {
  label: string;
  href: string;
  /** Lucide icon key — mapped in the admin layout. */
  icon:
    | "users"
    | "settings"
    | "shield"
    | "bar-chart"
    | "user-plus"
    | "file-text"
    | "newspaper"
    | "star"
    | "message-square"
    | "layout-dashboard"
    | "upload"
    | "megaphone"
    | "revenue"
    | "languages";
};

/** Full nav catalogue; visibility is driven per-role below. */
export const ADMIN_NAV_CATALOG: AdminNavItemDef[] = [
  {
    label: "User Management",
    href: "/admin/users",
    icon: "users",
  },
  {
    label: "System Settings",
    href: "/admin/settings",
    icon: "settings",
  },
  {
    label: "Role Management",
    href: "/admin/roles",
    icon: "shield",
  },
  {
    label: "Analytics Dashboard",
    href: "/admin/metrics",
    icon: "bar-chart",
  },
  {
    label: "Admin Creation",
    href: "/admin/admins/new",
    icon: "user-plus",
  },
  {
    label: "Bulk Upload",
    href: "/admin/import",
    icon: "upload",
  },
  {
    label: "Paid Advertisements",
    href: "/admin/advertisements",
    icon: "megaphone",
  },
  {
    label: "Revenue Analytics",
    href: "/admin/revenue",
    icon: "revenue",
  },
  {
    label: "Articles",
    href: "/admin/articles",
    icon: "file-text",
  },
  { label: "News", href: "/admin/news", icon: "newspaper" },
  { label: "Reviews", href: "/admin/reviews", icon: "star" },
  {
    label: "Moderation",
    href: "/admin/comments",
    icon: "message-square",
  },
  {
    label: "Translations",
    href: "/admin/translations",
    icon: "languages",
  },
  {
    label: "Dashboard",
    href: "/admin",
    icon: "layout-dashboard",
  },
];

/** Ordered href allow-list per role (exact labels the user should see). */
export const ROLE_NAV_HREFS: Record<UserRole, string[]> = {
  SUPER_ADMIN: [
    "/admin/users",
    "/admin/import",
    "/admin/advertisements",
    "/admin/revenue",
    "/admin/settings",
    "/admin/roles",
    "/admin/metrics",
    "/admin/admins/new",
    "/admin/translations",
  ],
  ADMIN: [
    "/admin/import",
    "/admin/advertisements",
    "/admin/news",
    "/admin/reviews",
    "/admin/comments",
    "/admin/translations",
  ],
  EDITOR: [
    "/admin/import",
    "/admin/articles",
    "/admin/news",
    "/admin/reviews",
    "/admin/translations",
  ],
  AUTHOR: [
    "/admin/import",
    "/admin/articles",
    "/admin/reviews",
    "/admin/translations",
  ],
  MODERATOR: ["/admin/import", "/admin/comments"],
  USER: [],
};

/** Nav hrefs allowed for a role (bulk upload only when role has upload kinds). */
export function navHrefsForRole(role: UserRole): string[] {
  const base = ROLE_NAV_HREFS[role] ?? [];
  const hasImport = getImportKindsForRole(role).length > 0;
  return base.filter((href) => {
    if (href === "/admin/import" && !hasImport) return false;
    if (href === "/admin/advertisements" && !canImportPaidAds(role)) {
      return false;
    }
    if (href === "/admin/revenue" && !canViewRevenueAnalytics(role)) {
      return false;
    }
    return true;
  });
}

export function getNavForRole(
  role: UserRole | null | undefined,
): AdminNavItemDef[] {
  if (!role) return [];
  const allowed = navHrefsForRole(role);
  const byHref = new Map(ADMIN_NAV_CATALOG.map((item) => [item.href, item]));
  return allowed
    .map((href) => byHref.get(href))
    .filter((item): item is AdminNavItemDef => item != null);
}

export function getDefaultAdminPath(role: UserRole): string {
  return getNavForRole(role)[0]?.href ?? "/admin/login";
}

/** Expected sidebar labels for automated role-nav checks. */
export const EXPECTED_NAV_LABELS: Partial<Record<UserRole, string[]>> = {
  SUPER_ADMIN: [
    "User Management",
    "Bulk Upload",
    "Paid Advertisements",
    "Revenue Analytics",
    "System Settings",
    "Role Management",
    "Analytics Dashboard",
    "Admin Creation",
  ],
  EDITOR: ["Articles", "News", "Reviews"],
};
