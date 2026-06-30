import { canAccessArea } from "./content-permissions";

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "EDITOR"
  | "AUTHOR"
  | "MODERATOR"
  | "USER";

/** Auth policy note appended to role descriptions. */
export const AUTH_POLICY_NOTE =
  " — password sign-in; email OTP for password reset; Google optional";

/** Human-readable role responsibilities. */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  SUPER_ADMIN: `Platform owner — full system access${AUTH_POLICY_NOTE}`,
  ADMIN: `Business content, catalog uploads & moderation${AUTH_POLICY_NOTE}`,
  EDITOR: `Publish news and reviews${AUTH_POLICY_NOTE}`,
  AUTHOR: `Write drafts (no direct publish)${AUTH_POLICY_NOTE}`,
  MODERATOR: `Comment moderation${AUTH_POLICY_NOTE}`,
  USER: `Public registered accounts${AUTH_POLICY_NOTE}`,
};

/** Full hierarchy — highest privilege first. */
export const ROLE_HIERARCHY: UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "EDITOR",
  "AUTHOR",
  "MODERATOR",
  "USER",
];

const ROLE_PRIORITY = Object.fromEntries(
  ROLE_HIERARCHY.map((role, index) => [role, index]),
) as Record<UserRole, number>;

/** Staff roles assignable below SUPER_ADMIN (shown in role management). */
export const MANAGED_STAFF_ROLES: UserRole[] = [
  "ADMIN",
  "EDITOR",
  "AUTHOR",
  "MODERATOR",
];

export const STAFF_ROLES: UserRole[] = ROLE_HIERARCHY.filter(
  (role) => role !== "USER",
) as UserRole[];

export function compareRoles(a: UserRole, b: UserRole): number {
  return (ROLE_PRIORITY[a] ?? 99) - (ROLE_PRIORITY[b] ?? 99);
}

export function sortRoles(roles: UserRole[]): UserRole[] {
  return [...roles].sort(compareRoles);
}

export function sortUsersByRole<
  T extends { role: UserRole; name?: string | null; email: string },
>(users: T[]): T[] {
  return [...users].sort((a, b) => {
    const byRole = compareRoles(a.role, b.role);
    if (byRole !== 0) return byRole;
    return (a.name ?? a.email).localeCompare(b.name ?? b.email, undefined, {
      sensitivity: "base",
    });
  });
}

export function isStaff(role: UserRole | null | undefined): boolean {
  return role != null && STAFF_ROLES.includes(role);
}

export function canManageUsers(role: UserRole | null | undefined): boolean {
  return role === "SUPER_ADMIN";
}

export function canManagePhones(role: UserRole | null | undefined): boolean {
  return canAccessArea(role, "phones");
}

export function canManageBrands(role: UserRole | null | undefined): boolean {
  return canAccessArea(role, "brands");
}

export function canManagePrices(role: UserRole | null | undefined): boolean {
  return canAccessArea(role, "prices");
}

export function canManageNewsArea(role: UserRole | null | undefined): boolean {
  return canAccessArea(role, "news");
}

export {
  canAccessArea,
  canImport,
  contentAccessMatrix,
  getImportKindsForRole,
  CONTENT_AREAS,
  CONTENT_AREA_LABELS,
  IMAGE_SCOPE_NOTES,
  IMPORT_KIND_HINTS,
  IMPORT_KIND_LABELS,
  ROLE_RESPONSIBILITIES,
  type ContentArea,
  type ImportKind,
} from "./content-permissions";

export function canManageContent(role: UserRole | null | undefined): boolean {
  return (
    role === "SUPER_ADMIN" ||
    role === "ADMIN" ||
    role === "EDITOR" ||
    role === "AUTHOR"
  );
}

export function canModerate(role: UserRole | null | undefined): boolean {
  return (
    role === "SUPER_ADMIN" ||
    role === "ADMIN" ||
    role === "EDITOR" ||
    role === "MODERATOR"
  );
}

export function roleLabel(role: UserRole): string {
  return role.replace(/_/g, " ");
}

export function roleDescription(role: UserRole): string {
  return ROLE_DESCRIPTIONS[role] ?? "";
}

export function assignableRoles(actor: UserRole): UserRole[] {
  switch (actor) {
    case "SUPER_ADMIN":
      return sortRoles(["ADMIN", "EDITOR", "AUTHOR", "MODERATOR"]);
    case "ADMIN":
      return sortRoles(["EDITOR", "AUTHOR", "MODERATOR"]);
    default:
      return [];
  }
}

/** Decode the JWT payload client-side (signature is verified server-side). */
export function decodeJwtPayload(token: string): {
  sub?: number;
  email?: string;
  role?: UserRole;
  name?: string;
} | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as {
      sub?: number;
      email?: string;
      role?: UserRole;
      name?: string;
    };
  } catch {
    return null;
  }
}
