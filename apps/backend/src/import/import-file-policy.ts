import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import type { BulkImportKind, EvUploadSubkind } from './import.types';

export function fileExtension(name: string): string {
  const idx = name.lastIndexOf('.');
  return idx >= 0 ? name.slice(idx + 1).toLowerCase() : '';
}

/** Kinds that accept PDF uploads (news, reviews, documentation only). */
export const PDF_UPLOAD_KINDS: BulkImportKind[] = [
  'news',
  'reviews',
  'documentation',
  'advertisements',
];

/** Structured catalog data — CSV/XLSX only (unless image upload is also supported). */
export const SPREADSHEET_ONLY_KINDS: BulkImportKind[] = [
  'phones',
  'upcoming-devices',
  'brands',
  'prices',
  'users',
  'ev',
];

/** Image ZIP / single-file uploads live inside these sections (not a separate Images tab). */
export const IMAGE_EMBEDDED_KINDS: BulkImportKind[] = [
  'phones',
  'upcoming-devices',
  'news',
  'documentation',
  'ev',
];

const SPREADSHEET_EXT = new Set(['csv', 'xlsx', 'xls']);
const PDF_EXT = new Set(['pdf']);
const IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);

export const IMPORT_STRATEGY = {
  phones: { formats: ['CSV', 'XLSX', 'ZIP images', 'single image'], pdf: false },
  'upcoming-devices': {
    formats: ['CSV', 'XLSX', 'ZIP images', 'single image'],
    pdf: false,
  },
  brands: { formats: ['CSV', 'XLSX'], pdf: false },
  prices: { formats: ['CSV', 'XLSX'], pdf: false },
  images: { formats: ['ZIP'], pdf: false },
  news: {
    formats: ['PDF', 'Markdown ZIP', 'CSV', 'XLSX', 'ZIP images', 'single image'],
    pdf: true,
  },
  reviews: { formats: ['PDF', 'CSV', 'XLSX'], pdf: true },
  documentation: {
    formats: ['PDF', 'Markdown ZIP', 'CSV', 'ZIP images', 'single image'],
    pdf: true,
  },
  users: { formats: ['CSV', 'XLSX'], pdf: false },
  advertisements: { formats: ['CSV', 'XLSX', 'JSON', 'PDF'], pdf: true },
  ev: { formats: ['CSV', 'XLSX', 'ZIP images', 'single image'], pdf: false },
} as const;

export function isImageExtension(ext: string): boolean {
  return IMAGE_EXT.has(ext);
}

export function supportsEmbeddedImages(kind: BulkImportKind): boolean {
  return IMAGE_EMBEDDED_KINDS.includes(kind);
}

/** Map EV sub-section to file rules (news/reviews use their formats). */
export function resolveEvUploadKind(
  subkind: EvUploadSubkind = 'vehicles',
): BulkImportKind {
  if (subkind === 'news') return 'news';
  if (subkind === 'reviews') return 'reviews';
  return 'ev';
}

export function evSubkindSupportsImages(subkind: EvUploadSubkind): boolean {
  return subkind === 'vehicles' || subkind === 'upcoming';
}

export function allowedExtensions(
  kind: BulkImportKind,
  options?: { subkind?: EvUploadSubkind },
): string[] {
  if (kind === 'ev') {
    const sk = options?.subkind ?? 'vehicles';
    if (sk === 'news') return ['csv', 'xlsx', 'xls', 'pdf', 'zip'];
    if (sk === 'reviews') return ['csv', 'xlsx', 'xls', 'pdf'];
    return ['csv', 'xlsx', 'xls', 'zip', ...IMAGE_EXT];
  }
  switch (kind) {
    case 'phones':
    case 'upcoming-devices':
      return ['csv', 'xlsx', 'xls', 'zip', ...IMAGE_EXT];
    case 'brands':
    case 'prices':
    case 'users':
      return ['csv', 'xlsx', 'xls'];
    case 'images':
      return ['zip', ...IMAGE_EXT];
    case 'news':
    case 'documentation':
      return ['csv', 'xlsx', 'xls', 'pdf', 'zip', ...IMAGE_EXT];
    case 'reviews':
      return ['csv', 'xlsx', 'xls', 'pdf'];
    case 'advertisements':
      return ['csv', 'xlsx', 'xls', 'json', 'pdf'];
    default:
      return ['csv', 'xlsx', 'xls'];
  }
}

/** PDF news/reviews/docs: SUPER_ADMIN, ADMIN, EDITOR only. */
export function canUploadPdf(
  role: UserRole,
  kind: BulkImportKind,
  options?: { subkind?: EvUploadSubkind },
): boolean {
  const effective =
    kind === 'ev' ? resolveEvUploadKind(options?.subkind) : kind;
  if (!PDF_UPLOAD_KINDS.includes(effective)) return false;
  if (effective === 'advertisements') {
    return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
  }
  return (
    role === UserRole.SUPER_ADMIN ||
    role === UserRole.ADMIN ||
    role === UserRole.EDITOR
  );
}

/** Image uploads inside Phones, News, Documentation, EV, etc. */
export function canUploadImages(role: UserRole, kind: BulkImportKind): boolean {
  if (!supportsEmbeddedImages(kind)) return false;
  if (role === UserRole.SUPER_ADMIN) return true;
  switch (kind) {
    case 'phones':
    case 'upcoming-devices':
      return role === UserRole.ADMIN;
    case 'news':
    case 'documentation':
      return (
        role === UserRole.ADMIN ||
        role === UserRole.EDITOR ||
        role === UserRole.AUTHOR
      );
    case 'ev':
      return (
        role === UserRole.ADMIN ||
        role === UserRole.EDITOR ||
        role === UserRole.AUTHOR ||
        role === UserRole.MODERATOR
      );
    default:
      return false;
  }
}

/** PDF phone specs are not supported — use CSV/XLSX (shown as ⚠️ in policy UI). */
export function pdfPhonesPolicy(): {
  allowed: false;
  note: string;
} {
  return {
    allowed: false,
    note: 'Phone specifications must use CSV/XLSX — PDF is not supported for phones.',
  };
}

export function pdfPermissionMatrix(): Record<
  UserRole,
  { pdfNews: boolean; pdfPhones: 'blocked' | 'warn' }
> {
  const roles = Object.values(UserRole);
  return Object.fromEntries(
    roles.map((role) => [
      role,
      {
        pdfNews: canUploadPdf(role, 'news'),
        pdfPhones:
          role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN
            ? 'warn'
            : 'blocked',
      },
    ]),
  ) as Record<UserRole, { pdfNews: boolean; pdfPhones: 'blocked' | 'warn' }>;
}

export function assertFileAllowed(
  kind: BulkImportKind,
  fileName: string,
  role: UserRole,
  options?: { subkind?: EvUploadSubkind },
): void {
  const ext = fileExtension(fileName);
  if (!ext) {
    throw new BadRequestException('File must have an extension');
  }

  const effective = kind === 'ev' ? resolveEvUploadKind(options?.subkind) : kind;
  const evSubkind = kind === 'ev' ? (options?.subkind ?? 'vehicles') : undefined;

  if (PDF_EXT.has(ext)) {
    if (!PDF_UPLOAD_KINDS.includes(effective)) {
      throw new BadRequestException(
        'PDF uploads are only allowed for news articles, reviews, documentation, and paid advertisements. ' +
          'Use CSV/XLSX for phones, brands, and prices.',
      );
    }
    if (!canUploadPdf(role, kind, options)) {
      throw new ForbiddenException(
        'Your role cannot upload PDF content for this upload type.',
      );
    }
    return;
  }

  if (isImageExtension(ext) || ext === 'zip') {
    const imageKindOk =
      supportsEmbeddedImages(kind) ||
      kind === 'images' ||
      (kind === 'ev' && evSubkind && evSubkindSupportsImages(evSubkind));
    if (!imageKindOk) {
      throw new BadRequestException(
        `Image uploads are not supported for this EV section. Use EV catalog or Upcoming EVs.`,
      );
    }
    if (!canUploadImages(role, kind) && kind !== 'images') {
      throw new ForbiddenException(
        'Your role cannot upload images for this section.',
      );
    }
  }

  const allowed = allowedExtensions(kind, options);
  if (!allowed.includes(ext)) {
    throw new BadRequestException(
      `Invalid file type ".${ext}" for ${kind}. Allowed: ${allowed.join(', ')}`,
    );
  }

  if (
    SPREADSHEET_ONLY_KINDS.includes(effective) &&
    !SPREADSHEET_EXT.has(ext) &&
    !isImageExtension(ext) &&
    ext !== 'zip'
  ) {
    throw new BadRequestException(
      `${effective} structured data uploads require CSV or XLSX.`,
    );
  }

  if (kind === 'images' && ext !== 'zip' && !isImageExtension(ext)) {
    throw new BadRequestException(
      'Image uploads require a ZIP archive or a single image file.',
    );
  }
}

export function canImportKind(
  role: UserRole | undefined | null,
  kind: BulkImportKind,
): boolean {
  if (!role) return false;
  if (role === UserRole.SUPER_ADMIN) return true;

  switch (kind) {
    case 'users':
      return false;
    case 'phones':
    case 'upcoming-devices':
    case 'brands':
    case 'prices':
    case 'images':
      return role === UserRole.ADMIN;
    case 'news':
    case 'reviews':
    case 'documentation':
      return role === UserRole.ADMIN || role === UserRole.EDITOR;
    case 'advertisements':
      return role === UserRole.ADMIN;
    case 'ev':
      return (
        role === UserRole.ADMIN ||
        role === UserRole.EDITOR ||
        role === UserRole.AUTHOR ||
        role === UserRole.MODERATOR
      );
    default:
      return false;
  }
}
