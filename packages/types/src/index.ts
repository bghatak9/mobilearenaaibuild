// Shared domain types for MobileArena.
// These mirror the Prisma models in apps/backend and are safe to import
// from both the frontend and admin apps (no server-only dependencies).

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "EDITOR"
  | "AUTHOR"
  | "MODERATOR"
  | "USER";

export type PostStatus = "DRAFT" | "REVIEW" | "PUBLISHED";

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string | null;
}

export interface DeviceSummary {
  id: number;
  slug: string;
  name: string;
  price?: number | null;
  rating?: number | null;
  brandId: number;
}
