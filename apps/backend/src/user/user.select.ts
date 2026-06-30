/** Safe user fields for admin/API responses — never includes passwordHash. */
export const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  isVerified: true,
  isBlocked: true,
  lastLogin: true,
  createdAt: true,
  updatedAt: true,
} as const;
