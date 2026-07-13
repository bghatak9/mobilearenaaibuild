import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { ImportExecutor } from './import.executor';
import { ImportJobService } from './import-job.service';
import { ImportLifecycleService } from './import-lifecycle.service';
import type { BulkImportKind, EvUploadSubkind, ImportActor } from './import.types';

/** Facade for bulk upload — validate, run, and job status. */
@Injectable()
export class ImportService {
  constructor(
    private readonly executor: ImportExecutor,
    private readonly jobs: ImportJobService,
    private readonly lifecycle: ImportLifecycleService,
  ) {}

  validate(
    kind: BulkImportKind,
    file: Express.Multer.File,
    role: UserRole,
    options?: { slug?: string; subkind?: EvUploadSubkind },
  ) {
    return this.executor.validate(kind, file, role, options);
  }

  run(
    kind: BulkImportKind,
    file: Express.Multer.File,
    actor: ImportActor,
    options?: {
      atomic?: boolean;
      background?: boolean;
      slug?: string;
      subkind?: EvUploadSubkind;
    },
  ) {
    return this.executor.run(kind, file, actor, options);
  }

  getJob(jobId: string) {
    return this.jobs.getJob(jobId);
  }

  getErrorReportCsv(jobId: string) {
    return this.jobs.getErrorReportCsv(jobId);
  }

  listBatches(options: {
    kind?: string;
    includeDeleted?: boolean;
    limit?: number;
  }) {
    return this.lifecycle.listBatches(options);
  }

  getBatch(id: number) {
    return this.lifecycle.getBatch(id);
  }

  softDeleteBatch(id: number, actor: ImportActor) {
    return this.lifecycle.softDeleteBatch(id, actor);
  }

  restoreBatch(id: number, actor: ImportActor) {
    return this.lifecycle.restoreBatch(id, actor);
  }

  purgeBatch(id: number, actor: ImportActor) {
    return this.lifecycle.purgeBatch(id, actor);
  }

  softDeletePhones(ids: number[], actor: ImportActor) {
    return this.lifecycle.softDeletePhones(ids, actor);
  }

  softDeletePhone(id: number, actor: ImportActor) {
    return this.lifecycle.softDeletePhone(id, actor);
  }

  softDeleteAdvertisements(ids: number[], actor: ImportActor) {
    return this.lifecycle.softDeleteAdvertisements(ids, actor);
  }

  softDeleteAdvertisement(id: number, actor: ImportActor) {
    return this.lifecycle.softDeleteAdvertisement(id, actor);
  }

  restoreAdvertisements(ids: number[], actor: ImportActor) {
    return this.lifecycle.restoreAdvertisements(ids, actor);
  }

  restoreAdvertisement(id: number, actor: ImportActor) {
    return this.lifecycle.restoreAdvertisement(id, actor);
  }

  softDeleteBrands(ids: number[], actor: ImportActor) {
    return this.lifecycle.softDeleteBrands(ids, actor);
  }

  softDeleteBrand(id: number, actor: ImportActor) {
    return this.lifecycle.softDeleteBrand(id, actor);
  }

  restoreBrands(ids: number[], actor: ImportActor) {
    return this.lifecycle.restoreBrands(ids, actor);
  }

  restoreBrand(id: number, actor: ImportActor) {
    return this.lifecycle.restoreBrand(id, actor);
  }

  clearDeletedImportHistory(actor: ImportActor) {
    return this.lifecycle.clearDeletedImportHistory(actor);
  }

  /** Legacy direct import — delegates to run without background. */
  importDevices(file: Express.Multer.File) {
    return this.executor.run(
      'phones',
      file,
      { userId: 0, role: UserRole.ADMIN },
      { background: false },
    );
  }

  importBrands(file: Express.Multer.File) {
    return this.executor.run(
      'brands',
      file,
      { userId: 0, role: UserRole.ADMIN },
      { background: false },
    );
  }

  importPrices(file: Express.Multer.File) {
    return this.executor.run(
      'prices',
      file,
      { userId: 0, role: UserRole.ADMIN },
      { background: false },
    );
  }

  importNews(file: Express.Multer.File) {
    return this.executor.run(
      'news',
      file,
      { userId: 0, role: UserRole.EDITOR },
      { background: false },
    );
  }

  importUsers(file: Express.Multer.File) {
    return this.executor.run(
      'users',
      file,
      { userId: 0, role: UserRole.SUPER_ADMIN },
      { background: false },
    );
  }

  importDeviceImages(file: Express.Multer.File) {
    return this.executor.run(
      'images',
      file,
      { userId: 0, role: UserRole.ADMIN },
      { background: false },
    );
  }

  importArticleImages(
    file: Express.Multer.File,
    actor: { userId: number; role: UserRole },
  ) {
    void file;
    void actor;
    return Promise.resolve({
      success: false,
      message: 'Use POST /import/news or /import/images for bulk uploads',
      totalRows: 0,
      inserted: 0,
      skipped: 0,
      errors: [],
    });
  }
}
