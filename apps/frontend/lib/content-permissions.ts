import type { UserRole } from "./roles";

/** Bulk upload types — aligned with backend BulkImportKind. */
export type BulkImportKind =
  | "phones"
  | "upcoming-devices"
  | "brands"
  | "news"
  | "users"
  | "images"
  | "prices"
  | "reviews"
  | "documentation"
  | "advertisements";

/** @deprecated use BulkImportKind */
export type ImportKind = BulkImportKind | "article-images";

export type ContentArea =
  | "phones"
  | "news"
  | "brands"
  | "images"
  | "prices"
  | "users";

const AREA_ACCESS: Record<ContentArea, UserRole[]> = {
  phones: ["SUPER_ADMIN", "ADMIN"],
  news: ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  brands: ["SUPER_ADMIN", "ADMIN"],
  images: ["SUPER_ADMIN", "ADMIN", "EDITOR", "AUTHOR"],
  prices: ["SUPER_ADMIN", "ADMIN"],
  users: ["SUPER_ADMIN"],
};

/** MobileArena upload strategy — file formats per category. */
export const IMPORT_STRATEGY: Record<
  BulkImportKind,
  { formats: string[]; pdf: boolean }
> = {
  phones: { formats: ["CSV", "XLSX"], pdf: false },
  "upcoming-devices": { formats: ["CSV", "XLSX"], pdf: false },
  brands: { formats: ["CSV", "XLSX"], pdf: false },
  prices: { formats: ["CSV", "XLSX"], pdf: false },
  images: { formats: ["ZIP"], pdf: false },
  news: { formats: ["PDF", "Markdown ZIP", "CSV", "XLSX"], pdf: true },
  reviews: { formats: ["PDF", "CSV", "XLSX"], pdf: true },
  documentation: { formats: ["PDF", "Markdown ZIP", "CSV"], pdf: true },
  users: { formats: ["CSV", "XLSX"], pdf: false },
  advertisements: { formats: ["CSV", "XLSX", "JSON", "PDF"], pdf: true },
};

/** PDF upload permissions — news/reviews/docs only. */
export function canUploadPdf(
  role: UserRole | null | undefined,
  kind: BulkImportKind,
): boolean {
  if (!role) return false;
  const pdfKinds: BulkImportKind[] = [
    "news",
    "reviews",
    "documentation",
    "advertisements",
  ];
  if (!pdfKinds.includes(kind)) return false;
  if (kind === "advertisements") {
    return role === "SUPER_ADMIN" || role === "ADMIN";
  }
  return role === "SUPER_ADMIN" || role === "ADMIN" || role === "EDITOR";
}

export function pdfPermissionMatrix(): Record<
  UserRole,
  { pdfNews: boolean; pdfPhones: "blocked" | "warn" }
> {
  const roles: UserRole[] = [
    "SUPER_ADMIN",
    "ADMIN",
    "EDITOR",
    "AUTHOR",
    "MODERATOR",
    "USER",
  ];
  return Object.fromEntries(
    roles.map((role) => [
      role,
      {
        pdfNews: canUploadPdf(role, "news"),
        pdfPhones:
          role === "SUPER_ADMIN" || role === "ADMIN" ? "warn" : "blocked",
      },
    ]),
  ) as Record<UserRole, { pdfNews: boolean; pdfPhones: "blocked" | "warn" }>;
}

export const BULK_UPLOAD_CATALOG: {
  kind: BulkImportKind;
  label: string;
  fileTypes: string;
  example: string;
  accept: string;
}[] = [
  {
    kind: "phones",
    label: "Phones",
    fileTypes: "CSV, XLSX",
    example: "Volt, Nimbus, Prism specifications",
    accept: ".csv,.xlsx,.xls",
  },
  {
    kind: "upcoming-devices",
    label: "Upcoming Devices",
    fileTypes: "CSV, XLSX",
    example: "Future launches with announced_date or released_date",
    accept: ".csv,.xlsx,.xls",
  },
  {
    kind: "brands",
    label: "Brands",
    fileTypes: "CSV, XLSX",
    example: "Volt, Orbit, Prism Labs",
    accept: ".csv,.xlsx,.xls",
  },
  {
    kind: "news",
    label: "News Articles",
    fileTypes: "PDF, Markdown ZIP, CSV, XLSX",
    example: "Title, content, author",
    accept: ".csv,.xlsx,.xls,.pdf,.zip",
  },
  {
    kind: "documentation",
    label: "Documentation",
    fileTypes: "PDF, Markdown ZIP, CSV",
    example: "Guides, help articles, internal docs",
    accept: ".csv,.xlsx,.xls,.pdf,.zip",
  },
  {
    kind: "users",
    label: "Users",
    fileTypes: "CSV, XLSX",
    example: "Email, role, status",
    accept: ".csv,.xlsx,.xls",
  },
  {
    kind: "images",
    label: "Images",
    fileTypes: "ZIP",
    example: "Phone photos and logos (folder per device slug)",
    accept: ".zip",
  },
  {
    kind: "prices",
    label: "Prices",
    fileTypes: "CSV, XLSX",
    example: "Model, country, price",
    accept: ".csv,.xlsx,.xls",
  },
  {
    kind: "reviews",
    label: "Reviews",
    fileTypes: "PDF, CSV, XLSX",
    example: "Rating, pros, cons — or PDF with device: metadata",
    accept: ".csv,.xlsx,.xls,.pdf",
  },
];

/** Paid ads upload — separate from bulk upload catalog. */
export const PAID_AD_UPLOAD = {
  kind: "advertisements" as const,
  label: "Paid Advertisements",
  fileTypes: "CSV, XLSX, JSON, PDF",
  example: "Title, link, placement, ad_type, sponsored, priority",
  accept: ".csv,.xlsx,.xls,.json,.pdf",
};

export function getUploadMeta(kind: BulkImportKind) {
  const fromBulk = BULK_UPLOAD_CATALOG.find((x) => x.kind === kind);
  if (fromBulk) return fromBulk;
  if (kind === "advertisements") return PAID_AD_UPLOAD;
  throw new Error(`Unknown upload kind: ${kind}`);
}

/** Roles allowed to upload paid advertisements (CSV/XLSX/PDF). */
export const PAID_AD_IMPORT_ROLES = ["SUPER_ADMIN", "ADMIN"] as const;

export function canImportPaidAds(role: UserRole | null | undefined): boolean {
  if (!role) return false;
  return (PAID_AD_IMPORT_ROLES as readonly UserRole[]).includes(role);
}

/** Revenue Analytics dashboard — SUPER_ADMIN only. */
export const REVENUE_ANALYTICS_ROLES = ["SUPER_ADMIN"] as const;

export function canViewRevenueAnalytics(
  role: UserRole | null | undefined,
): boolean {
  if (!role) return false;
  return (REVENUE_ANALYTICS_ROLES as readonly UserRole[]).includes(role);
}

export const CONTENT_AREAS: ContentArea[] = [
  "phones",
  "news",
  "brands",
  "images",
  "prices",
  "users",
];

export const CONTENT_AREA_LABELS: Record<ContentArea, string> = {
  phones: "Phones",
  news: "News",
  brands: "Brands",
  images: "Images",
  prices: "Prices",
  users: "Users",
};

export const IMPORT_KIND_LABELS: Record<BulkImportKind, string> = {
  users: "Users",
  phones: "Phones",
  "upcoming-devices": "Upcoming Devices",
  brands: "Brands",
  prices: "Prices",
  images: "Images",
  news: "News Articles",
  reviews: "Reviews",
  documentation: "Documentation",
  advertisements: "Paid Advertisements",
};

export const IMPORT_KIND_HINTS: Record<BulkImportKind, string> = {
  users: "Columns: email, name, role, password (optional, hashed on upload), status",
  phones:
    "Required columns: name, brand, category (aliases: device/device_name, brand_name, device_category/type). Optional: manufacturer, price, os, weight, dimensions, announced_date, released_date. Category defaults to Smartphone when name + brand are set.",
  "upcoming-devices":
    "Same as phones plus required announced_date and/or released_date (must be a future launch)",
  brands: "Columns: name (or brand_name), logo (optional URL)",
  prices: "Columns: model, country, price",
  images: "ZIP: images grouped by device slug folder",
  news: "CSV/XLSX columns, PDF, or ZIP of .md/.pdf files with # Title",
  documentation: "CSV columns, PDF, or ZIP of .md/.pdf documentation files",
  reviews:
    "CSV: title, device, score, pros (| separated), cons — PDF: add device: and score: lines",
  advertisements:
    "CSV/XLSX/JSON: title, link (required), placement, ad_type, format, width, height, sponsored, priority, image_url, advertiser, budget, active, start_date, end_date — PDF: title:, link:, placement: metadata lines",
};

export type ImportSampleFile = { href: string; label: string };

export const IMPORT_SAMPLE_FILES: Partial<
  Record<BulkImportKind, ImportSampleFile[]>
> = {
  phones: [
    { href: "/samples/phones-sample.csv", label: "Sample CSV" },
    {
      href: "/samples/phones-full-import-sample.xlsx",
      label: "Full specs XLSX",
    },
  ],
  "upcoming-devices": [
    { href: "/samples/upcoming-devices-sample.csv", label: "Sample CSV" },
  ],
  brands: [{ href: "/samples/brands-sample.csv", label: "Sample CSV" }],
  news: [{ href: "/samples/news-sample.csv", label: "Sample CSV" }],
  documentation: [
    { href: "/samples/documentation-sample.csv", label: "Sample CSV" },
  ],
  users: [{ href: "/samples/users-sample.csv", label: "Sample CSV" }],
  prices: [{ href: "/samples/prices-sample.csv", label: "Sample CSV" }],
  reviews: [{ href: "/samples/reviews-sample.csv", label: "Sample CSV" }],
  images: [{ href: "/samples/images-sample.zip", label: "Sample ZIP" }],
  advertisements: [
    { href: "/samples/advertisements-sample.csv", label: "Sample CSV" },
    { href: "/samples/advertisements-sample.json", label: "Sample JSON" },
  ],
};

export function canAccessArea(
  role: UserRole | null | undefined,
  area: ContentArea,
): boolean {
  if (!role) return false;
  return AREA_ACCESS[area].includes(role);
}

export function canImportBulk(
  role: UserRole | null | undefined,
  kind: BulkImportKind,
): boolean {
  if (!role) return false;
  switch (kind) {
    case "users":
      return role === "SUPER_ADMIN";
    case "phones":
    case "upcoming-devices":
    case "brands":
    case "prices":
    case "images":
      return role === "SUPER_ADMIN" || role === "ADMIN";
    case "news":
    case "reviews":
    case "documentation":
      return role === "SUPER_ADMIN" || role === "ADMIN" || role === "EDITOR";
    case "advertisements":
      return canImportPaidAds(role);
    default:
      return false;
  }
}

/** @deprecated */
export function canImport(
  role: UserRole | null | undefined,
  kind: ImportKind,
): boolean {
  if (kind === "article-images") {
    return (
      role === "SUPER_ADMIN" ||
      role === "ADMIN" ||
      role === "EDITOR" ||
      role === "AUTHOR"
    );
  }
  return canImportBulk(role, kind);
}

export function getBulkImportKindsForRole(role: UserRole): BulkImportKind[] {
  return BULK_UPLOAD_CATALOG.map((x) => x.kind).filter((kind) =>
    canImportBulk(role, kind),
  );
}

export function getImportKindsForRole(role: UserRole): ImportKind[] {
  return getBulkImportKindsForRole(role);
}

export const ROLE_RESPONSIBILITIES: Partial<Record<UserRole, string[]>> = {
  SUPER_ADMIN: [
    "Bulk user uploads",
    "System-wide data migrations",
    "Brand master data",
    "Global price updates",
    "Full media library uploads",
    "PDF news and documentation uploads",
    "Paid advertisement upload, delete, restore (SUPER_ADMIN only), and purge",
    "Revenue Analytics (ad revenue, affiliate earnings, campaign performance)",
  ],
  ADMIN: [
    "Bulk phone specification uploads (CSV/XLSX only)",
    "Bulk upcoming device uploads (CSV/XLSX with launch dates)",
    "Bulk brand uploads",
    "Price uploads",
    "News and documentation uploads (PDF allowed)",
    "Paid advertisement uploads (CSV/XLSX/PDF)",
    "Image ZIP uploads",
  ],
  EDITOR: [
    "Bulk article/news/documentation uploads (PDF allowed)",
    "Uploading images related to their content",
  ],
  AUTHOR: ["Upload images for their own articles only"],
  MODERATOR: [
    "Comment moderation on news and reviews",
    "Password sign-in with bcrypt hash storage (not viewable by admins)",
  ],
};

export function contentAccessMatrix(): Record<
  UserRole,
  Record<ContentArea, boolean>
> {
  const roles: UserRole[] = [
    "SUPER_ADMIN",
    "ADMIN",
    "EDITOR",
    "AUTHOR",
    "MODERATOR",
    "USER",
  ];

  return Object.fromEntries(
    roles.map((role) => [
      role,
      Object.fromEntries(
        CONTENT_AREAS.map((area) => [area, canAccessArea(role, area)]),
      ),
    ]),
  ) as Record<UserRole, Record<ContentArea, boolean>>;
}

export const IMAGE_SCOPE_NOTES: Partial<Record<UserRole, string>> = {
  EDITOR: "article images only",
  AUTHOR: "own article images only",
};

export const PDF_PHONES_POLICY = {
  allowed: false as const,
  note: "Phone specifications must use CSV/XLSX — PDF is not supported for phones.",
};

export type DeleteAction =
  | "delete_one_phone"
  | "delete_selected_phones"
  | "delete_one_brand"
  | "delete_selected_brands"
  | "delete_one_advertisement"
  | "delete_selected_advertisements"
  | "delete_entire_import"
  | "restore_deleted_import"
  | "restore_deleted_brands"
  | "restore_deleted_advertisements"
  | "permanently_purge"
  | "clear_deleted_import_history"
  | "clear_audit_log_history";

const DELETE_PERMISSIONS: Record<DeleteAction, UserRole[]> = {
  delete_one_phone: ["SUPER_ADMIN"],
  delete_selected_phones: ["SUPER_ADMIN"],
  delete_one_brand: ["SUPER_ADMIN"],
  delete_selected_brands: ["SUPER_ADMIN"],
  delete_one_advertisement: ["SUPER_ADMIN"],
  delete_selected_advertisements: ["SUPER_ADMIN"],
  delete_entire_import: ["SUPER_ADMIN"],
  restore_deleted_import: ["SUPER_ADMIN"],
  restore_deleted_brands: ["SUPER_ADMIN"],
  restore_deleted_advertisements: ["SUPER_ADMIN"],
  permanently_purge: ["SUPER_ADMIN"],
  clear_deleted_import_history: ["SUPER_ADMIN"],
  clear_audit_log_history: ["SUPER_ADMIN"],
};

export const DELETE_ACTION_LABELS: Record<DeleteAction, string> = {
  delete_one_phone: "Delete one phone",
  delete_selected_phones: "Delete selected phones",
  delete_one_brand: "Delete one brand",
  delete_selected_brands: "Delete selected brands",
  delete_one_advertisement: "Delete one advertisement",
  delete_selected_advertisements: "Delete selected advertisements",
  delete_entire_import: "Delete entire upload",
  restore_deleted_import: "Restore deleted upload",
  restore_deleted_brands: "Restore deleted brands",
  restore_deleted_advertisements: "Restore deleted advertisements (SUPER_ADMIN only)",
  permanently_purge: "Permanently purge (erase) data",
  clear_deleted_import_history: "Clear deleted upload history",
  clear_audit_log_history: "Clear audit log history",
};

export function canDeleteAction(
  role: UserRole | null | undefined,
  action: DeleteAction,
): boolean {
  if (!role) return false;
  return DELETE_PERMISSIONS[action].includes(role);
}

export function deletePermissionMatrix(): Record<
  UserRole,
  Record<DeleteAction, boolean>
> {
  const roles: UserRole[] = [
    "SUPER_ADMIN",
    "ADMIN",
    "EDITOR",
    "AUTHOR",
    "MODERATOR",
    "USER",
  ];
  const actions = Object.keys(DELETE_PERMISSIONS) as DeleteAction[];
  return Object.fromEntries(
    roles.map((role) => [
      role,
      Object.fromEntries(
        actions.map((action) => [action, canDeleteAction(role, action)]),
      ),
    ]),
  ) as Record<UserRole, Record<DeleteAction, boolean>>;
}

/** Upload history, audit log, and permanent purge — SUPER_ADMIN only. */
export const IMPORT_HISTORY_ROLES: UserRole[] = ["SUPER_ADMIN"];

export const AUDIT_LOG_ROLES: UserRole[] = ["SUPER_ADMIN"];
