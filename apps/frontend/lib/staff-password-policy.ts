import type { UserRole } from "@/lib/roles";
import { STAFF_ROLES, roleLabel } from "@/lib/roles";
import { PASSWORD_REQUIREMENT_TEXT } from "@/lib/password-policy";

export type StaffPasswordSecurityRow = {
  role: UserRole;
  passwordsStored: "bcrypt_hash_only";
  adminCanViewPassword: false;
  requirements: string;
};

/** Password security for SUPER_ADMIN, ADMIN, EDITOR, AUTHOR, MODERATOR. */
export const STAFF_PASSWORD_SECURITY: StaffPasswordSecurityRow[] =
  STAFF_ROLES.map((role) => ({
    role,
    passwordsStored: "bcrypt_hash_only",
    adminCanViewPassword: false,
    requirements: PASSWORD_REQUIREMENT_TEXT,
  }));

export function staffRoleLabel(role: UserRole): string {
  return roleLabel(role);
}
