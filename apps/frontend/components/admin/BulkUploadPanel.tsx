"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  ImageIcon,
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
  canUploadImages,
  canUploadPdf,
  EV_UPLOAD_SUBKINDS,
  evSubkindSupportsImages,
  getUploadMeta,
  IMPORT_KIND_HINTS,
  IMPORT_SAMPLE_FILES,
  IMPORT_STRATEGY,
  PDF_PHONES_POLICY,
  supportsImageUpload,
  type BulkImportKind,
  type EvUploadSubkind,
  type UploadMode,
} from "@/lib/content-permissions";
import type { UserRole } from "@/lib/roles";

const IMAGE_BULK_ACCEPT = ".zip";
const IMAGE_SINGLE_ACCEPT = ".jpg,.jpeg,.png,.webp,.gif";

function slugLabelForKind(kind: BulkImportKind): string {
  switch (kind) {
    case "news":
    case "documentation":
      return "Article / doc slug";
    case "ev":
      return "Vehicle slug";
    default:
      return "Device slug";
  }
}

export function BulkUploadPanel({
  kind,
  role,
  onUploadSuccess,
}: {
  kind: BulkImportKind;
  role: UserRole;
  onUploadSuccess?: () => void;
}) {
  const meta = getUploadMeta(kind);
  const strategy = IMPORT_STRATEGY[kind];
  const isEv = kind === "ev";
  const [evSubkind, setEvSubkind] = useState<EvUploadSubkind>("vehicles");
  const evImageOk = isEv && evSubkindSupportsImages(evSubkind);
  const pdfAllowed = isEv
    ? canUploadPdf(role, kind, { subkind: evSubkind })
    : canUploadPdf(role, kind);
  const imageAllowed = canUploadImages(role, kind);
  const hasImageUpload =
    supportsImageUpload(kind) && (!isEv || evImageOk);
  const isPhoneSpecKind = kind === "phones" || kind === "upcoming-devices";

  const [uploadMode, setUploadMode] = useState<UploadMode>("data");
  const [entitySlug, setEntitySlug] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<ImportValidationResult | null>(
    null,
  );
  const [job, setJob] = useState<ImportJobSnapshot | null>(null);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const uploadNotifiedRef = useRef(false);

  const accept = useMemo(() => {
    if (isEv) {
      if (uploadMode === "images-bulk") return IMAGE_BULK_ACCEPT;
      if (uploadMode === "images-single") return IMAGE_SINGLE_ACCEPT;
      if (evSubkind === "news") return ".csv,.xlsx,.xls,.pdf,.zip";
      if (evSubkind === "reviews") return ".csv,.xlsx,.xls,.pdf";
      return ".csv,.xlsx,.xls";
    }
    if (!hasImageUpload || uploadMode === "data") {
      if (isPhoneSpecKind) return ".csv,.xlsx,.xls";
      return meta.accept;
    }
    if (uploadMode === "images-bulk") return IMAGE_BULK_ACCEPT;
    return IMAGE_SINGLE_ACCEPT;
  }, [
    isEv,
    evSubkind,
    hasImageUpload,
    uploadMode,
    isPhoneSpecKind,
    meta.accept,
  ]);

  const uploadOptions = useMemo(() => {
    const opts: {
      slug?: string;
      subkind?: EvUploadSubkind;
    } = {};
    if (isEv) opts.subkind = evSubkind;
    if (uploadMode === "images-single" && entitySlug.trim()) {
      opts.slug = entitySlug.trim();
    }
    return Object.keys(opts).length > 0 ? opts : undefined;
  }, [isEv, evSubkind, uploadMode, entitySlug]);

  useEffect(() => {
    setFile(null);
    setValidation(null);
    setJob(null);
    setError(null);
    setEntitySlug("");
    setUploadMode("data");
    setEvSubkind("vehicles");
  }, [kind]);

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

  useEffect(() => {
    uploadNotifiedRef.current = false;
  }, [file, kind, uploadMode, evSubkind]);

  useEffect(() => {
    if (!job || job.rolledBack || job.status !== "completed") return;
    if (uploadNotifiedRef.current) return;
    uploadNotifiedRef.current = true;
    onUploadSuccess?.();
  }, [job, onUploadSuccess]);

  async function handleValidate() {
    if (!file) return;
    if (uploadMode === "images-single" && !entitySlug.trim()) {
      setError(`Enter ${slugLabelForKind(kind).toLowerCase()} for single image upload.`);
      return;
    }
    setValidating(true);
    setError(null);
    setValidation(null);
    setJob(null);
    try {
      const result = await validateImportFile(kind, file, uploadOptions);
      setValidation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Validation failed");
    } finally {
      setValidating(false);
    }
  }

  async function handleImport() {
    if (!file) return;
    if (uploadMode === "images-single" && !entitySlug.trim()) {
      setError(`Enter ${slugLabelForKind(kind).toLowerCase()} for single image upload.`);
      return;
    }
    setImporting(true);
    setError(null);
    try {
      const result = await runImportFile(kind, file, {
        atomic: true,
        background: uploadMode === "data",
        ...uploadOptions,
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
  const isImageUpload =
    uploadMode === "images-bulk" || uploadMode === "images-single";

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        {isImageUpload ? (
          <ImageIcon className="mt-0.5 text-red-600" size={20} />
        ) : (
          <FileSpreadsheet className="mt-0.5 text-red-600" size={20} />
        )}
        <div>
          <h2 className="font-semibold text-zinc-900">{meta.label}</h2>
          <p className="text-sm text-gray-500">
            {meta.fileTypes} — {meta.example}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {isEv
              ? EV_UPLOAD_SUBKINDS.find((s) => s.id === evSubkind)?.hint
              : IMPORT_KIND_HINTS[kind]}
          </p>
          {strategy.pdf && !pdfAllowed && uploadMode === "data" && (
            <p className="mt-2 text-xs text-amber-700">
              PDF uploads for {meta.label.toLowerCase()} require{" "}
              {kind === "advertisements"
                ? "SUPER_ADMIN or ADMIN"
                : "SUPER_ADMIN, ADMIN, or EDITOR"}
              . Use CSV/XLSX instead.
            </p>
          )}
          {hasImageUpload && !imageAllowed && (
            <p className="mt-2 text-xs text-amber-700">
              Your role cannot upload images for {meta.label.toLowerCase()}.
              Structured data upload may still be available.
            </p>
          )}
          {(IMPORT_SAMPLE_FILES[kind]?.length ?? 0) > 0 && uploadMode === "data" && (
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
              {kind === "prices" || kind === "reviews" ? (
                <span> — upload phones first so device names exist</span>
              ) : null}
            </p>
          )}
          {hasImageUpload && isImageUpload && (
            <p className="mt-2 text-xs text-gray-500">
              Upload records first so slugs exist. ZIP: one folder per slug.
              Single image: enter slug below.
              {(IMPORT_SAMPLE_FILES[kind] ?? []).some((s) =>
                s.href.includes("images-sample"),
              ) && (
                <>
                  {" "}
                  <a
                    href="/samples/images-sample.zip"
                    download
                    className="font-medium text-red-600 hover:underline"
                  >
                    Sample image ZIP
                  </a>
                </>
              )}
            </p>
          )}
          {isPhoneSpecKind && uploadMode === "data" && !file && (
            <p className="mt-2 text-xs text-gray-500">
              Upload CSV or XLSX only — PDF is not supported for phone specs.
            </p>
          )}
          {isPhoneSpecKind && uploadMode === "data" && file && isPdf && (
            <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {PDF_PHONES_POLICY.note} Choose a .csv or .xlsx file instead.
            </p>
          )}
          {isPhoneSpecKind && uploadMode === "data" && file && isSpreadsheet && (
            <p className="mt-2 text-xs text-emerald-700">
              Format OK — {fileExt.toUpperCase()} is supported for{" "}
              {kind === "upcoming-devices" ? "upcoming device" : "phone"}{" "}
              uploads.
            </p>
          )}
        </div>
      </div>

      {isEv && (
        <div className="mt-4 flex flex-wrap gap-2">
          {EV_UPLOAD_SUBKINDS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => {
                setEvSubkind(section.id);
                setFile(null);
                setValidation(null);
                setJob(null);
                setError(null);
                setUploadMode("data");
              }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                evSubkind === section.id
                  ? "bg-emerald-600 text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:border-emerald-300"
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      )}

      {hasImageUpload && imageAllowed && (
        <div className="mt-4 flex flex-wrap gap-2">
          {(
            [
              ["data", "Structured data"],
              ["images-bulk", "Bulk images (ZIP)"],
              ["images-single", "Single image"],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setUploadMode(mode);
                setFile(null);
                setValidation(null);
                setJob(null);
                setError(null);
              }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                uploadMode === mode
                  ? "bg-red-600 text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:border-red-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {uploadMode === "images-single" && hasImageUpload && imageAllowed && (
        <label className="mt-4 block">
          <span className="text-sm font-medium text-gray-700">
            {slugLabelForKind(kind)}
          </span>
          <input
            type="text"
            value={entitySlug}
            onChange={(e) => setEntitySlug(e.target.value)}
            placeholder={
              kind === "ev" ? "tesla-model-3" : "volt-phone"
            }
            className="mt-1 block w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
      )}

      <input
        type="file"
        accept={accept}
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
          disabled={
            !file ||
            validating ||
            (isImageUpload && !imageAllowed) ||
            (uploadMode === "images-single" && !entitySlug.trim())
          }
          onClick={() => void handleValidate()}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-red-300 disabled:opacity-60"
        >
          {validating ? "Validating…" : "1. Validate"}
        </button>
        <button
          type="button"
          disabled={
            !file ||
            !validation?.canImport ||
            importing ||
            isRunning ||
            (isImageUpload && !imageAllowed)
          }
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
            uploadMode === "data" &&
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
              {isImageUpload && job.skipped > 0 && job.inserted === 0 && (
                <p className="mt-2 flex items-start gap-1 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  Images were skipped — upload the matching records first so
                  slugs exist, then retry.
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
