import { UserRole } from '@prisma/client';

/** Roles that may access the admin panel at all. */
export const STAFF_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.EDITOR,
  UserRole.AUTHOR,
  UserRole.MODERATOR,
];

export function isStaff(role: UserRole): boolean {
  return STAFF_ROLES.includes(role);
}

/** Roles an actor may assign when creating or promoting a user. */
export function assignableRoles(actor: UserRole): UserRole[] {
  switch (actor) {
    case UserRole.SUPER_ADMIN:
      return [
        UserRole.ADMIN,
        UserRole.EDITOR,
        UserRole.AUTHOR,
        UserRole.MODERATOR,
        UserRole.USER,
      ];
    case UserRole.ADMIN:
      return [
        UserRole.EDITOR,
        UserRole.AUTHOR,
        UserRole.MODERATOR,
        UserRole.USER,
      ];
    default:
      return [];
  }
}

/** Whether `actor` may manage (view/edit/delete) `target`. */
export function canManageUser(actor: UserRole, target: UserRole): boolean {
  if (actor === UserRole.SUPER_ADMIN) return target !== UserRole.SUPER_ADMIN;
  if (actor === UserRole.ADMIN) {
    return (
      target !== UserRole.SUPER_ADMIN &&
      target !== UserRole.ADMIN
    );
  }
  return false;
}

export function canManageUsers(actor: UserRole): boolean {
  return actor === UserRole.SUPER_ADMIN || actor === UserRole.ADMIN;
}

export function canManageDevices(actor: UserRole): boolean {
  return actor === UserRole.SUPER_ADMIN || actor === UserRole.ADMIN;
}

export function canPublishContent(actor: UserRole): boolean {
  return (
    actor === UserRole.SUPER_ADMIN ||
    actor === UserRole.ADMIN ||
    actor === UserRole.EDITOR
  );
}

export function canWriteContent(actor: UserRole): boolean {
  return canPublishContent(actor) || actor === UserRole.AUTHOR;
}

export function canModerateComments(actor: UserRole): boolean {
  return (
    actor === UserRole.SUPER_ADMIN ||
    actor === UserRole.ADMIN ||
    actor === UserRole.EDITOR ||
    actor === UserRole.MODERATOR
  );
}
