import AdmZip from 'adm-zip';
// pdf-parse default export varies by module resolution
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (
  buffer: Buffer,
) => Promise<{ text: string; numpages: number }>;
import * as XLSX from 'xlsx';

import {
  assertFileAllowed,
  fileExtension,
} from './import-file-policy';
import type { BulkImportKind } from './import.types';
import type { UserRole } from '@prisma/client';

import { isBlankImportRow } from './import-device-fields';

export { fileExtension };

export type ArticleDocument = {
  title: string;
  content: string;
  author?: string;
  sourceFormat: 'csv' | 'markdown' | 'pdf';
};

export type AdDocument = {
  title: string;
  link: string;
  imageUrl?: string;
  placement?: string;
  adType?: string;
  format?: string;
  width?: number;
  height?: number;
  sponsored?: boolean;
  priority?: number;
  advertiser?: string;
  budget?: number;
  active?: boolean;
  startsAt?: string;
  endsAt?: string;
  sourceFormat: 'csv' | 'pdf' | 'json';
};

export type ParsedUpload =
  | { format: 'rows'; rows: Record<string, unknown>[] }
  | { format: 'articles'; articles: ArticleDocument[] }
  | { format: 'ads'; ads: AdDocument[] }
  | { format: 'images'; files: { path: string; deviceSlug: string; fileName: string }[] };

function normalizeKey(key: string): string {
  return key
    .replace(/^\ufeff/, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

function normalizeRow(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    const normalized = normalizeKey(key);
    if (!normalized) continue;
    out[normalized] = value;
  }
  return out;
}

const DEVICE_HEADER_TOKENS = new Set([
  'name',
  'device',
  'device_name',
  'model',
  'phone',
  'phone_name',
  'product',
  'product_name',
  'model_name',
  'brand',
  'brand_name',
  'make',
  'company',
  'manufacturer',
  'category',
  'category_name',
  'type',
  'device_category',
  'device_type',
]);

function rowIsDeviceHeader(row: unknown[]): boolean {
  const cells = row
    .map((cell) => normalizeKey(String(cell ?? '')))
    .filter(Boolean);
  const hits = cells.filter(
    (cell) =>
      DEVICE_HEADER_TOKENS.has(cell) ||
      cell.includes('brand') ||
      cell.includes('device') ||
      cell.includes('phone') ||
      cell.includes('model') ||
      cell.endsWith('_name'),
  ).length;
  return hits >= 2;
}

function readCsvWorkbook(buffer: Buffer) {
  const text = buffer.toString('utf8').replace(/^\ufeff/, '');
  const firstLine = text.split(/\r?\n/)[0] ?? '';
  const commaCount = (firstLine.match(/,/g) ?? []).length;
  const semiCount = (firstLine.match(/;/g) ?? []).length;
  const FS = semiCount > commaCount ? ';' : ',';
  return XLSX.read(text, { type: 'string', FS });
}

function parseSheetRows(sheet: XLSX.WorkSheet): Record<string, unknown>[] {
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: '',
  });
  if (!matrix.length) return [];

  let headerIdx = matrix.findIndex(
    (row) => Array.isArray(row) && rowIsDeviceHeader(row),
  );
  if (headerIdx < 0) headerIdx = 0;

  const headerRow = (matrix[headerIdx] as unknown[]) ?? [];
  const headerCounts = new Map<string, number>();
  const headers = headerRow.map((cell, index) => {
    const base = normalizeKey(String(cell ?? '')) || `column_${index + 1}`;
    const seen = headerCounts.get(base) ?? 0;
    headerCounts.set(base, seen + 1);
    return seen === 0 ? base : `${base}_${seen + 1}`;
  });

  const rows: Record<string, unknown>[] = [];
  for (let i = headerIdx + 1; i < matrix.length; i++) {
    const line = matrix[i] as unknown[];
    if (
      !Array.isArray(line) ||
      !line.some((cell) => cell != null && String(cell).trim() !== '')
    ) {
      continue;
    }

    const raw: Record<string, unknown> = {};
    headers.forEach((key, col) => {
      if (key.startsWith('column_') && (line[col] == null || line[col] === '')) {
        return;
      }
      raw[key] = line[col] ?? '';
    });
    rows.push(normalizeRow(raw));
  }

  return rows.filter((row) => !isBlankImportRow(row));
}

export function parseSpreadsheet(file: Express.Multer.File): Record<string, unknown>[] {
  const ext = fileExtension(file.originalname);
  const workbook =
    ext === 'csv' ? readCsvWorkbook(file.buffer) : XLSX.read(file.buffer, { type: 'buffer' });

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) return [];

  return parseSheetRows(sheet);
}

function parseAdJsonFeed(file: Express.Multer.File): Record<string, unknown>[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(file.buffer.toString('utf8'));
  } catch {
    throw new Error('Invalid JSON — expected an array or { ads: [...] } feed');
  }

  const items = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === 'object'
      ? ((parsed as Record<string, unknown>).ads ??
        (parsed as Record<string, unknown>).advertisements ??
        [])
      : [];

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('JSON feed must contain a non-empty ads array');
  }

  return items.map((item) =>
    normalizeRow(
      item && typeof item === 'object' ? (item as Record<string, unknown>) : {},
    ),
  );
}

function titleFromFileName(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]/g, ' ')
    .trim();
}

async function parsePdfBuffer(
  buffer: Buffer,
  fileName: string,
): Promise<ArticleDocument> {
  const parsed = await pdfParse(buffer);
  const text = parsed.text?.trim() ?? '';
  if (!text) {
    throw new Error(`PDF "${fileName}" contains no extractable text`);
  }
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const title = lines[0]?.slice(0, 200) || titleFromFileName(fileName);
  return {
    title,
    content: text,
    sourceFormat: 'pdf',
  };
}

async function parsePdfFile(file: Express.Multer.File): Promise<ArticleDocument[]> {
  const doc = await parsePdfBuffer(file.buffer, file.originalname);
  return [doc];
}

function parseAdFromText(text: string, fileName: string): AdDocument {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const meta: Record<string, string> = {};

  for (const line of lines) {
    const match = line.match(/^([a-z_]+):\s*(.+)$/i);
    if (match) {
      meta[match[1]!.toLowerCase()] = match[2]!.trim();
    }
  }

  const title =
    meta.title ||
    lines.find((l) => !/^[a-z_]+:/i.test(l) && !/^https?:\/\//i.test(l)) ||
    titleFromFileName(fileName);

  let link =
    meta.link || meta.url || meta.href || meta.website || meta.destination || '';
  if (!link) {
    const urlMatch = text.match(/https?:\/\/[^\s)>\]]+/i);
    link = urlMatch?.[0] ?? '';
  }

  const budgetRaw = meta.budget || meta.spend || meta.price;
  const budget = budgetRaw ? Number.parseFloat(budgetRaw) : undefined;

  let active: boolean | undefined;
  if (meta.active != null) {
    active = ['true', 'yes', '1', 'active'].includes(meta.active.toLowerCase());
  }

  return {
    title: String(title).slice(0, 200),
    link: link.trim(),
    imageUrl: meta.image || meta.image_url || meta.imageurl || meta.banner,
    placement: meta.placement || meta.zone || meta.slot || 'homepage-top',
    advertiser: meta.advertiser || meta.sponsor || meta.client,
    budget: Number.isFinite(budget) ? budget : undefined,
    active,
    startsAt: meta.start_date || meta.starts_at || meta.start,
    endsAt: meta.end_date || meta.ends_at || meta.end,
    sourceFormat: 'pdf',
  };
}

async function parsePdfAds(file: Express.Multer.File): Promise<AdDocument[]> {
  const parsed = await pdfParse(file.buffer);
  const text = parsed.text?.trim() ?? '';
  if (!text) {
    throw new Error(`PDF "${file.originalname}" contains no extractable text`);
  }
  return [parseAdFromText(text, file.originalname)];
}

function parseMarkdownEntry(name: string, raw: string): ArticleDocument {
  const titleMatch = raw.match(/^#\s+(.+)$/m);
  const authorMatch = raw.match(/^author:\s*(.+)$/im);
  const title =
    titleMatch?.[1]?.trim() ??
    name
      .split('/')
      .pop()
      ?.replace(/\.(md|markdown)$/i, '')
      .replace(/[-_]/g, ' ') ??
    'Untitled';

  return {
    title,
    content: raw.trim(),
    author: authorMatch?.[1]?.trim(),
    sourceFormat: 'markdown',
  };
}

async function parseContentZip(file: Express.Multer.File): Promise<ArticleDocument[]> {
  const zip = new AdmZip(file.buffer);
  const articles: ArticleDocument[] = [];

  for (const entry of zip.getEntries()) {
    if (entry.isDirectory) continue;
    const name = entry.entryName;
    const lower = name.toLowerCase();

    if (lower.endsWith('.md') || lower.endsWith('.markdown')) {
      articles.push(parseMarkdownEntry(name, entry.getData().toString('utf8')));
      continue;
    }

    if (lower.endsWith('.pdf')) {
      const baseName = name.split('/').pop() ?? name;
      const doc = await parsePdfBuffer(entry.getData(), baseName);
      articles.push(doc);
    }
  }

  return articles;
}

function parseImageZip(file: Express.Multer.File) {
  const zip = new AdmZip(file.buffer);
  const files: { path: string; deviceSlug: string; fileName: string }[] = [];

  for (const entry of zip.getEntries()) {
    if (entry.isDirectory) continue;
    const path = entry.entryName;
    const lower = path.toLowerCase();
    if (
      !lower.endsWith('.jpg') &&
      !lower.endsWith('.jpeg') &&
      !lower.endsWith('.png') &&
      !lower.endsWith('.webp') &&
      !lower.endsWith('.gif')
    ) {
      continue;
    }

    const parts = path.split('/').filter(Boolean);
    const fileName = parts[parts.length - 1] ?? path;
    const deviceSlug =
      parts.length >= 2
        ? parts[parts.length - 2]!.toLowerCase()
        : fileName.replace(/\.[^.]+$/, '').toLowerCase();

    files.push({ path, deviceSlug, fileName });
  }

  return files;
}

export async function parseUpload(
  file: Express.Multer.File,
  kind: BulkImportKind,
  role: UserRole,
): Promise<ParsedUpload> {
  assertFileAllowed(kind, file.originalname, role);
  const ext = fileExtension(file.originalname);

  if (ext === 'pdf') {
    if (kind === 'advertisements') {
      const ads = await parsePdfAds(file);
      return { format: 'ads', ads };
    }
    const articles = await parsePdfFile(file);
    return { format: 'articles', articles };
  }

  if (ext === 'json' && kind === 'advertisements') {
    return { format: 'rows', rows: parseAdJsonFeed(file) };
  }

  if (ext === 'zip') {
    if (kind === 'images') {
      return { format: 'images', files: parseImageZip(file) };
    }
    if (kind === 'news' || kind === 'documentation') {
      const articles = await parseContentZip(file);
      if (articles.length === 0) {
        throw new Error(
          'ZIP must contain .md, .markdown, or .pdf files for news/documentation',
        );
      }
      return { format: 'articles', articles };
    }
    throw new Error('ZIP uploads are for images or news/documentation content only');
  }

  return { format: 'rows', rows: parseSpreadsheet(file) };
}
