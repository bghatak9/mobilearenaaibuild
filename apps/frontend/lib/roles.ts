export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "EDITOR"
  | "AUTHOR"
  | "MODERATOR"
  | "USER";

export const STAFF_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "EDITOR",
  "AUTHOR",
  "MODERATOR",
];

export function isStaff(role: UserRole | null | undefined): boolean {
  return role != null && STAFF_ROLES.includes(role);
}

export function canManageUsers(role: UserRole | null | undefined): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

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

export function assignableRoles(actor: UserRole): UserRole[] {
  switch (actor) {
    case "SUPER_ADMIN":
      return ["ADMIN", "EDITOR", "AUTHOR", "MODERATOR", "USER"];
    case "ADMIN":
      return ["EDITOR", "AUTHOR", "MODERATOR", "USER"];
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
