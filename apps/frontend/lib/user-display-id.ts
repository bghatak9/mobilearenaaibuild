/** Display User ID from email local-part (e.g. abcd1987@gmail.com → abcd1987). */
export function userDisplayId(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return email.trim() || "—";
  return email.slice(0, at);
}
