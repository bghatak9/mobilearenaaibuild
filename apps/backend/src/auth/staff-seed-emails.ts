/** Seed staff emails — public registration must not claim these. */
export const STAFF_SEED_EMAILS: readonly string[] = [
  (process.env.SUPER_ADMIN_EMAIL ?? 'superadmin@mobilearena.com').toLowerCase(),
  (process.env.ADMIN_EMAIL ?? 'admin@mobilearena.com').toLowerCase(),
  (process.env.EDITOR_EMAIL ?? 'editor@mobilearena.com').toLowerCase(),
  (process.env.AUTHOR_EMAIL ?? 'author@mobilearena.com').toLowerCase(),
  (process.env.MODERATOR_EMAIL ?? 'moderator@mobilearena.com').toLowerCase(),
  (process.env.TEST_ADMIN_EMAIL ?? 'testadmi@mobilearena.com').toLowerCase(),
];

export function isReservedStaffEmail(email: string): boolean {
  return STAFF_SEED_EMAILS.includes(email.trim().toLowerCase());
}
