import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Restrict a route (or controller) to the given user roles. Must be used
 * together with JwtAuthGuard + RolesGuard so `request.user.role` is populated.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
