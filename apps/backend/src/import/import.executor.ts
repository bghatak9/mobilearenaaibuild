import { Injectable } from '@nestjs/common';
import { PostStatus, UserRole } from '@prisma/client';

import { slugify } from '../common/slug';
import { hashPassword } from '../auth/password-crypto';
import { normalizeAdType, resolvePlacementMeta } from '../advertisement/ad-catalog';
import { PrismaService } from '../prisma/prisma.service';
import { ImportJobService } from './import-job.service';
import { ImportLifecycleService } from './import-lifecycle.service';
import { parseUpload } from './import.parser';
import type {
  BulkImportKind,
  ImportActor,
  ImportIssue,
  ImportRunResult,
  ImportValidationResult,
} from './import.types';
import { BACKGROUND_ROW_THRESHOLD } from './import.types';
import {
  describeImportRowColumns,
  deviceBrandFromRow,
  deviceCategoryFromRow,
  deviceManufacturerFromRow,
  deviceNameFromRow,
  isBrandOnlyImportRow,
  isPriceOnlyImportRow,
  resolveDeviceImportRow,
} from './import-device-fields';
import {
  applyImportedDeviceRelations,
  buildDeviceScalarData,
  deviceAnnouncedDateFromRow,
  deviceReleasedDateFromRow,
  deviceSlugFromRow,
} from './import-device-mapper';

function str(row: Record<string, unknown>, key: string): string {
  const v = row[key];
  return v == null ? '' : String(v).trim();
}

function strFrom(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = str(row, key);
    if (value) return value;
  }
  return '';
}

type DeviceImportKind = 'phones' | 'upcoming-devices';

function deviceDatesFromRow(row: Record<string, unknown>): {
  announcedDate: Date | null;
  releasedDate: Date | null;
  invalidKey?: string;
} {
  const resolved = resolveDeviceImportRow(row);
  const announced = deviceAnnouncedDateFromRow(resolved);
  if (announced === 'invalid') {
    return { announcedDate: null, releasedDate: null, invalidKey: 'announced_date' };
  }
  const released = deviceReleasedDateFromRow(resolved);
  if (released === 'invalid') {
    return { announcedDate: null, releasedDate: null, invalidKey: 'released_date' };
  }
  return {
    announcedDate: announced,
    releasedDate: released,
  };
}

function isUpcomingByDates(
  announcedDate: Date | null,
  releasedDate: Date | null,
  now = Date.now(),
): boolean {
  if (releasedDate && releasedDate.getTime() > now) return true;
  if (announcedDate && announcedDate.getTime() > now) return true;
  if (announcedDate && announcedDate.getTime() <= now) {
    const hasFutureRelease =
      releasedDate != null && releasedDate.getTime() > now;
    const awaitingRelease = !releasedDate;
    const recentlyAnnounced = now - announcedDate.getTime() <= 120 * 86_400_000;
    if ((hasFutureRelease || awaitingRelease) && recentlyAnnounced) return true;
  }
  return false;
}

function issue(
  rowIndex: number,
  row: Record<string, unknown>,
  reason: string,
  severity: ImportIssue['severity'] = 'error',
): ImportIssue {
  return { rowIndex, row, reason, severity };
}

@Injectable()
export class ImportExecutor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobs: ImportJobService,
    private readonly lifecycle: ImportLifecycleService,
  ) {}

  async validate(
    kind: BulkImportKind,
    file: Express.Multer.File,
    role: UserRole,
  ): Promise<ImportValidationResult> {
    if (!file) {
      return {
        kind,
        fileName: '',
        totalRows: 0,
        validCount: 0,
        invalidCount: 1,
        duplicateCount: 0,
        canImport: false,
        issues: [issue(0, {}, 'No file uploaded')],
        preview: [],
      };
    }

    try {
      const parsed = await parseUpload(file, kind, role);
      if (parsed.format === 'articles') {
        if (kind === 'reviews') {
          return this.validateReviewArticles(file.originalname, parsed.articles);
        }
        return this.validateArticleImport(kind, file.originalname, parsed.articles);
      }
      if (parsed.format === 'images') {
        return this.validateImageZip(kind, file.originalname, parsed.files);
      }
      if (parsed.format === 'ads') {
        return this.validateAdDocuments(file.originalname, parsed.ads);
      }

      switch (kind) {
        case 'phones':
          return this.validateDeviceImport('phones', file.originalname, parsed.rows);
        case 'upcoming-devices':
          return this.validateDeviceImport(
            'upcoming-devices',
            file.originalname,
            parsed.rows,
          );
        case 'brands':
          return this.validateBrands(file.originalname, parsed.rows);
        case 'news':
          return this.validateNews(file.originalname, parsed.rows);
        case 'documentation':
          return this.validateDocumentation(file.originalname, parsed.rows);
        case 'users':
          return this.validateUsers(file.originalname, parsed.rows);
        case 'prices':
          return this.validatePrices(file.originalname, parsed.rows);
        case 'reviews':
          return this.validateReviews(file.originalname, parsed.rows);
        case 'advertisements':
          return this.validateAdvertisements(file.originalname, parsed.rows);
        default:
          return this.emptyValidation(
            kind,
            file.originalname,
            'Unsupported upload kind',
          );
      }
    } catch (err) {
      return this.emptyValidation(
        kind,
        file.originalname,
        err instanceof Error ? err.message : 'Failed to parse upload',
      );
    }
  }

  async run(
    kind: BulkImportKind,
    file: Express.Multer.File,
    actor: ImportActor,
    options: { atomic?: boolean; background?: boolean } = {},
  ): Promise<ImportRunResult & { jobId?: string }> {
    const validation = await this.validate(kind, file, actor.role);
    if (!validation.canImport) {
      return ImportJobService.buildResult({
        success: false,
        kind,
        status: 'failed',
        totalRows: validation.totalRows,
        inserted: 0,
        updated: 0,
        skipped: validation.invalidCount + validation.duplicateCount,
        rolledBack: false,
        message: 'Fix validation errors before uploading',
        issues: validation.issues,
      });
    }

    const useBackground =
      options.background !== false &&
      validation.totalRows >= BACKGROUND_ROW_THRESHOLD;

    const runContext = {
      fileName: file.originalname,
      actor,
    };

    const runFn = async (
      onProgress: (processed: number, total: number) => void,
      jobId: string,
    ) => {
      const parsed = await parseUpload(file, kind, actor.role);
      if (parsed.format === 'articles') {
        if (kind === 'reviews') {
          return this.executeReviewArticles(
            parsed.articles,
            validation,
            options.atomic ?? true,
            onProgress,
          );
        }
        if (kind === 'documentation') {
          return this.executeDocumentationArticles(
            parsed.articles,
            validation,
            options.atomic ?? true,
            onProgress,
          );
        }
        return this.executeArticleNews(
          parsed.articles,
          validation,
          options.atomic ?? true,
          onProgress,
          { ...runContext, jobId: jobId || undefined },
        );
      }
      if (parsed.format === 'images') {
        return this.executeImageZip(parsed.files, options.atomic ?? true, onProgress);
      }
      if (parsed.format === 'ads') {
        return this.executeAdDocuments(
          parsed.ads,
          validation,
          options.atomic ?? true,
          onProgress,
          { ...runContext, jobId: jobId || undefined },
        );
      }

      switch (kind) {
        case 'phones':
          return this.executeDeviceImport(
            'phones',
            parsed.rows,
            validation,
            options.atomic ?? true,
            onProgress,
            { ...runContext, jobId: jobId || undefined },
          );
        case 'upcoming-devices':
          return this.executeDeviceImport(
            'upcoming-devices',
            parsed.rows,
            validation,
            options.atomic ?? true,
            onProgress,
            { ...runContext, jobId: jobId || undefined },
          );
        case 'brands':
          return this.executeBrands(
            parsed.rows,
            validation,
            options.atomic ?? true,
            onProgress,
            { ...runContext, jobId: jobId || undefined },
          );
        case 'news':
          return this.executeNews(
            parsed.rows,
            validation,
            options.atomic ?? true,
            onProgress,
            { ...runContext, jobId: jobId || undefined },
          );
        case 'documentation':
          return this.executeDocumentation(
            parsed.rows,
            validation,
            options.atomic ?? true,
            onProgress,
          );
        case 'users':
          return this.executeUsers(parsed.rows, validation, options.atomic ?? true, onProgress);
        case 'prices':
          return this.executePrices(parsed.rows, validation, options.atomic ?? true, onProgress);
        case 'reviews':
          return this.executeReviews(parsed.rows, validation, options.atomic ?? true, onProgress);
        case 'advertisements':
          return this.executeAdvertisements(
            parsed.rows,
            validation,
            options.atomic ?? true,
            onProgress,
            { ...runContext, jobId: jobId || undefined },
          );
        default:
          return ImportJobService.buildResult({
            success: false,
            kind,
            status: 'failed',
            totalRows: 0,
            inserted: 0,
            updated: 0,
            skipped: 0,
            rolledBack: false,
            message: 'Unsupported kind',
          });
      }
    };

    if (useBackground) {
      const jobId = this.jobs.createJob({
        kind,
        fileName: file.originalname,
        fileBuffer: file.buffer,
        actor,
        totalRows: validation.totalRows,
        runFn,
      });
      return {
        success: true,
        kind,
        jobId,
        status: 'queued',
        totalRows: validation.totalRows,
        inserted: 0,
        updated: 0,
        skipped: 0,
        rolledBack: false,
        message: 'Upload queued for background processing',
        issues: [],
      };
    }

    const result = await runFn((processed, total) => {
      void processed;
      void total;
    }, '');
    return { ...result, kind };
  }

  /* ---- Phones / upcoming devices ---- */

  private validateDeviceImport(
    importKind: DeviceImportKind,
    fileName: string,
    rows: Record<string, unknown>[],
  ): ImportValidationResult {
    const issues: ImportIssue[] = [];
    const seen = new Set<string>();
    let validCount = 0;
    const requireLaunchDates = importKind === 'upcoming-devices';

    rows.forEach((row, index) => {
      const resolved = resolveDeviceImportRow(row);

      if (isBrandOnlyImportRow(resolved)) {
        issues.push(
          issue(
            index + 2,
            row,
            'This looks like a Brands file (name, logo). Use Bulk Upload → Brands, or add brand and category columns for phones.',
          ),
        );
        return;
      }

      if (isPriceOnlyImportRow(resolved)) {
        issues.push(
          issue(
            index + 2,
            row,
            'This looks like a Prices file (device, country, price). Upload phones first, then use Bulk Upload → Prices.',
          ),
        );
        return;
      }

      const name = deviceNameFromRow(resolved);
      const brand = deviceBrandFromRow(resolved);
      const category = deviceCategoryFromRow(resolved);
      if (!name || !brand || !category) {
        const keys = describeImportRowColumns(resolved);
        const hint = keys
          ? ` Found columns: ${keys}. Required: name (or model_name), brand, category (or device_type).`
          : ' Row is empty or headers were not recognized — use row 1 for headers: name, brand, category (or model_name, brand, device_type).';
        issues.push(
          issue(index + 2, row, `Missing name, brand, or category.${hint}`),
        );
        return;
      }
      const slug = deviceSlugFromRow(resolved);
      if (seen.has(slug)) {
        issues.push(issue(index + 2, row, 'Duplicate in file', 'duplicate'));
        return;
      }
      seen.add(slug);
      const priceRaw = str(row, 'price');
      if (priceRaw && (isNaN(Number(priceRaw)) || Number(priceRaw) < 0)) {
        issues.push(issue(index + 2, row, 'Invalid price'));
        return;
      }

      const { announcedDate, releasedDate, invalidKey } = deviceDatesFromRow(row);
      if (invalidKey) {
        issues.push(
          issue(index + 2, row, `Invalid ${invalidKey} — use ISO date (e.g. 2026-09-15)`),
        );
        return;
      }
      if (requireLaunchDates && !announcedDate && !releasedDate) {
        issues.push(
          issue(
            index + 2,
            row,
            'Missing announced_date or released_date (required for upcoming devices)',
          ),
        );
        return;
      }
      if (
        requireLaunchDates &&
        !isUpcomingByDates(announcedDate, releasedDate)
      ) {
        issues.push(
          issue(
            index + 2,
            row,
            'Device is not upcoming — set a future announced_date or released_date',
          ),
        );
        return;
      }

      validCount++;
    });

    return this.buildValidation(importKind, fileName, rows, validCount, issues);
  }

  private async executeDeviceImport(
    importKind: DeviceImportKind,
    rows: Record<string, unknown>[],
    validation: ImportValidationResult,
    atomic: boolean,
    onProgress: (p: number, t: number) => void,
    meta: {
      fileName: string;
      actor: ImportActor;
      jobId?: string;
    },
  ): Promise<ImportRunResult> {
    const validRows = rows.filter((_, i) => {
      const rowNum = i + 2;
      return !validation.issues.some(
        (x) => x.rowIndex === rowNum && x.severity === 'error',
      );
    });

    const existing = await this.prisma.device.findMany({
      where: {
        slug: {
          in: validRows.map((r) => deviceSlugFromRow(resolveDeviceImportRow(r))),
        },
        deletedAt: null,
      },
      select: { slug: true },
    });
    const existingSlugs = new Set(existing.map((d) => d.slug));

    const toInsert = validRows.filter(
      (r) => !existingSlugs.has(deviceSlugFromRow(resolveDeviceImportRow(r))),
    );
    const skipped = validRows.length - toInsert.length;
    const issues = [...validation.issues];

    try {
      const insertedDeviceIds: number[] = [];
      await this.prisma.$transaction(
        async (tx) => {
          for (let i = 0; i < toInsert.length; i++) {
            const rawRow = toInsert[i]!;
            const scalar = buildDeviceScalarData(rawRow);
            const {
              name,
              slug,
              brandName,
              categoryName,
              manufacturerName,
              price,
              os,
              weight,
              dimensions,
              announcedDate,
              releasedDate,
              ramGb,
              storageGb,
              nfc,
              infrared,
              fiveG,
              fingerprint,
              waterproof,
            } = scalar;

            const brand = await tx.brand.upsert({
              where: { name: brandName },
              update: {},
              create: { name: brandName, slug: slugify(brandName) },
            });
            const category = await tx.category.upsert({
              where: { name: categoryName },
              update: {},
              create: { name: categoryName, slug: slugify(categoryName) },
            });
            const manufacturer = await tx.manufacturer.upsert({
              where: { name: manufacturerName },
              update: {},
              create: { name: manufacturerName, slug: slugify(manufacturerName) },
            });

            const device = await tx.device.create({
              data: {
                name,
                slug,
                price,
                os,
                weight,
                dimensions,
                announcedDate:
                  announcedDate === 'invalid' ? null : announcedDate,
                releasedDate: releasedDate === 'invalid' ? null : releasedDate,
                ramGb,
                storageGb,
                nfc,
                infrared,
                fiveG,
                fingerprint,
                waterproof,
                brandId: brand.id,
                categoryId: category.id,
                manufacturerId: manufacturer.id,
              },
            });
            await applyImportedDeviceRelations(tx, device.id, rawRow);
            insertedDeviceIds.push(device.id);
            onProgress(i + 1, toInsert.length);
          }
        },
        { timeout: 120_000 },
      );

      let batchId: number | undefined;
      if (insertedDeviceIds.length > 0) {
        const batch = await this.lifecycle.recordBatch({
          kind: importKind,
          fileName: meta.fileName,
          jobId: meta.jobId,
          actor: meta.actor,
          totalRows: rows.length,
          inserted: insertedDeviceIds.length,
          skipped,
          deviceIds: insertedDeviceIds,
        });
        batchId = batch?.id;
      }

      return ImportJobService.buildResult({
        success: toInsert.length > 0,
        kind: importKind,
        status: 'completed',
        totalRows: rows.length,
        inserted: toInsert.length,
        updated: 0,
        skipped,
        rolledBack: false,
        issues,
        batchId,
        message:
          toInsert.length === 0 && skipped > 0
            ? importKind === 'upcoming-devices'
              ? 'All upcoming devices already exist — rename rows in your file or delete existing devices in Upload history first.'
              : 'All phones already exist — rename rows in your file or delete existing phones in Upload history first.'
            : undefined,
      });
    } catch (err) {
      return ImportJobService.buildResult({
        success: false,
        kind: importKind,
        status: atomic ? 'rolled_back' : 'failed',
        totalRows: rows.length,
        inserted: 0,
        updated: 0,
        skipped: rows.length,
        rolledBack: atomic,
        message: err instanceof Error ? err.message : 'Upload failed — transaction rolled back',
        issues,
      });
    }
  }

  /* ---- Brands ---- */

  private validateBrands(
    fileName: string,
    rows: Record<string, unknown>[],
  ): ImportValidationResult {
    const issues: ImportIssue[] = [];
    const seen = new Set<string>();
    let validCount = 0;

    rows.forEach((row, index) => {
      const name = strFrom(row, 'name', 'brand_name', 'brand');
      if (!name) {
        issues.push(issue(index + 2, row, 'Missing brand name'));
        return;
      }
      const slug = slugify(name);
      if (seen.has(slug)) {
        issues.push(issue(index + 2, row, 'Duplicate in file', 'duplicate'));
        return;
      }
      seen.add(slug);
      validCount++;
    });

    return this.buildValidation('brands', fileName, rows, validCount, issues);
  }

  private async executeBrands(
    rows: Record<string, unknown>[],
    validation: ImportValidationResult,
    atomic: boolean,
    onProgress: (p: number, t: number) => void,
    meta?: {
      fileName: string;
      actor: ImportActor;
      jobId?: string;
    },
  ): Promise<ImportRunResult> {
    const validRows = rows.filter((_, i) => {
      const rowNum = i + 2;
      return !validation.issues.some(
        (x) => x.rowIndex === rowNum && x.severity === 'error',
      );
    });

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const touchedBrands: { id: number; slug: string; name: string }[] = [];

    try {
      await this.prisma.$transaction(async (tx) => {
        for (let i = 0; i < validRows.length; i++) {
          const row = validRows[i]!;
          const name = strFrom(row, 'name', 'brand_name', 'brand');
          const logo = str(row, 'logo') || null;
          const slug = slugify(name);
          const existing =
            (slug
              ? await tx.brand.findUnique({ where: { slug } })
              : null) ??
            (await tx.brand.findFirst({
              where: { name: { equals: name, mode: 'insensitive' } },
            }));
          if (existing) {
            const data: { name?: string; logo?: string | null } = {};
            if (existing.name !== name) data.name = name;
            if (logo && existing.logo !== logo) data.logo = logo;
            let brandRecord = existing;
            if (Object.keys(data).length > 0) {
              brandRecord = await tx.brand.update({
                where: { id: existing.id },
                data,
              });
              updated++;
            } else {
              skipped++;
            }
            touchedBrands.push({
              id: brandRecord.id,
              slug: brandRecord.slug,
              name: brandRecord.name,
            });
          } else {
            const created = await tx.brand.create({
              data: { name, slug, logo },
            });
            inserted++;
            touchedBrands.push({
              id: created.id,
              slug: created.slug,
              name: created.name,
            });
          }
          onProgress(i + 1, validRows.length);
        }
      });

      let batchId: number | undefined;
      if (meta && touchedBrands.length > 0) {
        const batch = await this.lifecycle.recordBrandBatch({
          fileName: meta.fileName,
          jobId: meta.jobId,
          actor: meta.actor,
          totalRows: rows.length,
          inserted,
          updated,
          skipped,
          brands: touchedBrands,
        });
        batchId = batch?.id;
      }

      return ImportJobService.buildResult({
        success: inserted > 0 || updated > 0 || skipped > 0,
        kind: 'brands',
        status: 'completed',
        totalRows: rows.length,
        inserted,
        updated,
        skipped,
        rolledBack: false,
        issues: validation.issues,
        batchId,
        message:
          inserted === 0 && updated === 0 && skipped > 0
            ? `All ${skipped} brands are already in the catalog.`
            : updated > 0 && inserted > 0
              ? `${inserted} new brand(s) added; ${updated} existing brand(s) updated.`
              : updated > 0
                ? `${updated} existing brand(s) updated.`
                : inserted > 0
                  ? `${inserted} new brand(s) added.`
                  : undefined,
      });
    } catch (err) {
      return ImportJobService.buildResult({
        success: false,
        kind: 'brands',
        status: atomic ? 'rolled_back' : 'failed',
        totalRows: rows.length,
        inserted: 0,
        updated: 0,
        skipped: rows.length,
        rolledBack: atomic,
        message: err instanceof Error ? err.message : 'Upload rolled back',
        issues: validation.issues,
      });
    }
  }

  /* ---- News ---- */

  private validateNews(
    fileName: string,
    rows: Record<string, unknown>[],
  ): ImportValidationResult {
    const issues: ImportIssue[] = [];
    const seen = new Set<string>();
    let validCount = 0;

    rows.forEach((row, index) => {
      const title = str(row, 'title');
      const content = str(row, 'content');
      if (!title || !content) {
        issues.push(issue(index + 2, row, 'Missing title or content'));
        return;
      }
      const slug = slugify(title);
      if (seen.has(slug)) {
        issues.push(issue(index + 2, row, 'Duplicate in file', 'duplicate'));
        return;
      }
      seen.add(slug);
      validCount++;
    });

    return this.buildValidation('news', fileName, rows, validCount, issues);
  }

  private validateArticleImport(
    kind: BulkImportKind,
    fileName: string,
    articles: { title: string; content: string; sourceFormat?: string }[],
  ): ImportValidationResult {
    const issues: ImportIssue[] = [];
    const seen = new Set<string>();
    let validCount = 0;

    articles.forEach((article, index) => {
      if (!article.title || !article.content) {
        issues.push(
          issue(index + 1, { title: article.title }, 'Missing title or content'),
        );
        return;
      }
      const slug = slugify(article.title);
      if (seen.has(slug)) {
        issues.push(
          issue(index + 1, { title: article.title }, 'Duplicate in file', 'duplicate'),
        );
        return;
      }
      seen.add(slug);
      validCount++;
    });

    return {
      kind,
      fileName,
      totalRows: articles.length,
      validCount,
      invalidCount: issues.filter((x) => x.severity === 'error').length,
      duplicateCount: issues.filter((x) => x.severity === 'duplicate').length,
      canImport: validCount > 0 && issues.every((x) => x.severity !== 'error'),
      issues,
      preview: articles.slice(0, 5).map((a) => ({
        title: a.title,
        format: a.sourceFormat ?? 'article',
      })),
    };
  }

  private validateDocumentation(
    fileName: string,
    rows: Record<string, unknown>[],
  ): ImportValidationResult {
    const result = this.validateNews(fileName, rows);
    return { ...result, kind: 'documentation' };
  }

  private validateReviewArticles(
    fileName: string,
    articles: {
      title: string;
      content: string;
      sourceFormat?: string;
    }[],
  ): ImportValidationResult {
    const issues: ImportIssue[] = [];
    const seen = new Set<string>();
    let validCount = 0;

    articles.forEach((article, index) => {
      if (!article.title || !article.content) {
        issues.push(
          issue(index + 1, { title: article.title }, 'Missing title or content'),
        );
        return;
      }
      const slug = slugify(article.title);
      if (seen.has(slug)) {
        issues.push(
          issue(index + 1, { title: article.title }, 'Duplicate in file', 'duplicate'),
        );
        return;
      }
      seen.add(slug);
      validCount++;
    });

    return {
      kind: 'reviews',
      fileName,
      totalRows: articles.length,
      validCount,
      invalidCount: issues.filter((x) => x.severity === 'error').length,
      duplicateCount: issues.filter((x) => x.severity === 'duplicate').length,
      canImport: validCount > 0 && issues.every((x) => x.severity !== 'error'),
      issues,
      preview: articles.slice(0, 5).map((a) => ({
        title: a.title,
        format: a.sourceFormat ?? 'pdf',
      })),
    };
  }

  private extractDeviceFromArticle(
    title: string,
    content: string,
  ): string | null {
    const deviceLine = content.match(/^device:\s*(.+)$/im)?.[1]?.trim();
    if (deviceLine) return deviceLine;

    const fromTitle = title.match(/^(.+?)\s+review$/i)?.[1]?.trim();
    return fromTitle || null;
  }

  private async executeNews(
    rows: Record<string, unknown>[],
    validation: ImportValidationResult,
    atomic: boolean,
    onProgress: (p: number, t: number) => void,
    meta: {
      fileName: string;
      actor: ImportActor;
      jobId?: string;
    },
  ): Promise<ImportRunResult> {
    const validRows = rows.filter((_, i) => {
      const rowNum = i + 2;
      return !validation.issues.some(
        (x) => x.rowIndex === rowNum && x.severity === 'error',
      );
    });

    try {
      const insertedNewsIds: number[] = [];
      await this.prisma.$transaction(async (tx) => {
        for (let i = 0; i < validRows.length; i++) {
          const row = validRows[i]!;
          const title = str(row, 'title');
          const slug = slugify(title);
          const existing = await tx.news.findUnique({ where: { slug } });
          if (existing) continue;

          const status = this.parsePostStatus(str(row, 'status'));
          const article = await tx.news.create({
            data: {
              title,
              slug,
              content: str(row, 'content'),
              excerpt: str(row, 'excerpt') || null,
              featured: this.parseBool(row.featured),
              status,
              publishedAt: status === PostStatus.PUBLISHED ? new Date() : null,
            },
          });
          insertedNewsIds.push(article.id);
          onProgress(i + 1, validRows.length);
        }
      });

      let batchId: number | undefined;
      if (insertedNewsIds.length > 0) {
        const batch = await this.lifecycle.recordNewsBatch({
          fileName: meta.fileName,
          jobId: meta.jobId,
          actor: meta.actor,
          totalRows: rows.length,
          inserted: insertedNewsIds.length,
          skipped: rows.length - insertedNewsIds.length,
          newsIds: insertedNewsIds,
        });
        batchId = batch?.id;
      }

      return ImportJobService.buildResult({
        success: true,
        kind: 'news',
        status: 'completed',
        totalRows: rows.length,
        inserted: insertedNewsIds.length,
        updated: 0,
        skipped: rows.length - insertedNewsIds.length,
        rolledBack: false,
        issues: validation.issues,
        batchId,
      });
    } catch (err) {
      return ImportJobService.buildResult({
        success: false,
        kind: 'news',
        status: atomic ? 'rolled_back' : 'failed',
        totalRows: rows.length,
        inserted: 0,
        updated: 0,
        skipped: rows.length,
        rolledBack: atomic,
        message: err instanceof Error ? err.message : 'Upload rolled back',
        issues: validation.issues,
      });
    }
  }

  private async executeArticleNews(
    articles: { title: string; content: string; author?: string }[],
    validation: ImportValidationResult,
    atomic: boolean,
    onProgress: (p: number, t: number) => void,
    meta: {
      fileName: string;
      actor: ImportActor;
      jobId?: string;
    },
  ): Promise<ImportRunResult> {
    const validArticles = articles.filter((_, i) => {
      const rowNum = i + 1;
      return !validation.issues.some(
        (x) => x.rowIndex === rowNum && x.severity === 'error',
      );
    });

    try {
      const insertedNewsIds: number[] = [];
      await this.prisma.$transaction(async (tx) => {
        for (let i = 0; i < validArticles.length; i++) {
          const article = validArticles[i]!;
          const slug = slugify(article.title);
          const existing = await tx.news.findUnique({ where: { slug } });
          if (existing) continue;

          const created = await tx.news.create({
            data: {
              title: article.title,
              slug,
              content: article.content,
              excerpt: article.content.slice(0, 160),
              status: PostStatus.DRAFT,
            },
          });
          insertedNewsIds.push(created.id);
          onProgress(i + 1, validArticles.length);
        }
      });

      let batchId: number | undefined;
      if (insertedNewsIds.length > 0) {
        const batch = await this.lifecycle.recordNewsBatch({
          fileName: meta.fileName,
          jobId: meta.jobId,
          actor: meta.actor,
          totalRows: articles.length,
          inserted: insertedNewsIds.length,
          skipped: articles.length - insertedNewsIds.length,
          newsIds: insertedNewsIds,
        });
        batchId = batch?.id;
      }

      return ImportJobService.buildResult({
        success: true,
        kind: 'news',
        status: 'completed',
        totalRows: articles.length,
        inserted: insertedNewsIds.length,
        updated: 0,
        skipped: articles.length - insertedNewsIds.length,
        rolledBack: false,
        issues: validation.issues,
        batchId,
      });
    } catch (err) {
      return ImportJobService.buildResult({
        success: false,
        kind: 'news',
        status: atomic ? 'rolled_back' : 'failed',
        totalRows: articles.length,
        inserted: 0,
        updated: 0,
        skipped: articles.length,
        rolledBack: atomic,
        message: err instanceof Error ? err.message : 'Upload rolled back',
        issues: validation.issues,
      });
    }
  }

  private async executeDocumentation(
    rows: Record<string, unknown>[],
    validation: ImportValidationResult,
    atomic: boolean,
    onProgress: (p: number, t: number) => void,
  ): Promise<ImportRunResult> {
    const validRows = rows.filter((_, i) => {
      const rowNum = i + 2;
      return !validation.issues.some(
        (x) => x.rowIndex === rowNum && x.severity === 'error',
      );
    });

    try {
      let inserted = 0;
      await this.prisma.$transaction(async (tx) => {
        for (let i = 0; i < validRows.length; i++) {
          const row = validRows[i]!;
          const title = str(row, 'title');
          const slug = slugify(title);
          const existing = await tx.news.findUnique({ where: { slug } });
          if (existing) continue;

          const status = this.parsePostStatus(str(row, 'status'));
          await tx.news.create({
            data: {
              title,
              slug,
              content: str(row, 'content'),
              excerpt: 'documentation',
              status,
            },
          });
          inserted++;
          onProgress(i + 1, validRows.length);
        }
      });

      return ImportJobService.buildResult({
        success: true,
        kind: 'documentation',
        status: 'completed',
        totalRows: rows.length,
        inserted,
        updated: 0,
        skipped: rows.length - inserted,
        rolledBack: false,
        issues: validation.issues,
      });
    } catch (err) {
      return ImportJobService.buildResult({
        success: false,
        kind: 'documentation',
        status: atomic ? 'rolled_back' : 'failed',
        totalRows: rows.length,
        inserted: 0,
        updated: 0,
        skipped: rows.length,
        rolledBack: atomic,
        message: err instanceof Error ? err.message : 'Upload rolled back',
        issues: validation.issues,
      });
    }
  }

  private async executeDocumentationArticles(
    articles: { title: string; content: string }[],
    validation: ImportValidationResult,
    atomic: boolean,
    onProgress: (p: number, t: number) => void,
  ): Promise<ImportRunResult> {
    const validArticles = articles.filter((_, i) => {
      const rowNum = i + 1;
      return !validation.issues.some(
        (x) => x.rowIndex === rowNum && x.severity === 'error',
      );
    });

    try {
      let inserted = 0;
      await this.prisma.$transaction(async (tx) => {
        for (let i = 0; i < validArticles.length; i++) {
          const article = validArticles[i]!;
          const slug = slugify(article.title);
          const existing = await tx.news.findUnique({ where: { slug } });
          if (existing) continue;

          await tx.news.create({
            data: {
              title: article.title,
              slug,
              content: article.content,
              excerpt: 'documentation',
              status: PostStatus.DRAFT,
            },
          });
          inserted++;
          onProgress(i + 1, validArticles.length);
        }
      });

      return ImportJobService.buildResult({
        success: true,
        kind: 'documentation',
        status: 'completed',
        totalRows: articles.length,
        inserted,
        updated: 0,
        skipped: articles.length - inserted,
        rolledBack: false,
        issues: validation.issues,
      });
    } catch (err) {
      return ImportJobService.buildResult({
        success: false,
        kind: 'documentation',
        status: atomic ? 'rolled_back' : 'failed',
        totalRows: articles.length,
        inserted: 0,
        updated: 0,
        skipped: articles.length,
        rolledBack: atomic,
        message: err instanceof Error ? err.message : 'Upload rolled back',
        issues: validation.issues,
      });
    }
  }

  private async executeReviewArticles(
    articles: { title: string; content: string }[],
    validation: ImportValidationResult,
    atomic: boolean,
    onProgress: (p: number, t: number) => void,
  ): Promise<ImportRunResult> {
    const validArticles = articles.filter((_, i) => {
      const rowNum = i + 1;
      return !validation.issues.some(
        (x) => x.rowIndex === rowNum && x.severity === 'error',
      );
    });

    const extraIssues: ImportIssue[] = [...validation.issues];

    try {
      let inserted = 0;
      let skipped = 0;
      await this.prisma.$transaction(async (tx) => {
        for (let i = 0; i < validArticles.length; i++) {
          const article = validArticles[i]!;
          const slug = slugify(article.title);
          const existing = await tx.review.findUnique({ where: { slug } });
          if (existing) {
            skipped++;
            onProgress(i + 1, validArticles.length);
            continue;
          }

          const deviceKey = this.extractDeviceFromArticle(
            article.title,
            article.content,
          );
          if (!deviceKey) {
            skipped++;
            extraIssues.push(
              issue(
                i + 1,
                { title: article.title },
                'PDF review missing device — add "device: Model Name" in content or use CSV',
                'warning',
              ),
            );
            onProgress(i + 1, validArticles.length);
            continue;
          }

          const device = await tx.device.findFirst({
            where: {
              OR: [{ name: deviceKey }, { slug: slugify(deviceKey) }],
            },
          });
          if (!device) {
            skipped++;
            extraIssues.push(
              issue(
                i + 1,
                { title: article.title, device: deviceKey },
                `Device not found: ${deviceKey}`,
                'warning',
              ),
            );
            onProgress(i + 1, validArticles.length);
            continue;
          }

          const scoreMatch = article.content.match(/score:\s*([\d.]+)/i);
          const score = scoreMatch ? Number(scoreMatch[1]) : 0;

          await tx.review.create({
            data: {
              title: article.title,
              slug,
              content: article.content,
              score,
              pros: [],
              cons: [],
              deviceId: device.id,
            },
          });
          inserted++;
          onProgress(i + 1, validArticles.length);
        }
      });

      return ImportJobService.buildResult({
        success: inserted > 0,
        kind: 'reviews',
        status: 'completed',
        totalRows: articles.length,
        inserted,
        updated: 0,
        skipped: skipped + (articles.length - validArticles.length),
        rolledBack: false,
        issues: extraIssues,
        message:
          inserted === 0
            ? 'No reviews uploaded — link devices via CSV or add device: in PDF content'
            : undefined,
      });
    } catch (err) {
      return ImportJobService.buildResult({
        success: false,
        kind: 'reviews',
        status: atomic ? 'rolled_back' : 'failed',
        totalRows: articles.length,
        inserted: 0,
        updated: 0,
        skipped: articles.length,
        rolledBack: atomic,
        message: err instanceof Error ? err.message : 'Upload rolled back',
        issues: extraIssues,
      });
    }
  }

  /* ---- Users ---- */

  private validateUsers(
    fileName: string,
    rows: Record<string, unknown>[],
  ): ImportValidationResult {
    const issues: ImportIssue[] = [];
    const seen = new Set<string>();
    let validCount = 0;

    rows.forEach((row, index) => {
      const email = str(row, 'email').toLowerCase();
      if (!email || !email.includes('@')) {
        issues.push(issue(index + 2, row, 'Invalid or missing email'));
        return;
      }
      if (seen.has(email)) {
        issues.push(issue(index + 2, row, 'Duplicate in file', 'duplicate'));
        return;
      }
      seen.add(email);
      const role = str(row, 'role').toUpperCase();
      if (role === 'SUPER_ADMIN') {
        issues.push(issue(index + 2, row, 'Cannot bulk-upload SUPER_ADMIN'));
        return;
      }
      validCount++;
    });

    return this.buildValidation('users', fileName, rows, validCount, issues);
  }

  private async executeUsers(
    rows: Record<string, unknown>[],
    validation: ImportValidationResult,
    atomic: boolean,
    onProgress: (p: number, t: number) => void,
  ): Promise<ImportRunResult> {
    const validRows = rows.filter((_, i) => {
      const rowNum = i + 2;
      return !validation.issues.some(
        (x) => x.rowIndex === rowNum && x.severity === 'error',
      );
    });

    try {
      let inserted = 0;
      await this.prisma.$transaction(async (tx) => {
        for (let i = 0; i < validRows.length; i++) {
          const row = validRows[i]!;
          const email = str(row, 'email').toLowerCase();
          const existing = await tx.user.findUnique({ where: { email } });
          if (existing) continue;

          const role = this.parseUserRole(str(row, 'role'));
          const password = str(row, 'password');
          const passwordHash = password ? await hashPassword(password) : null;
          const status = str(row, 'status').toLowerCase();
          const isActive = status !== 'inactive' && status !== 'disabled';

          await tx.user.create({
            data: {
              email,
              name: str(row, 'name') || email.split('@')[0],
              role,
              passwordHash,
              isActive,
              isVerified: status === 'verified' || status === 'active' || !status,
            },
          });
          inserted++;
          onProgress(i + 1, validRows.length);
        }
      });

      return ImportJobService.buildResult({
        success: true,
        kind: 'users',
        status: 'completed',
        totalRows: rows.length,
        inserted,
        updated: 0,
        skipped: rows.length - inserted,
        rolledBack: false,
        issues: validation.issues,
      });
    } catch (err) {
      return ImportJobService.buildResult({
        success: false,
        kind: 'users',
        status: atomic ? 'rolled_back' : 'failed',
        totalRows: rows.length,
        inserted: 0,
        updated: 0,
        skipped: rows.length,
        rolledBack: atomic,
        message: err instanceof Error ? err.message : 'Upload rolled back',
        issues: validation.issues,
      });
    }
  }

  /* ---- Prices ---- */

  private validatePrices(
    fileName: string,
    rows: Record<string, unknown>[],
  ): ImportValidationResult {
    const issues: ImportIssue[] = [];
    let validCount = 0;

    rows.forEach((row, index) => {
      const model = str(row, 'model') || str(row, 'device') || str(row, 'name');
      const price = str(row, 'price');
      if (!model) {
        issues.push(issue(index + 2, row, 'Missing model/device name'));
        return;
      }
      if (!price || isNaN(Number(price)) || Number(price) < 0) {
        issues.push(issue(index + 2, row, 'Invalid price'));
        return;
      }
      validCount++;
    });

    return this.buildValidation('prices', fileName, rows, validCount, issues);
  }

  private async executePrices(
    rows: Record<string, unknown>[],
    validation: ImportValidationResult,
    atomic: boolean,
    onProgress: (p: number, t: number) => void,
  ): Promise<ImportRunResult> {
    const validRows = rows.filter((_, i) => {
      const rowNum = i + 2;
      return !validation.issues.some(
        (x) => x.rowIndex === rowNum && x.severity === 'error',
      );
    });

    try {
      let updated = 0;
      let skipped = 0;
      await this.prisma.$transaction(async (tx) => {
        for (let i = 0; i < validRows.length; i++) {
          const row = validRows[i]!;
          const model = str(row, 'model') || str(row, 'device') || str(row, 'name');
          const device = await tx.device.findFirst({
            where: {
              OR: [{ name: model }, { slug: slugify(model) }],
            },
          });
          if (!device) {
            skipped++;
            continue;
          }
          await tx.device.update({
            where: { id: device.id },
            data: { price: Number(str(row, 'price')) },
          });
          updated++;
          onProgress(i + 1, validRows.length);
        }
      });

      return ImportJobService.buildResult({
        success: true,
        kind: 'prices',
        status: 'completed',
        totalRows: rows.length,
        inserted: 0,
        updated,
        skipped,
        rolledBack: false,
        issues: validation.issues,
      });
    } catch (err) {
      return ImportJobService.buildResult({
        success: false,
        kind: 'prices',
        status: atomic ? 'rolled_back' : 'failed',
        totalRows: rows.length,
        inserted: 0,
        updated: 0,
        skipped: rows.length,
        rolledBack: atomic,
        message: err instanceof Error ? err.message : 'Upload rolled back',
        issues: validation.issues,
      });
    }
  }

  /* ---- Reviews ---- */

  private validateReviews(
    fileName: string,
    rows: Record<string, unknown>[],
  ): ImportValidationResult {
    const issues: ImportIssue[] = [];
    const seen = new Set<string>();
    let validCount = 0;

    rows.forEach((row, index) => {
      const title = str(row, 'title');
      const device = str(row, 'device');
      const score = str(row, 'score') || str(row, 'rating');
      if (!title || !device) {
        issues.push(issue(index + 2, row, 'Missing title or device'));
        return;
      }
      if (!score || isNaN(Number(score))) {
        issues.push(issue(index + 2, row, 'Invalid score/rating'));
        return;
      }
      const slug = slugify(title);
      if (seen.has(slug)) {
        issues.push(issue(index + 2, row, 'Duplicate in file', 'duplicate'));
        return;
      }
      seen.add(slug);
      validCount++;
    });

    return this.buildValidation('reviews', fileName, rows, validCount, issues);
  }

  private async executeReviews(
    rows: Record<string, unknown>[],
    validation: ImportValidationResult,
    atomic: boolean,
    onProgress: (p: number, t: number) => void,
  ): Promise<ImportRunResult> {
    const validRows = rows.filter((_, i) => {
      const rowNum = i + 2;
      return !validation.issues.some(
        (x) => x.rowIndex === rowNum && x.severity === 'error',
      );
    });

    try {
      let inserted = 0;
      await this.prisma.$transaction(async (tx) => {
        for (let i = 0; i < validRows.length; i++) {
          const row = validRows[i]!;
          const title = str(row, 'title');
          const slug = slugify(title);
          const existing = await tx.review.findUnique({ where: { slug } });
          if (existing) continue;

          const deviceKey = str(row, 'device');
          const device = await tx.device.findFirst({
            where: {
              OR: [{ name: deviceKey }, { slug: slugify(deviceKey) }],
            },
          });
          if (!device) continue;

          const pros = str(row, 'pros')
            .split('|')
            .map((s) => s.trim())
            .filter(Boolean);
          const cons = str(row, 'cons')
            .split('|')
            .map((s) => s.trim())
            .filter(Boolean);

          await tx.review.create({
            data: {
              title,
              slug,
              content: str(row, 'content') || title,
              score: Number(str(row, 'score') || str(row, 'rating')),
              pros,
              cons,
              deviceId: device.id,
            },
          });
          inserted++;
          onProgress(i + 1, validRows.length);
        }
      });

      return ImportJobService.buildResult({
        success: true,
        kind: 'reviews',
        status: 'completed',
        totalRows: rows.length,
        inserted,
        updated: 0,
        skipped: rows.length - inserted,
        rolledBack: false,
        issues: validation.issues,
      });
    } catch (err) {
      return ImportJobService.buildResult({
        success: false,
        kind: 'reviews',
        status: atomic ? 'rolled_back' : 'failed',
        totalRows: rows.length,
        inserted: 0,
        updated: 0,
        skipped: rows.length,
        rolledBack: atomic,
        message: err instanceof Error ? err.message : 'Upload rolled back',
        issues: validation.issues,
      });
    }
  }

  /* ---- Images ZIP ---- */

  /* ---- Paid advertisements ---- */

  private adLinkFromRow(row: Record<string, unknown>): string {
    return (
      str(row, 'link') ||
      str(row, 'url') ||
      str(row, 'href') ||
      str(row, 'website') ||
      str(row, 'destination') ||
      ''
    );
  }

  private isValidAdLink(link: string): boolean {
    return /^https?:\/\//i.test(link.trim());
  }

  private validateAdvertisements(
    fileName: string,
    rows: Record<string, unknown>[],
  ): ImportValidationResult {
    const issues: ImportIssue[] = [];
    const seen = new Set<string>();
    let validCount = 0;

    rows.forEach((row, index) => {
      const title = str(row, 'title');
      const link = this.adLinkFromRow(row);
      if (!title) {
        issues.push(issue(index + 2, row, 'Missing title'));
        return;
      }
      if (!link || !this.isValidAdLink(link)) {
        issues.push(
          issue(index + 2, row, 'Missing or invalid link (must start with http:// or https://)'),
        );
        return;
      }
      const slug = slugify(title);
      if (seen.has(slug)) {
        issues.push(issue(index + 2, row, 'Duplicate in file', 'duplicate'));
        return;
      }
      seen.add(slug);
      validCount++;
    });

    return this.buildValidation('advertisements', fileName, rows, validCount, issues);
  }

  private validateAdDocuments(
    fileName: string,
    ads: {
      title: string;
      link: string;
      sourceFormat?: string;
    }[],
  ): ImportValidationResult {
    const issues: ImportIssue[] = [];
    const seen = new Set<string>();
    let validCount = 0;

    ads.forEach((ad, index) => {
      if (!ad.title) {
        issues.push(issue(index + 1, { title: ad.title }, 'Missing title'));
        return;
      }
      if (!ad.link || !this.isValidAdLink(ad.link)) {
        issues.push(
          issue(
            index + 1,
            { title: ad.title, link: ad.link },
            'Missing or invalid link — add link: or url: metadata line',
          ),
        );
        return;
      }
      const slug = slugify(ad.title);
      if (seen.has(slug)) {
        issues.push(
          issue(index + 1, { title: ad.title }, 'Duplicate in file', 'duplicate'),
        );
        return;
      }
      seen.add(slug);
      validCount++;
    });

    return {
      kind: 'advertisements',
      fileName,
      totalRows: ads.length,
      validCount,
      invalidCount: issues.filter((x) => x.severity === 'error').length,
      duplicateCount: issues.filter((x) => x.severity === 'duplicate').length,
      canImport: validCount > 0 && issues.every((x) => x.severity !== 'error'),
      issues,
      preview: ads.slice(0, 5).map((a) => ({
        title: a.title,
        link: a.link,
        format: a.sourceFormat ?? 'pdf',
      })),
    };
  }

  private adDataFromRow(row: Record<string, unknown>) {
    const title = str(row, 'title');
    const budgetRaw = str(row, 'budget') || str(row, 'spend') || str(row, 'price');
    const budget = budgetRaw ? Number.parseFloat(budgetRaw) : undefined;
    const activeRaw = str(row, 'active') || str(row, 'status');
    const active =
      activeRaw === '' ? true : this.parseBool(activeRaw) || activeRaw.toLowerCase() === 'active';
    const placement = str(row, 'placement') || str(row, 'zone') || 'homepage-top';
    const meta = resolvePlacementMeta(placement);
    const adType = normalizeAdType(
      str(row, 'ad_type') || str(row, 'adtype') || str(row, 'type') || str(row, 'category'),
      placement,
    );
    const widthRaw = str(row, 'width');
    const heightRaw = str(row, 'height');
    const widthParsed = widthRaw ? Number.parseInt(widthRaw, 10) : meta?.width;
    const heightParsed = heightRaw ? Number.parseInt(heightRaw, 10) : meta?.height;
    const sponsoredRaw = str(row, 'sponsored') || str(row, 'is_sponsored');
    const sponsored =
      sponsoredRaw !== ''
        ? this.parseBool(sponsoredRaw)
        : adType === 'sponsored' || adType === 'affiliate';
    const priorityRaw = str(row, 'priority');
    const priority = priorityRaw ? Number.parseInt(priorityRaw, 10) : 0;

    return {
      title,
      slug: slugify(title),
      link: this.adLinkFromRow(row),
      imageUrl:
        str(row, 'image_url') || str(row, 'image') || str(row, 'imageurl') || str(row, 'banner') || null,
      placement,
      adType,
      format: str(row, 'format') || meta?.label || null,
      width: Number.isFinite(widthParsed) ? widthParsed : null,
      height: Number.isFinite(heightParsed) ? heightParsed : null,
      sponsored,
      priority: Number.isFinite(priority) ? priority : 0,
      advertiser: str(row, 'advertiser') || str(row, 'sponsor') || str(row, 'client') || null,
      budget: Number.isFinite(budget) ? budget : null,
      active,
      startsAt: this.parseOptionalDate(
        str(row, 'start_date') || str(row, 'starts_at') || str(row, 'start'),
      ),
      endsAt: this.parseOptionalDate(
        str(row, 'end_date') || str(row, 'ends_at') || str(row, 'end'),
      ),
    };
  }

  private async executeAdvertisements(
    rows: Record<string, unknown>[],
    validation: ImportValidationResult,
    atomic: boolean,
    onProgress: (p: number, t: number) => void,
    meta: {
      fileName: string;
      actor: ImportActor;
      jobId?: string;
    },
  ): Promise<ImportRunResult> {
    const validRows = rows.filter((_, i) => {
      const rowNum = i + 2;
      return !validation.issues.some(
        (x) => x.rowIndex === rowNum && x.severity === 'error',
      );
    });

    try {
      let inserted = 0;
      let skipped = 0;
      const insertedAdIds: number[] = [];
      await this.prisma.$transaction(async (tx) => {
        for (let i = 0; i < validRows.length; i++) {
          const row = validRows[i]!;
          const data = this.adDataFromRow(row);
          const existing = await tx.paidAdvertisement.findFirst({
            where: { slug: data.slug, deletedAt: null },
          });
          if (existing) {
            skipped++;
            onProgress(i + 1, validRows.length);
            continue;
          }

          const created = await tx.paidAdvertisement.create({ data });
          insertedAdIds.push(created.id);
          inserted++;
          onProgress(i + 1, validRows.length);
        }
      });

      let batchId: number | undefined;
      if (insertedAdIds.length > 0) {
        const batch = await this.lifecycle.recordAdvertisementBatch({
          fileName: meta.fileName,
          jobId: meta.jobId,
          actor: meta.actor,
          totalRows: rows.length,
          inserted: insertedAdIds.length,
          skipped,
          advertisementIds: insertedAdIds,
        });
        batchId = batch?.id;
      }

      return ImportJobService.buildResult({
        success: inserted > 0 || skipped > 0,
        kind: 'advertisements',
        status: 'completed',
        totalRows: rows.length,
        inserted,
        updated: 0,
        skipped,
        rolledBack: false,
        issues: validation.issues,
        batchId,
        message:
          inserted === 0 && skipped > 0
            ? 'All advertisements already exist — use unique titles or delete existing ads in Upload history first.'
            : undefined,
      });
    } catch (err) {
      return ImportJobService.buildResult({
        success: false,
        kind: 'advertisements',
        status: atomic ? 'rolled_back' : 'failed',
        totalRows: rows.length,
        inserted: 0,
        updated: 0,
        skipped: rows.length,
        rolledBack: atomic,
        message: err instanceof Error ? err.message : 'Upload rolled back',
        issues: validation.issues,
      });
    }
  }

  private async executeAdDocuments(
    ads: {
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
    }[],
    validation: ImportValidationResult,
    atomic: boolean,
    onProgress: (p: number, t: number) => void,
    meta: {
      fileName: string;
      actor: ImportActor;
      jobId?: string;
    },
  ): Promise<ImportRunResult> {
    const validAds = ads.filter((_, i) => {
      const rowNum = i + 1;
      return !validation.issues.some(
        (x) => x.rowIndex === rowNum && x.severity === 'error',
      );
    });

    try {
      let inserted = 0;
      let skipped = 0;
      const insertedAdIds: number[] = [];
      await this.prisma.$transaction(async (tx) => {
        for (let i = 0; i < validAds.length; i++) {
          const ad = validAds[i]!;
          const slug = slugify(ad.title);
          const existing = await tx.paidAdvertisement.findFirst({
            where: { slug, deletedAt: null },
          });
          if (existing) {
            skipped++;
            onProgress(i + 1, validAds.length);
            continue;
          }

          const placement = ad.placement ?? 'homepage-top';
          const meta = resolvePlacementMeta(placement);
          const adType = normalizeAdType(ad.adType, placement);

          const created = await tx.paidAdvertisement.create({
            data: {
              title: ad.title,
              slug,
              link: ad.link.trim(),
              imageUrl: ad.imageUrl ?? null,
              placement,
              adType,
              format: ad.format ?? meta?.label ?? null,
              width: ad.width ?? meta?.width ?? null,
              height: ad.height ?? meta?.height ?? null,
              sponsored:
                ad.sponsored ??
                (adType === 'sponsored' || adType === 'affiliate'),
              priority: ad.priority ?? 0,
              advertiser: ad.advertiser ?? null,
              budget: ad.budget ?? null,
              active: ad.active ?? true,
              startsAt: this.parseOptionalDate(ad.startsAt ?? ''),
              endsAt: this.parseOptionalDate(ad.endsAt ?? ''),
            },
          });
          insertedAdIds.push(created.id);
          inserted++;
          onProgress(i + 1, validAds.length);
        }
      });

      let batchId: number | undefined;
      if (insertedAdIds.length > 0) {
        const batch = await this.lifecycle.recordAdvertisementBatch({
          fileName: meta.fileName,
          jobId: meta.jobId,
          actor: meta.actor,
          totalRows: ads.length,
          inserted: insertedAdIds.length,
          skipped,
          advertisementIds: insertedAdIds,
        });
        batchId = batch?.id;
      }

      return ImportJobService.buildResult({
        success: inserted > 0 || skipped > 0,
        kind: 'advertisements',
        status: 'completed',
        totalRows: ads.length,
        inserted,
        updated: 0,
        skipped,
        rolledBack: false,
        issues: validation.issues,
        batchId,
        message:
          inserted === 0 && skipped > 0
            ? 'All advertisements already exist — use unique titles or delete existing ads in Upload history first.'
            : undefined,
      });
    } catch (err) {
      return ImportJobService.buildResult({
        success: false,
        kind: 'advertisements',
        status: atomic ? 'rolled_back' : 'failed',
        totalRows: ads.length,
        inserted: 0,
        updated: 0,
        skipped: ads.length,
        rolledBack: atomic,
        message: err instanceof Error ? err.message : 'Upload rolled back',
        issues: validation.issues,
      });
    }
  }

  private validateImageZip(
    kind: BulkImportKind,
    fileName: string,
    files: { path: string; deviceSlug: string; fileName: string }[],
  ): ImportValidationResult {
    const issues: ImportIssue[] = [];
    if (files.length === 0) {
      issues.push(issue(0, {}, 'ZIP contains no image files'));
    }
    return {
      kind,
      fileName,
      totalRows: files.length,
      validCount: files.length,
      invalidCount: issues.length,
      duplicateCount: 0,
      canImport: files.length > 0,
      issues,
      preview: files.slice(0, 5).map((f) => ({
        deviceSlug: f.deviceSlug,
        fileName: f.fileName,
      })),
    };
  }

  private async executeImageZip(
    files: { path: string; deviceSlug: string; fileName: string }[],
    atomic: boolean,
    onProgress: (p: number, t: number) => void,
  ): Promise<ImportRunResult> {
    try {
      let inserted = 0;
      let skipped = 0;
      await this.prisma.$transaction(async (tx) => {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]!;
          const device = await tx.device.findFirst({
            where: { slug: file.deviceSlug },
          });
          if (!device) {
            skipped++;
            onProgress(i + 1, files.length);
            continue;
          }

          const url = `/uploads/import/${file.deviceSlug}/${file.fileName}`;
          const isLogo =
            file.fileName.toLowerCase().includes('logo') ||
            file.path.toLowerCase().includes('/logos/');

          if (isLogo) {
            const brand = await tx.brand.findFirst({
              where: { devices: { some: { id: device.id } } },
            });
            if (brand) {
              await tx.brand.update({
                where: { id: brand.id },
                data: { logo: url },
              });
            }
          }

          await tx.deviceImage.create({
            data: {
              deviceId: device.id,
              url,
              type: isLogo ? 'logo' : 'gallery',
            },
          });
          inserted++;
          onProgress(i + 1, files.length);
        }
      });

      return ImportJobService.buildResult({
        success: true,
        kind: 'images',
        status: 'completed',
        totalRows: files.length,
        inserted,
        updated: 0,
        skipped,
        rolledBack: false,
        issues: [],
      });
    } catch (err) {
      return ImportJobService.buildResult({
        success: false,
        kind: 'images',
        status: atomic ? 'rolled_back' : 'failed',
        totalRows: files.length,
        inserted: 0,
        updated: 0,
        skipped: files.length,
        rolledBack: atomic,
        message: err instanceof Error ? err.message : 'Upload rolled back',
        issues: [],
      });
    }
  }

  /* ---- Helpers ---- */

  private buildValidation(
    kind: BulkImportKind,
    fileName: string,
    rows: Record<string, unknown>[],
    validCount: number,
    issues: ImportIssue[],
  ): ImportValidationResult {
    const errorCount = issues.filter((x) => x.severity === 'error').length;
    const duplicateCount = issues.filter((x) => x.severity === 'duplicate').length;
    return {
      kind,
      fileName,
      totalRows: rows.length,
      validCount,
      invalidCount: errorCount,
      duplicateCount,
      canImport: validCount > 0 && errorCount === 0,
      issues,
      preview: rows.slice(0, 5),
    };
  }

  private emptyValidation(
    kind: BulkImportKind,
    fileName: string,
    message: string,
  ): ImportValidationResult {
    return {
      kind,
      fileName,
      totalRows: 0,
      validCount: 0,
      invalidCount: 1,
      duplicateCount: 0,
      canImport: false,
      issues: [issue(0, {}, message)],
      preview: [],
    };
  }

  private parsePostStatus(raw: string): PostStatus {
    const value = raw.trim().toUpperCase();
    if (value === 'PUBLISHED') return PostStatus.PUBLISHED;
    if (value === 'REVIEW') return PostStatus.REVIEW;
    return PostStatus.DRAFT;
  }

  private parseUserRole(raw: string): UserRole {
    const value = raw.trim().toUpperCase() as UserRole;
    if (value && Object.values(UserRole).includes(value)) {
      return value;
    }
    return UserRole.USER;
  }

  private parseBool(raw: unknown): boolean {
    if (typeof raw === 'boolean') return raw;
    const s = String(raw ?? '').trim().toLowerCase();
    return s === 'true' || s === '1' || s === 'yes';
  }

  private parseOptionalDate(raw: string): Date | null {
    if (!raw.trim()) return null;
    const d = new Date(raw.trim());
    return Number.isNaN(d.getTime()) ? null : d;
  }
}
