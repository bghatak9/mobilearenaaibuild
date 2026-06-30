import { BadRequestException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

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

/** Minimum password rules by role (all roles share the same policy today). */
export const PASSWORD_POLICY_BY_ROLE: Record<UserRole, PasswordPolicyRule> = {
  [UserRole.USER]: DEFAULT_RULE,
  [UserRole.AUTHOR]: DEFAULT_RULE,
  [UserRole.EDITOR]: DEFAULT_RULE,
  [UserRole.MODERATOR]: DEFAULT_RULE,
  [UserRole.ADMIN]: DEFAULT_RULE,
  [UserRole.SUPER_ADMIN]: DEFAULT_RULE,
};

export const PASSWORD_REQUIREMENT_TEXT =
  'At least 8 characters with uppercase, lowercase, number, and special character.';

export function getPasswordPolicy(role: UserRole = UserRole.USER): PasswordPolicyRule {
  return PASSWORD_POLICY_BY_ROLE[role] ?? DEFAULT_RULE;
}

export function passwordPolicyErrors(
  password: string,
  role: UserRole = UserRole.USER,
): string[] {
  const policy = getPasswordPolicy(role);
  const errors: string[] = [];

  if (password.length < policy.minLength) {
    errors.push(`at least ${policy.minLength} characters`);
  }
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('an uppercase letter');
  }
  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('a lowercase letter');
  }
  if (policy.requireNumber && !/[0-9]/.test(password)) {
    errors.push('a number');
  }
  if (policy.requireSpecial && !/[^A-Za-z0-9]/.test(password)) {
    errors.push('a special character');
  }

  return errors;
}

export function isPasswordValid(
  password: string,
  role: UserRole = UserRole.USER,
): boolean {
  return passwordPolicyErrors(password, role).length === 0;
}

export function assertPasswordMeetsPolicy(
  password: string,
  role: UserRole = UserRole.USER,
): void {
  const errors = passwordPolicyErrors(password, role);
  if (errors.length === 0) return;

  throw new BadRequestException(
    `Password must include ${errors.join(', ')}.`,
  );
}
