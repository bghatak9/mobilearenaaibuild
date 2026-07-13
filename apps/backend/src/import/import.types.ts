import type { UserRole } from '@prisma/client';

export type BulkImportKind =
  | 'phones'
  | 'upcoming-devices'
  | 'brands'
  | 'news'
  | 'users'
  | 'images'
  | 'prices'
  | 'reviews'
  | 'documentation'
  | 'advertisements'
  | 'ev';

export type ImportJobStatus =
  | 'queued'
  | 'validating'
  | 'running'
  | 'completed'
  | 'failed'
  | 'rolled_back';

export type ImportIssueSeverity = 'error' | 'duplicate' | 'warning';

export type ImportIssue = {
  rowIndex: number;
  row: Record<string, unknown>;
  reason: string;
  severity: ImportIssueSeverity;
};

export type ImportValidationResult = {
  kind: BulkImportKind;
  fileName: string;
  totalRows: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  canImport: boolean;
  issues: ImportIssue[];
  preview: Record<string, unknown>[];
};

export type ImportRunResult = {
  success: boolean;
  kind: BulkImportKind;
  jobId?: string;
  status: ImportJobStatus;
  totalRows: number;
  inserted: number;
  updated: number;
  skipped: number;
  rolledBack: boolean;
  message?: string;
  issues: ImportIssue[];
  batchId?: number;
};

export type ImportJobSnapshot = {
  id: string;
  kind: BulkImportKind;
  status: ImportJobStatus;
  fileName: string;
  progress: number;
  totalRows: number;
  processedRows: number;
  inserted: number;
  updated: number;
  skipped: number;
  rolledBack: boolean;
  message?: string;
  issues: ImportIssue[];
  createdAt: string;
  finishedAt?: string;
};

/** EV bulk upload sub-sections (all under kind `ev`). */
export type EvUploadSubkind = 'vehicles' | 'upcoming' | 'news' | 'reviews';

export type ImportActor = {
  userId: number;
  role: UserRole;
};

/** Rows larger than this run in a background job. */
export const BACKGROUND_ROW_THRESHOLD = 50;
