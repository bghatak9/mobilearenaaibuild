import { UserRole } from '@prisma/client';

/** Content areas governed by the MobileArena access policy. */
export type ContentArea =
  | 'phones'
  | 'news'
  | 'brands'
  | 'images'
  | 'prices'
  | 'users';

export type ImportKind =
  | 'users'
  | 'phones'
  | 'upcoming-devices'
  | 'brands'
  | 'prices'
  | 'images'
  | 'news'
  | 'reviews'
  | 'documentation'
  | 'advertisements'
  | 'article-images';

const AREA_ACCESS: Record<ContentArea, UserRole[]> = {
  phones: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  news: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR],
  brands: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  images: [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.EDITOR,
    UserRole.AUTHOR,
  ],
  prices: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  users: [UserRole.SUPER_ADMIN],
};

/** Area access matrix — Phones, News, Brands, Images, Prices, Users. */
export function canAccessArea(role: UserRole, area: ContentArea): boolean {
  return AREA_ACCESS[area].includes(role);
}

export function canImport(role: UserRole | undefined | null, kind: ImportKind): boolean {
  if (!role) return false;
  /** SUPER_ADMIN may import any kind (users, ads, phones, etc.). */
  if (role === UserRole.SUPER_ADMIN) return true;

  switch (kind) {
    case 'users':
      return false;
    case 'phones':
    case 'upcoming-devices':
    case 'brands':
    case 'prices':
    case 'images':
      return role === UserRole.ADMIN;
    case 'news':
    case 'reviews':
    case 'documentation':
      return role === UserRole.ADMIN || role === UserRole.EDITOR;
    case 'advertisements':
      return role === UserRole.ADMIN;
    case 'article-images':
      return (
        role === UserRole.ADMIN ||
        role === UserRole.EDITOR ||
        role === UserRole.AUTHOR
      );
    default:
      return false;
  }
}

export function getImportKindsForRole(role: UserRole): ImportKind[] {
  const kinds: ImportKind[] = [
    'users',
    'phones',
    'upcoming-devices',
    'brands',
    'prices',
    'images',
    'news',
    'reviews',
    'documentation',
    'advertisements',
    'article-images',
  ];
  return kinds.filter((kind) => canImport(role, kind));
}

export const ROLE_RESPONSIBILITIES: Partial<Record<UserRole, string[]>> = {
  [UserRole.SUPER_ADMIN]: [
    'Bulk user uploads',
    'System-wide data migrations',
    'Brand master data',
    'Global price updates',
    'Full media library uploads',
    'Paid advertisement upload, delete, restore (SUPER_ADMIN only), and purge',
  ],
  [UserRole.ADMIN]: [
    'Bulk phone specification uploads',
    'Bulk upcoming device uploads (CSV/XLSX with launch dates)',
    'Bulk brand uploads',
    'Price uploads',
    'News uploads',
    'Image ZIP uploads',
    'Paid advertisement uploads (CSV/XLSX/PDF)',
  ],
  [UserRole.EDITOR]: [
    'Bulk article/news uploads only',
    'Uploading images related to their content',
  ],
  [UserRole.AUTHOR]: ['Upload images for their own articles only'],
  [UserRole.MODERATOR]: [
    'Comment moderation',
    'Password sign-in with bcrypt hash storage (not viewable by admins)',
  ],
};

/** Matrix row for API / admin UI (✅ / ❌). */
export function contentAccessMatrix(): Record<
  UserRole,
  Record<ContentArea, boolean>
> {
  const roles = Object.values(UserRole);
  const areas: ContentArea[] = [
    'phones',
    'news',
    'brands',
    'images',
    'prices',
    'users',
  ];

  return Object.fromEntries(
    roles.map((role) => [
      role,
      Object.fromEntries(
        areas.map((area) => [area, canAccessArea(role, area)]),
      ),
    ]),
  ) as Record<UserRole, Record<ContentArea, boolean>>;
}
