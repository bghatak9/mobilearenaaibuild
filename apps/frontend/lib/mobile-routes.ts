/** Routes that use the minimal auth shell (no full header). */
export const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/verify-email",
] as const;

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isAdminRoute(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/** Hide global mobile chrome on auth + admin flows. */
export function hideMobileChrome(pathname: string): boolean {
  return isAuthRoute(pathname) || isAdminRoute(pathname);
}

/** Public pages without any ad slots. */
export const AD_FREE_ROUTES = [
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/community-guidelines",
] as const;

export function isAdFreeRoute(pathname: string): boolean {
  return AD_FREE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
