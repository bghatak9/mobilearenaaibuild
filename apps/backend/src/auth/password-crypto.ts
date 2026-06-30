import * as bcrypt from 'bcrypt';

/** bcrypt cost factor — passwords are never stored in plain text. */
export const BCRYPT_ROUNDS = 12;

/** One-way hash for persistence. Plain text is discarded immediately after this call. */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, passwordHash);
}

/** Remove credential fields before any API response (defence in depth). */
export function stripCredentialFields<T extends Record<string, unknown>>(
  record: T,
): Omit<T, 'password' | 'passwordHash'> {
  const { password: _p, passwordHash: _h, ...safe } = record as T & {
    password?: unknown;
    passwordHash?: unknown;
  };
  return safe;
}
