"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
} from "lucide-react";

import {
  downloadImportErrorReport,
  getImportJob,
  runImportFile,
  validateImportFile,
  type ImportJobSnapshot,
  type ImportValidationResult,
} from "@/lib/api";
import {
  canUploadPdf,
  getUploadMeta,
  IMPORT_KIND_HINTS,
  IMPORT_SAMPLE_FILES,
  IMPORT_STRATEGY,
  PDF_PHONES_POLICY,
  type BulkImportKind,
} from "@/lib/content-permissions";
import type { UserRole } from "@/lib/roles";

export function BulkUploadPanel({
  kind,
  role,
}: {
  kind: BulkImportKind;
  role: UserRole;
}) {
  const meta = getUploadMeta(kind);
  const strategy = IMPORT_STRATEGY[kind];
  const pdfAllowed = canUploadPdf(role, kind);
  const isPhoneSpecKind = kind === "phones" || kind === "upcoming-devices";
  const [file, setFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<ImportValidationResult | null>(
    null,
  );
  const [job, setJob] = useState<ImportJobSnapshot | null>(null);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollJob = useCallback(async (jobId: string) => {
    const snapshot = await getImportJob(jobId);
    setJob(snapshot);
    return snapshot;
  }, []);

  useEffect(() => {
    if (!job?.id) return;
    if (
      job.status === "completed" ||
      job.status === "failed" ||
      job.status === "rolled_back"
    ) {
      return;
    }
    const timer = setInterval(() => {
      void pollJob(job.id).catch(() => undefined);
    }, 1500);
    return () => clearInterval(timer);
  }, [job?.id, job?.status, pollJob]);

  async function handleValidate() {
    if (!file) return;
    setValidating(true);
    setError(null);
    setValidation(null);
    setJob(null);
    try {
      const result = await validateImportFile(kind, file);
      setValidation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Validation failed");
    } finally {
      setValidating(false);
    }
  }

  async function handleImport() {
    if (!file) return;
    setImporting(true);
    setError(null);
    try {
      const result = await runImportFile(kind, file, {
        atomic: true,
        background: true,
      });
      if (result.jobId) {
        setJob(await getImportJob(result.jobId));
      } else {
        setJob({
          id: "sync",
          kind,
          status: result.status,
          fileName: file.name,
          progress: 100,
          totalRows: result.totalRows,
          processedRows: result.totalRows,
          inserted: result.inserted,
          updated: result.updated,
          skipped: result.skipped,
          rolledBack: result.rolledBack,
          message: result.message,
          issues: result.issues,
          createdAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setImporting(false);
    }
  }

  async function handleDownloadErrors() {
    if (!job?.id || job.id === "sync") {
      if (!validation?.issues.length) return;
      const header = "row_index,severity,reason\n";
      const body = validation.issues
        .map(
          (i) =>
            `${i.rowIndex},${i.severity},"${i.reason.replace(/"/g, '""')}"`,
        )
        .join("\n");
      const blob = new Blob([header + body], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${kind}-validation-errors.csv`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    const blob = await downloadImportErrorReport(job.id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${kind}-upload-errors.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const isRunning =
    job?.status === "queued" ||
    job?.status === "running" ||
    job?.status === "validating";

  const fileExt = file?.name.includes(".")
    ? file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase()
    : "";
  const isSpreadsheet = ["csv", "xlsx", "xls"].includes(fileExt);
  const isPdf = fileExt === "pdf";

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <FileSpreadsheet className="mt-0.5 text-red-600" size={20} />
        <div>
          <h2 className="font-semibold text-zinc-900">{meta.label}</h2>
          <p className="text-sm text-gray-500">
            {meta.fileTypes} — {meta.example}
          </p>
          <p className="mt-1 text-xs text-gray-400">{IMPORT_KIND_HINTS[kind]}</p>
          {strategy.pdf && !pdfAllowed && (
            <p className="mt-2 text-xs text-amber-700">
              PDF uploads for {meta.label.toLowerCase()} require{" "}
              {kind === "advertisements"
                ? "SUPER_ADMIN or ADMIN"
                : "SUPER_ADMIN, ADMIN, or EDITOR"}
              . Use CSV/XLSX instead.
            </p>
          )}
          {(IMPORT_SAMPLE_FILES[kind]?.length ?? 0) > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              {(IMPORT_SAMPLE_FILES[kind] ?? []).map((sample, index) => (
                <span key={sample.href}>
                  {index > 0 ? " · " : "Download: "}
                  <a
                    href={sample.href}
                    download
                    className="font-medium text-red-600 hover:underline"
                  >
                    {sample.label}
                  </a>
                </span>
              ))}
              {kind === "images" && (
                <span>
                  {" "}
                  — upload phones first so device slug folders match
                </span>
              )}
              {kind === "prices" || kind === "reviews" ? (
                <span> — upload phones first so device names exist</span>
              ) : null}
            </p>
          )}
          {isPhoneSpecKind && !file && (
            <p className="mt-2 text-xs text-gray-500">
              Upload CSV or XLSX only — PDF is not supported for phone specs.
            </p>
          )}
          {isPhoneSpecKind && file && isPdf && (
            <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {PDF_PHONES_POLICY.note} Choose a .csv or .xlsx file instead.
            </p>
          )}
          {isPhoneSpecKind && file && isSpreadsheet && (
            <p className="mt-2 text-xs text-emerald-700">
              Format OK — {fileExt.toUpperCase()} is supported for{" "}
              {kind === "upcoming-devices" ? "upcoming device" : "phone"}{" "}
              uploads.
            </p>
          )}
        </div>
      </div>

      <input
        type="file"
        accept={meta.accept}
        onChange={(e) => {
          setFile(e.target.files?.[0] ?? null);
          setValidation(null);
          setJob(null);
          setError(null);
        }}
        className="mt-4 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!file || validating}
          onClick={() => void handleValidate()}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-red-300 disabled:opacity-60"
        >
          {validating ? "Validating…" : "1. Validate"}
        </button>
        <button
          type="button"
          disabled={!file || !validation?.canImport || importing || isRunning}
          onClick={() => void handleImport()}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
        >
          <Upload size={16} />
          {importing || isRunning ? "Uploading…" : "2. Upload"}
        </button>
        {(validation?.issues.length ?? 0) > 0 || (job?.issues.length ?? 0) > 0 ? (
          <button
            type="button"
            onClick={() => void handleDownloadErrors()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
          >
            <Download size={16} />
            Error report
          </button>
        ) : null}
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {error}
        </p>
      )}

      {validation && (
        <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm">
          <p className="font-medium text-zinc-900">Validation summary</p>
          <ul className="mt-2 grid gap-1 text-gray-600 sm:grid-cols-2">
            <li>Total rows: {validation.totalRows}</li>
            <li className="text-emerald-700">Valid: {validation.validCount}</li>
            {validation.duplicateCount > 0 && (
              <li className="text-amber-700">
                Duplicates: {validation.duplicateCount}
              </li>
            )}
            <li className="text-rose-700">Errors: {validation.invalidCount}</li>
          </ul>
          {validation.canImport ? (
            <p className="mt-2 flex items-center gap-1 text-emerald-700">
              <CheckCircle2 size={16} /> Ready to upload
            </p>
          ) : (
            <p className="mt-2 flex items-center gap-1 text-amber-700">
              <AlertTriangle size={16} /> Fix errors before uploading
            </p>
          )}
          {validation.issues.length > 0 && (
            <ul className="mt-3 max-h-48 overflow-y-auto text-xs text-gray-500">
              {validation.issues.slice(0, 8).map((issue, idx) => (
                <li key={idx} className="break-words">
                  Row {issue.rowIndex}: {issue.reason}
                </li>
              ))}
              {validation.issues.length > 8 && (
                <li>…and {validation.issues.length - 8} more</li>
              )}
            </ul>
          )}
          {kind === "phones" &&
            validation.validCount === 0 &&
            validation.totalRows > 0 && (
              <p className="mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                Phones CSV needs columns{" "}
                <strong>name, brand, category</strong> on the first header row.
                Download <strong>Sample CSV</strong> above — not Brands or
                Prices. Save as .csv or .xlsx, then validate again.
              </p>
            )}
        </div>
      )}

      {job && (
        <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-zinc-900">
              Upload {job.status.replace(/_/g, " ")}
            </p>
            {isRunning && (
              <Loader2 size={16} className="animate-spin text-red-600" />
            )}
          </div>
          {isRunning && (
            <div className="mt-2">
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-red-600 transition-all"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {job.processedRows} / {job.totalRows} rows ({job.progress}%)
              </p>
            </div>
          )}
          {!isRunning && (
            <>
              <p className="mt-2 text-gray-600">
                {kind === "brands" ? (
                  <>
                    Inserted {job.inserted}, updated {job.updated}
                    {job.skipped > 0
                      ? `, already in catalog ${job.skipped}`
                      : ""}
                  </>
                ) : (
                  <>
                    Inserted {job.inserted}, updated {job.updated}, skipped{" "}
                    {job.skipped}
                  </>
                )}
                {job.rolledBack ? " — rolled back" : ""}.
                {job.message ? ` ${job.message}` : ""}
              </p>
              {isPhoneSpecKind && job.inserted === 0 && job.skipped > 0 && (
                <p className="mt-2 flex items-start gap-1 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  All rows were skipped because those device names already exist.
                  Use unique names (e.g. add a date suffix) or delete them under{" "}
                  <strong>Upload history</strong> first, then upload again.
                </p>
              )}
              {kind === "advertisements" && job.inserted === 0 && job.skipped > 0 && (
                <p className="mt-2 flex items-start gap-1 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  All rows were skipped because those ad titles already exist.
                  Use unique titles or delete them under{" "}
                  <strong>Upload history</strong> first, then upload again.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
