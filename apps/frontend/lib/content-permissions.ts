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
  | "advertisements"
  | "ev";

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
  phones: { formats: ["CSV", "XLSX", "ZIP images", "single image"], pdf: false },
  "upcoming-devices": {
    formats: ["CSV", "XLSX", "ZIP images", "single image"],
    pdf: false,
  },
  brands: { formats: ["CSV", "XLSX"], pdf: false },
  prices: { formats: ["CSV", "XLSX"], pdf: false },
  images: { formats: ["ZIP"], pdf: false },
  news: {
    formats: ["PDF", "Markdown ZIP", "CSV", "XLSX", "ZIP images", "single image"],
    pdf: true,
  },
  reviews: { formats: ["PDF", "CSV", "XLSX"], pdf: true },
  documentation: {
    formats: ["PDF", "Markdown ZIP", "CSV", "ZIP images", "single image"],
    pdf: true,
  },
  users: { formats: ["CSV", "XLSX"], pdf: false },
  advertisements: { formats: ["CSV", "XLSX", "JSON", "PDF"], pdf: true },
  ev: {
    formats: [
      "CSV",
      "XLSX",
      "ZIP images",
      "single image",
      "PDF news/reviews",
    ],
    pdf: true,
  },
};

export type EvUploadSubkind = "vehicles" | "upcoming" | "news" | "reviews";

export const EV_UPLOAD_SUBKINDS: {
  id: EvUploadSubkind;
  label: string;
  hint: string;
}[] = [
  {
    id: "vehicles",
    label: "EV catalog",
    hint: "Cars, SUVs, trucks, vans, bikes — CSV/XLSX + images",
  },
  {
    id: "upcoming",
    label: "Upcoming EVs",
    hint: "Future launches with model_year or announced_at / release_at",
  },
  {
    id: "news",
    label: "EV news",
    hint: "Industry news — CSV, PDF, or Markdown ZIP",
  },
  {
    id: "reviews",
    label: "EV reviews",
    hint: "Vehicle reviews — CSV or PDF (vehicle column = EV slug)",
  },
];

export function evSubkindSupportsImages(subkind: EvUploadSubkind): boolean {
  return subkind === "vehicles" || subkind === "upcoming";
}

/** Image uploads are embedded inside these sections (no standalone Images tab). */
export const IMAGE_EMBEDDED_KINDS: BulkImportKind[] = [
  "phones",
  "upcoming-devices",
  "news",
  "documentation",
  "ev",
];

export type UploadMode = "data" | "images-bulk" | "images-single";

export function supportsImageUpload(kind: BulkImportKind): boolean {
  return IMAGE_EMBEDDED_KINDS.includes(kind);
}

export function canUploadImages(
  role: UserRole | null | undefined,
  kind: BulkImportKind,
): boolean {
  if (!role || !supportsImageUpload(kind)) return false;
  if (role === "SUPER_ADMIN") return true;
  switch (kind) {
    case "phones":
    case "upcoming-devices":
      return role === "ADMIN";
    case "news":
    case "documentation":
      return role === "ADMIN" || role === "EDITOR" || role === "AUTHOR";
    case "ev":
      return canManageEv(role);
    default:
      return false;
  }
}

/** PDF upload permissions — news/reviews/docs only. */
export function canUploadPdf(
  role: UserRole | null | undefined,
  kind: BulkImportKind,
  options?: { subkind?: EvUploadSubkind },
): boolean {
  if (!role) return false;
  if (kind === "ev") {
    const sk = options?.subkind ?? "vehicles";
    if (sk === "news") return canUploadPdf(role, "news");
    if (sk === "reviews") return canUploadPdf(role, "reviews");
    return false;
  }
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
    fileTypes: "CSV, XLSX · images: ZIP or single file",
    example: "Volt, Nimbus, Prism specifications + device photos",
    accept: ".csv,.xlsx,.xls,.zip,.jpg,.jpeg,.png,.webp,.gif",
  },
  {
    kind: "upcoming-devices",
    label: "Upcoming Devices",
    fileTypes: "CSV, XLSX · images: ZIP or single file",
    example: "Future launches + teaser images (folder per slug)",
    accept: ".csv,.xlsx,.xls,.zip,.jpg,.jpeg,.png,.webp,.gif",
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
    fileTypes: "PDF, Markdown ZIP, CSV, XLSX · images: ZIP or single file",
    example: "Title, content, author + article thumbnails",
    accept: ".csv,.xlsx,.xls,.pdf,.zip,.jpg,.jpeg,.png,.webp,.gif",
  },
  {
    kind: "documentation",
    label: "Documentation",
    fileTypes: "PDF, Markdown ZIP, CSV · images: ZIP or single file",
    example: "Guides, help articles + doc thumbnails",
    accept: ".csv,.xlsx,.xls,.pdf,.zip,.jpg,.jpeg,.png,.webp,.gif",
  },
  {
    kind: "users",
    label: "Users",
    fileTypes: "CSV, XLSX",
    example: "Email, role, status",
    accept: ".csv,.xlsx,.xls",
  },
  {
    kind: "reviews",
    label: "Reviews",
    fileTypes: "PDF, CSV, XLSX",
    example: "Rating, pros, cons — or PDF with device: metadata",
    accept: ".csv,.xlsx,.xls,.pdf",
  },
  {
    kind: "ev",
    label: "EV (Electric Vehicles)",
    fileTypes:
      "Catalog · Upcoming · News · Reviews — CSV/XLSX/PDF + images",
    example:
      "Tesla Model 3, EV industry news, hands-on reviews, future launches",
    accept: ".csv,.xlsx,.xls,.pdf,.zip,.jpg,.jpeg,.png,.webp,.gif",
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

/** EV section — all staff roles (not public USER). */
export const STAFF_EV_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "EDITOR",
  "AUTHOR",
  "MODERATOR",
] as const satisfies readonly UserRole[];

export function canManageEv(role: UserRole | null | undefined): boolean {
  return role != null && (STAFF_EV_ROLES as readonly UserRole[]).includes(role);
}

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
  ev: "EV (Electric Vehicles)",
};

export const IMPORT_KIND_HINTS: Record<BulkImportKind, string> = {
  users: "Columns: email, name, role, password (optional, hashed on upload), status",
  phones:
    "CSV/XLSX specs · ZIP: one folder per device slug · single image: set slug below",
  "upcoming-devices":
    "CSV/XLSX launches · ZIP/single images attach to upcoming device slugs",
  brands: "Columns: name (or brand_name), logo (optional URL)",
  prices: "Columns: model, country, price",
  images: "ZIP: images grouped by device slug folder",
  news:
    "CSV/XLSX/PDF articles · ZIP images: folder per article slug · single image sets thumbnail",
  documentation:
    "CSV/PDF/Markdown docs · ZIP images: folder per doc slug · single image sets thumbnail",
  reviews:
    "CSV: title, device, score, pros (| separated), cons — PDF: add device: and score: lines",
  advertisements:
    "CSV/XLSX/JSON: title, link (required), placement, ad_type, format, width, height, sponsored, priority, image_url, advertiser, budget, active, start_date, end_date — PDF: title:, link:, placement: metadata lines",
  ev: "EV hub — pick catalog, upcoming, news, or reviews tab below",
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
    { href: "/samples/images-sample.zip", label: "Sample image ZIP" },
  ],
  "upcoming-devices": [
    { href: "/samples/upcoming-devices-sample.csv", label: "Sample CSV" },
    { href: "/samples/images-sample.zip", label: "Sample image ZIP" },
  ],
  brands: [{ href: "/samples/brands-sample.csv", label: "Sample CSV" }],
  news: [
    { href: "/samples/news-sample.csv", label: "Sample CSV" },
    { href: "/samples/images-sample.zip", label: "Sample image ZIP" },
  ],
  documentation: [
    { href: "/samples/documentation-sample.csv", label: "Sample CSV" },
    { href: "/samples/images-sample.zip", label: "Sample image ZIP" },
  ],
  users: [{ href: "/samples/users-sample.csv", label: "Sample CSV" }],
  prices: [{ href: "/samples/prices-sample.csv", label: "Sample CSV" }],
  reviews: [{ href: "/samples/reviews-sample.csv", label: "Sample CSV" }],
  advertisements: [
    { href: "/samples/advertisements-sample.csv", label: "Sample CSV" },
    { href: "/samples/advertisements-sample.json", label: "Sample JSON" },
  ],
  ev: [
    { href: "/samples/ev-vehicles-sample.csv", label: "EV catalog CSV" },
    { href: "/samples/ev-upcoming-sample.csv", label: "Upcoming EVs CSV" },
    { href: "/samples/ev-news-sample.csv", label: "EV news CSV" },
    { href: "/samples/ev-reviews-sample.csv", label: "EV reviews CSV" },
    { href: "/samples/images-sample.zip", label: "Sample image ZIP" },
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
    case "ev":
      return canManageEv(role);
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
    "EV bulk upload — all electric vehicles (cars, SUVs, trucks, vans, bikes)",
  ],
  ADMIN: [
    "Bulk phone specification uploads (CSV/XLSX only)",
    "Bulk upcoming device uploads (CSV/XLSX with launch dates)",
    "Bulk brand uploads",
    "Price uploads",
    "News and documentation uploads (PDF allowed)",
    "Paid advertisement uploads (CSV/XLSX/PDF)",
    "Image ZIP uploads",
    "EV bulk upload — electric vehicle catalog",
  ],
  EDITOR: [
    "Bulk article/news/documentation uploads (PDF allowed)",
    "Uploading images related to their content",
    "EV bulk upload — publish EV vehicle data",
  ],
  AUTHOR: [
    "Upload images for their own articles only",
    "EV bulk upload — draft EV vehicle entries",
  ],
  MODERATOR: [
    "Comment moderation on news and reviews",
    "Password sign-in with bcrypt hash storage (not viewable by admins)",
    "EV bulk upload — electric vehicle catalog",
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
