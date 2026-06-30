import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export type DeleteAction =
  | 'delete_one_phone'
  | 'delete_selected_phones'
  | 'delete_one_brand'
  | 'delete_selected_brands'
  | 'delete_one_advertisement'
  | 'delete_selected_advertisements'
  | 'delete_entire_import'
  | 'restore_deleted_import'
  | 'restore_deleted_brands'
  | 'restore_deleted_advertisements'
  | 'permanently_purge'
  | 'clear_deleted_import_history'
  | 'clear_audit_log_history';

/** Upload history, delete, restore, purge, and clear — SUPER_ADMIN only. */
const DELETE_PERMISSIONS: Record<DeleteAction, UserRole[]> = {
  delete_one_phone: [UserRole.SUPER_ADMIN],
  delete_selected_phones: [UserRole.SUPER_ADMIN],
  delete_one_brand: [UserRole.SUPER_ADMIN],
  delete_selected_brands: [UserRole.SUPER_ADMIN],
  delete_one_advertisement: [UserRole.SUPER_ADMIN],
  delete_selected_advertisements: [UserRole.SUPER_ADMIN],
  delete_entire_import: [UserRole.SUPER_ADMIN],
  restore_deleted_import: [UserRole.SUPER_ADMIN],
  restore_deleted_brands: [UserRole.SUPER_ADMIN],
  restore_deleted_advertisements: [UserRole.SUPER_ADMIN],
  permanently_purge: [UserRole.SUPER_ADMIN],
  clear_deleted_import_history: [UserRole.SUPER_ADMIN],
  clear_audit_log_history: [UserRole.SUPER_ADMIN],
};

export function canDeleteAction(role: UserRole, action: DeleteAction): boolean {
  return DELETE_PERMISSIONS[action].includes(role);
}

export function assertDeleteAction(role: UserRole, action: DeleteAction): void {
  if (!canDeleteAction(role, action)) {
    throw new ForbiddenException(
      `Your role cannot perform: ${action.replace(/_/g, ' ')}`,
    );
  }
}

/** Matrix row for admin UI (✅ / ❌). */
export function deletePermissionMatrix(): Record<
  UserRole,
  Record<DeleteAction, boolean>
> {
  const roles = Object.values(UserRole);
  const actions = Object.keys(DELETE_PERMISSIONS) as DeleteAction[];
  return Object.fromEntries(
    roles.map((role) => [
      role,
      Object.fromEntries(
        actions.map((action) => [action, canDeleteAction(role, action)]),
      ),
    ]),
  ) as Record<UserRole, Record<DeleteAction, boolean>>;
}

export const DELETE_ACTION_LABELS: Record<DeleteAction, string> = {
  delete_one_phone: 'Delete one phone',
  delete_selected_phones: 'Delete selected phones',
  delete_one_brand: 'Delete one brand',
  delete_selected_brands: 'Delete selected brands',
  delete_one_advertisement: 'Delete one advertisement',
  delete_selected_advertisements: 'Delete selected advertisements',
  delete_entire_import: 'Delete entire upload',
  restore_deleted_import: 'Restore deleted upload',
  restore_deleted_brands: 'Restore deleted brands',
  restore_deleted_advertisements: 'Restore deleted advertisements',
  permanently_purge: 'Permanently purge (erase) data',
  clear_deleted_import_history: 'Clear deleted upload history',
  clear_audit_log_history: 'Clear audit log history',
};
