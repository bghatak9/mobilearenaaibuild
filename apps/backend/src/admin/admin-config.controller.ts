import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PASSWORD_POLICY_BY_ROLE } from '../auth/password-policy';
import { BCRYPT_ROUNDS } from '../auth/password-crypto';
import {
  PASSWORD_REQUIREMENT_TEXT,
  staffPasswordSecurityMatrix,
  STAFF_ROLES,
} from '../auth/staff-password-policy';
import {
  contentAccessMatrix,
  getImportKindsForRole,
  ROLE_RESPONSIBILITIES,
} from '../auth/content-permissions';
import {
  IMPORT_STRATEGY,
  pdfPermissionMatrix,
  pdfPhonesPolicy,
} from '../import/import-file-policy';
import { deletePermissionMatrix } from '../import/delete-permissions';

@Controller('admin/config')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminConfigController {
  @Get('auth-policy')
  @Roles(UserRole.SUPER_ADMIN)
  authPolicy() {
    return {
      passwordsStored: 'hash_only',
      passwordHashAlgorithm: 'bcrypt',
      bcryptRounds: BCRYPT_ROUNDS,
      adminCanViewPasswords: false,
      passwordReset: 'email_otp',
      googleSignInEnabled: Boolean(process.env.GOOGLE_CLIENT_ID?.trim()),
      resetPath: '/forgot-password',
      passwordPolicy: Object.fromEntries(
        Object.values(UserRole).map((role) => [
          role,
          staffPasswordSecurityMatrix().find((x) => x.role === role)
            ?.passwordPolicy ?? PASSWORD_POLICY_BY_ROLE[role],
        ]),
      ),
      passwordRequirementText: PASSWORD_REQUIREMENT_TEXT,
      staffRoles: STAFF_ROLES,
      staffPasswordSecurity: staffPasswordSecurityMatrix(),
    };
  }

  @Get('content-policy')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.EDITOR,
    UserRole.AUTHOR,
    UserRole.MODERATOR,
  )
  contentPolicy(@Req() req: { user: { role: UserRole } }) {
    const role = req.user.role;
    return {
      matrix: contentAccessMatrix(),
      imports: getImportKindsForRole(role),
      responsibilities: ROLE_RESPONSIBILITIES,
      areas: ['phones', 'news', 'brands', 'images', 'prices', 'users'] as const,
      importStrategy: IMPORT_STRATEGY,
      pdfPermissions: pdfPermissionMatrix(),
      pdfPhonesPolicy: pdfPhonesPolicy(),
      deletePermissions: deletePermissionMatrix(),
    };
  }
}
