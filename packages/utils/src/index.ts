// Shared, dependency-free helpers used across MobileArena apps.

/** Convert an arbitrary string into a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Build a deterministic compare slug from two device slugs. */
export function compareSlug(a: string, b: string): string {
  return `${a}-vs-${b}`;
}
