import type { UserRole } from "./roles";

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
    | "layout-dashboard";
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
    label: "Metrics Dashboard",
    href: "/admin/metrics",
    icon: "bar-chart",
  },
  {
    label: "Admin Creation",
    href: "/admin/admins/new",
    icon: "user-plus",
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
    label: "Dashboard",
    href: "/admin",
    icon: "layout-dashboard",
  },
];

/** Ordered href allow-list per role (exact labels the user should see). */
export const ROLE_NAV_HREFS: Record<UserRole, string[]> = {
  SUPER_ADMIN: [
    "/admin/users",
    "/admin/settings",
    "/admin/roles",
    "/admin/metrics",
    "/admin/admins/new",
  ],
  ADMIN: [
    "/admin/users",
    "/admin/news",
    "/admin/reviews",
    "/admin/comments",
  ],
  EDITOR: ["/admin/articles", "/admin/news", "/admin/reviews"],
  AUTHOR: ["/admin/articles", "/admin/news", "/admin/reviews"],
  MODERATOR: ["/admin/comments"],
  USER: [],
};

export function getNavForRole(
  role: UserRole | null | undefined,
): AdminNavItemDef[] {
  if (!role) return [];
  const allowed = ROLE_NAV_HREFS[role] ?? [];
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
    "System Settings",
    "Role Management",
    "Metrics Dashboard",
    "Admin Creation",
  ],
  EDITOR: ["Articles", "News", "Reviews"],
};
