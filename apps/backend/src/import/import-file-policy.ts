import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import type { BulkImportKind } from './import.types';

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

/** Structured catalog data — CSV/XLSX only. */
export const SPREADSHEET_ONLY_KINDS: BulkImportKind[] = [
  'phones',
  'upcoming-devices',
  'brands',
  'prices',
  'users',
];

export const IMPORT_STRATEGY = {
  phones: { formats: ['CSV', 'XLSX'], pdf: false },
  'upcoming-devices': { formats: ['CSV', 'XLSX'], pdf: false },
  brands: { formats: ['CSV', 'XLSX'], pdf: false },
  prices: { formats: ['CSV', 'XLSX'], pdf: false },
  images: { formats: ['ZIP'], pdf: false },
  news: { formats: ['PDF', 'Markdown ZIP', 'CSV', 'XLSX'], pdf: true },
  reviews: { formats: ['PDF', 'CSV', 'XLSX'], pdf: true },
  documentation: { formats: ['PDF', 'Markdown ZIP', 'CSV'], pdf: true },
  users: { formats: ['CSV', 'XLSX'], pdf: false },
  advertisements: { formats: ['CSV', 'XLSX', 'JSON', 'PDF'], pdf: true },
} as const;

const SPREADSHEET_EXT = new Set(['csv', 'xlsx', 'xls']);
const PDF_EXT = new Set(['pdf']);

export function allowedExtensions(kind: BulkImportKind): string[] {
  switch (kind) {
    case 'phones':
    case 'upcoming-devices':
    case 'brands':
    case 'prices':
    case 'users':
      return ['csv', 'xlsx', 'xls'];
    case 'images':
      return ['zip'];
    case 'news':
    case 'documentation':
      return ['csv', 'xlsx', 'xls', 'pdf', 'zip'];
    case 'reviews':
      return ['csv', 'xlsx', 'xls', 'pdf'];
    case 'advertisements':
      return ['csv', 'xlsx', 'xls', 'json', 'pdf'];
    default:
      return ['csv', 'xlsx', 'xls'];
  }
}

/** PDF news/reviews/docs: SUPER_ADMIN, ADMIN, EDITOR only. */
export function canUploadPdf(role: UserRole, kind: BulkImportKind): boolean {
  if (!PDF_UPLOAD_KINDS.includes(kind)) return false;
  if (kind === 'advertisements') {
    return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
  }
  return (
    role === UserRole.SUPER_ADMIN ||
    role === UserRole.ADMIN ||
    role === UserRole.EDITOR
  );
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
): void {
  const ext = fileExtension(fileName);
  if (!ext) {
    throw new BadRequestException('File must have an extension');
  }

  if (PDF_EXT.has(ext)) {
    if (!PDF_UPLOAD_KINDS.includes(kind)) {
      throw new BadRequestException(
        'PDF uploads are only allowed for news articles, reviews, documentation, and paid advertisements. ' +
          'Use CSV/XLSX for phones, brands, and prices.',
      );
    }
    if (!canUploadPdf(role, kind)) {
      throw new ForbiddenException(
        'Your role cannot upload PDF content for this upload type.',
      );
    }
    return;
  }

  const allowed = allowedExtensions(kind);
  if (!allowed.includes(ext)) {
    throw new BadRequestException(
      `Invalid file type ".${ext}" for ${kind}. Allowed: ${allowed.join(', ')}`,
    );
  }

  if (SPREADSHEET_ONLY_KINDS.includes(kind) && !SPREADSHEET_EXT.has(ext)) {
    throw new BadRequestException(
      `${kind} uploads require CSV or XLSX — structured data only.`,
    );
  }

  if (kind === 'images' && ext !== 'zip') {
    throw new BadRequestException('Image bulk uploads require a ZIP file.');
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
    default:
      return false;
  }
}
