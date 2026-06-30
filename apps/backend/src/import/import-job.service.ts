import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

import type {
  BulkImportKind,
  ImportActor,
  ImportIssue,
  ImportJobSnapshot,
  ImportJobStatus,
  ImportRunResult,
} from './import.types';

type JobRecord = ImportJobSnapshot & {
  fileBuffer: Buffer;
  actor: ImportActor;
  runFn: (
    onProgress: (processed: number, total: number) => void,
    jobId: string,
  ) => Promise<Omit<ImportRunResult, 'jobId' | 'kind'>>;
};

@Injectable()
export class ImportJobService {
  private readonly jobs = new Map<string, JobRecord>();

  createJob(input: {
    kind: BulkImportKind;
    fileName: string;
    fileBuffer: Buffer;
    actor: ImportActor;
    totalRows: number;
    runFn: JobRecord['runFn'];
  }): string {
    const id = randomUUID();
    const job: JobRecord = {
      id,
      kind: input.kind,
      status: 'queued',
      fileName: input.fileName,
      progress: 0,
      totalRows: input.totalRows,
      processedRows: 0,
      inserted: 0,
      updated: 0,
      skipped: 0,
      rolledBack: false,
      issues: [],
      createdAt: new Date().toISOString(),
      fileBuffer: input.fileBuffer,
      actor: input.actor,
      runFn: input.runFn,
    };
    this.jobs.set(id, job);
    setImmediate(() => void this.processJob(id));
    return id;
  }

  getJob(id: string): ImportJobSnapshot {
    const job = this.jobs.get(id);
    if (!job) throw new NotFoundException('Upload job not found');
    const { fileBuffer: _b, runFn: _r, actor: _a, ...snapshot } = job;
    return snapshot;
  }

  getErrorReportCsv(id: string): string {
    const job = this.jobs.get(id);
    if (!job) throw new NotFoundException('Upload job not found');

    const header = 'row_index,severity,reason,row_json\n';
    const lines = job.issues.map((issue) =>
      [
        issue.rowIndex,
        issue.severity,
        `"${issue.reason.replace(/"/g, '""')}"`,
        `"${JSON.stringify(issue.row).replace(/"/g, '""')}"`,
      ].join(','),
    );
    return header + lines.join('\n');
  }

  private async processJob(id: string) {
    const job = this.jobs.get(id);
    if (!job) return;

    job.status = 'running';
    try {
      const result = await job.runFn((processed, total) => {
        job.processedRows = processed;
        job.totalRows = total;
        job.progress = total > 0 ? Math.round((processed / total) * 100) : 0;
      }, job.id);

      job.status = result.success ? 'completed' : result.rolledBack ? 'rolled_back' : 'failed';
      job.inserted = result.inserted;
      job.updated = result.updated;
      job.skipped = result.skipped;
      job.rolledBack = result.rolledBack;
      job.issues = result.issues;
      job.message = result.message;
      job.progress = 100;
      job.finishedAt = new Date().toISOString();
    } catch (err) {
      job.status = 'failed';
      job.message = err instanceof Error ? err.message : 'Upload failed';
      job.finishedAt = new Date().toISOString();
    }
  }

  /** Merge issues into a run result shape. */
  static buildResult(
    partial: Omit<ImportRunResult, 'issues'> & { issues?: ImportIssue[] },
  ): ImportRunResult {
    return {
      ...partial,
      issues: partial.issues ?? [],
    };
  }
}
