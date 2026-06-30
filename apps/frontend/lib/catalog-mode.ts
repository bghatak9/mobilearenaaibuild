/** Mirrors backend CATALOG_IMPORTED_ONLY for SSR when the API is unreachable. */
export function catalogImportedOnlyFromEnv(): boolean {
  return process.env.NEXT_PUBLIC_CATALOG_IMPORTED_ONLY === "true";
}
