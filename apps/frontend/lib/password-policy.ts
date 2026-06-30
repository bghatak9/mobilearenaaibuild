import type { UserRole } from "@/lib/roles";
import { STAFF_ROLES } from "@/lib/roles";

export type PasswordPolicyRule = {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecial: boolean;
};

const DEFAULT_RULE: PasswordPolicyRule = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
};

export const PASSWORD_POLICY_BY_ROLE: Record<UserRole, PasswordPolicyRule> = {
  SUPER_ADMIN: DEFAULT_RULE,
  ADMIN: DEFAULT_RULE,
  EDITOR: DEFAULT_RULE,
  AUTHOR: DEFAULT_RULE,
  MODERATOR: DEFAULT_RULE,
  USER: DEFAULT_RULE,
};

export const PASSWORD_REQUIREMENT_TEXT =
  "At least 8 characters with uppercase, lowercase, number, and special character.";

export const PASSWORD_POLICY_ROWS: {
  role: UserRole;
  minLength: number;
  requirements: string;
}[] = STAFF_ROLES.map((role) => ({
  role,
  minLength: DEFAULT_RULE.minLength,
  requirements: "Uppercase, lowercase, number, special character",
}));

export function passwordPolicyErrors(
  password: string,
  role: UserRole = "USER",
): string[] {
  const policy = PASSWORD_POLICY_BY_ROLE[role] ?? DEFAULT_RULE;
  const errors: string[] = [];

  if (password.length < policy.minLength) {
    errors.push(`at least ${policy.minLength} characters`);
  }
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("an uppercase letter");
  }
  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("a lowercase letter");
  }
  if (policy.requireNumber && !/[0-9]/.test(password)) {
    errors.push("a number");
  }
  if (policy.requireSpecial && !/[^A-Za-z0-9]/.test(password)) {
    errors.push("a special character");
  }

  return errors;
}

export function isPasswordValid(
  password: string,
  role: UserRole = "USER",
): boolean {
  return passwordPolicyErrors(password, role).length === 0;
}

export function passwordValidationMessage(
  password: string,
  role: UserRole = "USER",
): string | null {
  const errors = passwordPolicyErrors(password, role);
  if (errors.length === 0) return null;
  return `Password must include ${errors.join(", ")}.`;
}
