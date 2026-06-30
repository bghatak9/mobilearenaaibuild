import { UserRole } from '@prisma/client';

import { STAFF_ROLES } from './role-permissions';
import {
  PASSWORD_POLICY_BY_ROLE,
  PASSWORD_REQUIREMENT_TEXT,
  type PasswordPolicyRule,
} from './password-policy';

export { STAFF_ROLES };

export type StaffPasswordSecurity = {
  role: UserRole;
  passwordsStored: 'bcrypt_hash_only';
  adminCanViewPassword: false;
  passwordPolicy: PasswordPolicyRule;
};

/** Password security applies identically to every staff role. */
export function staffPasswordSecurityMatrix(): StaffPasswordSecurity[] {
  return STAFF_ROLES.map((role) => ({
    role,
    passwordsStored: 'bcrypt_hash_only' as const,
    adminCanViewPassword: false as const,
    passwordPolicy: PASSWORD_POLICY_BY_ROLE[role],
  }));
}

export { PASSWORD_REQUIREMENT_TEXT };
