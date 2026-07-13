"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  History,
  Loader2,
  RotateCcw,
  Trash2,
  ShieldAlert,
  Eraser,
} from "lucide-react";

import {
  bulkDeleteAdvertisements,
  bulkDeleteBrands,
  bulkDeletePhones,
  clearDeletedImportHistory,
  deleteAdvertisement,
  deleteBrand,
  deleteImportBatch,
  deletePhone,
  getImportBatch,
  listImportBatches,
  purgeImportBatch,
  restoreAdvertisement,
  restoreBrand,
  restoreImportBatch,
  type ImportBatchDetail,
  type ImportBatchSummary,
} from "@/lib/api";
import {
  canDeleteAction,
  DELETE_ACTION_LABELS,
  type DeleteAction,
} from "@/lib/content-permissions";
import { STAFF_ROLES, type UserRole } from "@/lib/roles";

export type ImportHistoryKind = "phones" | "advertisements";

type BatchHistoryConfig = {
  kind: string;
  entityLabel: string;
  entityLabelPlural: string;
  deleteOne: DeleteAction;
  deleteSelected: DeleteAction;
  restore: DeleteAction;
  emptyMessage: string;
  purgeConfirm: string;
  allDeletedMessage: string;
  noDeletePermissionMessage: string;
};

const BRANDS_CONFIG: BatchHistoryConfig = {
  kind: "brands",
  entityLabel: "brand",
  entityLabelPlural: "brands",
  deleteOne: "delete_one_brand",
  deleteSelected: "delete_selected_brands",
  restore: "restore_deleted_brands",
  emptyMessage: "No brand uploads recorded yet.",
  purgeConfirm:
    "Permanently erase all brands from this upload? Phones using these brands are deleted too. This cannot be undone.",
  allDeletedMessage: "All brands in this upload are deleted.",
  noDeletePermissionMessage: "Your role cannot delete uploaded brands.",
};

const CONTENT_CONFIG: BatchHistoryConfig = {
  kind: "news",
  entityLabel: "article",
  entityLabelPlural: "articles",
  deleteOne: "delete_one_phone",
  deleteSelected: "delete_selected_phones",
  restore: "restore_deleted_import",
  emptyMessage: "No uploads recorded yet.",
  purgeConfirm:
    "Permanently destroy all records from this upload? This cannot be undone.",
  allDeletedMessage: "All items in this upload are deleted.",
  noDeletePermissionMessage: "Your role cannot delete uploaded content.",
};

const HISTORY_CONFIG: Record<ImportHistoryKind, BatchHistoryConfig> = {
  phones: {
    kind: "phones",
    entityLabel: "phone",
    entityLabelPlural: "phones",
    deleteOne: "delete_one_phone",
    deleteSelected: "delete_selected_phones",
    restore: "restore_deleted_import",
    emptyMessage: "No uploads recorded yet.",
    purgeConfirm:
      "Permanently destroy all phones from this upload? This cannot be undone.",
    allDeletedMessage: "All phones in this upload are deleted.",
    noDeletePermissionMessage: "Your role cannot delete uploaded phones.",
  },
  advertisements: {
    kind: "advertisements",
    entityLabel: "advertisement",
    entityLabelPlural: "advertisements",
    deleteOne: "delete_one_advertisement",
    deleteSelected: "delete_selected_advertisements",
    restore: "restore_deleted_advertisements",
    emptyMessage: "No advertisement uploads recorded yet.",
    purgeConfirm:
      "Permanently destroy all advertisements from this upload? This cannot be undone.",
    allDeletedMessage: "All advertisements in this upload are deleted.",
    noDeletePermissionMessage: "Your role cannot delete uploaded advertisements.",
  },
};

function formatBatchKind(kind: string): string {
  return kind.replace(/-/g, " ");
}

function historyConfigForKind(kind: string): BatchHistoryConfig {
  if (kind === "advertisements") return HISTORY_CONFIG.advertisements;
  if (kind === "brands") return BRANDS_CONFIG;
  if (
    kind === "news" ||
    kind === "documentation" ||
    kind === "reviews"
  ) {
    return CONTENT_CONFIG;
  }
  return HISTORY_CONFIG.phones;
}

function getSelectableIds(detail: ImportBatchDetail): number[] {
  const ids: number[] = [];
  for (const item of detail.items) {
    if (detail.kind === "advertisements") {
      const ad = item.advertisement;
      if (ad && !ad.deletedAt) ids.push(ad.id);
      continue;
    }
    if (detail.kind === "brands") {
      const isDeleted = Boolean(item.brand?.deletedAt ?? item.deletedAt);
      if (!isDeleted) ids.push(item.brand?.id ?? item.entityId);
      continue;
    }
    const device = item.device;
    if (device && !device.deletedAt) ids.push(device.id);
  }
  return ids;
}

export function ImportHistoryPanel({
  role,
  importKind = "phones",
  refreshKey = 0,
}: {
  role: UserRole;
  importKind?: ImportHistoryKind;
  refreshKey?: number;
}) {
  const config = HISTORY_CONFIG[importKind];
  const [batches, setBatches] = useState<ImportBatchSummary[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<ImportBatchDetail | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [includeDeleted, setIncludeDeleted] = useState(true);

  const activeConfig = detail ? historyConfigForKind(detail.kind) : config;

  const canDeleteOne = canDeleteAction(role, activeConfig.deleteOne);
  const canDeleteSelected = canDeleteAction(role, activeConfig.deleteSelected);
  const canDeleteBatch = canDeleteAction(role, "delete_entire_import");
  const canRestore = canDeleteAction(role, activeConfig.restore);
  const canPurge = canDeleteAction(role, "permanently_purge");
  const canClearHistory = canDeleteAction(role, "clear_deleted_import_history");

  const deletedBatchCount = batches.filter(
    (b) =>
      b.deletedAt ||
      b.purgedAt ||
      b.status === "FULLY_DELETED" ||
      b.status === "PARTIALLY_DELETED" ||
      b.status === "PURGED",
  ).length;

  function batchIsRestorable(batch: ImportBatchSummary): boolean {
    if (batch.purgedAt) return false;
    return (
      Boolean(batch.deletedAt) ||
      batch.status === "FULLY_DELETED" ||
      batch.status === "PARTIALLY_DELETED"
    );
  }

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data =
        importKind === "advertisements"
          ? await listImportBatches({ kind: config.kind, includeDeleted })
          : await listImportBatches({ includeDeleted });
      setBatches(
        data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [config.kind, importKind, includeDeleted]);

  useEffect(() => {
    void refresh();
  }, [refresh, refreshKey]);

  async function loadDetail(batchId: number) {
    if (expandedId === batchId) {
      setExpandedId(null);
      setDetail(null);
      setSelected(new Set());
      return;
    }
    setExpandedId(batchId);
    setSelected(new Set());
    try {
      setDetail(await getImportBatch(batchId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load batch");
    }
  }

  async function runAction(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await refresh();
      if (expandedId != null) {
        setDetail(await getImportBatch(expandedId));
      }
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  function toggleSelected(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectableIds = useMemo(
    () => (detail ? getSelectableIds(detail) : []),
    [detail],
  );

  const allSelected =
    selectableIds.length > 0 &&
    selectableIds.every((id) => selected.has(id));

  function toggleSelectAll() {
    if (allSelected) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(selectableIds));
  }

  async function deleteSelected(ids: number[]) {
    if (detail?.kind === "advertisements") {
      return bulkDeleteAdvertisements(ids);
    }
    if (detail?.kind === "brands") {
      return bulkDeleteBrands(ids);
    }
    return bulkDeletePhones(ids);
  }

  async function deleteOne(id: number) {
    if (detail?.kind === "advertisements") {
      return deleteAdvertisement(id);
    }
    if (detail?.kind === "brands") {
      return deleteBrand(id);
    }
    return deletePhone(id);
  }

  async function restoreOne(id: number, batchId: number) {
    if (detail?.kind === "advertisements") {
      return restoreAdvertisement(id, batchId);
    }
    if (detail?.kind === "brands") {
      return restoreBrand(id, batchId);
    }
    if (expandedId == null) {
      throw new Error("No upload batch selected");
    }
    return restoreImportBatch(expandedId);
  }

  const activeItems =
    detail?.items.filter((item) => {
      if (detail.kind === "advertisements") {
        return item.advertisement && !item.advertisement.deletedAt;
      }
      if (detail.kind === "brands") {
        const brand = item.brand;
        return Boolean(brand ? !brand.deletedAt : !item.deletedAt);
      }
      if (
        detail.kind === "news" ||
        detail.kind === "documentation" ||
        item.news
      ) {
        return item.news ? !item.news.deletedAt : !item.deletedAt;
      }
      if (item.device) {
        return !item.device.deletedAt;
      }
      return !item.deletedAt;
    }) ?? [];

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <History className="mt-0.5 text-red-600" size={20} />
          <div>
            <h2 className="font-semibold text-zinc-900">Upload history</h2>
            <p className="text-sm text-gray-500">
              Track every bulk upload — phones, news, EV, documentation,
              reviews, brands, and ads. Single delete, bulk delete, and
              permanent erase (SUPER_ADMIN only).
              {importKind === "advertisements" &&
                " Restore deleted ads is SUPER_ADMIN only."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => setIncludeDeleted(e.target.checked)}
            />
            Show deleted uploads
          </label>
          {canClearHistory && deletedBatchCount > 0 && (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (
                  !window.confirm(
                    `Remove ${deletedBatchCount} deleted/purged upload record(s) from history? Active uploads are kept.`,
                  )
                ) {
                  return;
                }
                void runAction(async () => clearDeletedImportHistory());
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-red-300"
            >
              <Eraser size={14} />
              Clear deleted history
            </button>
          )}
        </div>
      </div>

      {!canDeleteOne && (
        <p className="mt-3 text-sm text-amber-700">
          {activeConfig.noDeletePermissionMessage}
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-gray-500">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </p>
      ) : batches.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">{config.emptyMessage}</p>
      ) : (
        <ul className="mt-4 divide-y divide-gray-100">
          {batches.map((batch) => (
            <li key={batch.id} className="py-3">
              <div className="flex w-full flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => void loadDetail(batch.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="font-medium text-zinc-900">{batch.fileName}</p>
                  <p className="text-xs text-gray-500">
                    {formatBatchKind(batch.kind)} ·{" "}
                    {new Date(batch.createdAt).toLocaleString()} · inserted{" "}
                    {batch.inserted}
                    {batch.skipped > 0 ? ` · synced ${batch.skipped}` : ""} ·{" "}
                    {batch.status.replace(/_/g, " ")}
                    {batch.deletedAt ? " · deleted" : ""}
                    {batch.purgedAt ? " · purged" : ""}
                  </p>
                </button>
                <div className="flex shrink-0 items-center gap-2">
                  {canRestore && batchIsRestorable(batch) && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void runAction(() => restoreImportBatch(batch.id))
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
                    >
                      <RotateCcw size={12} />
                      Restore
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void loadDetail(batch.id)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    {expandedId === batch.id ? "Hide" : "Details"}
                  </button>
                </div>
              </div>

              {expandedId === batch.id && detail && (
                <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <div className="flex flex-wrap gap-2">
                    {canDeleteSelected && selected.size > 0 && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void runAction(() => deleteSelected([...selected]))
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm text-rose-700"
                      >
                        <Trash2 size={14} />
                        Delete selected ({selected.size})
                      </button>
                    )}
                    {canDeleteBatch && !batch.deletedAt && !batch.purgedAt && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void runAction(() => deleteImportBatch(batch.id))
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-sm text-amber-800"
                      >
                        <Trash2 size={14} />
                        Delete entire upload
                      </button>
                    )}
                    {canRestore && batchIsRestorable(batch) && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void runAction(() => restoreImportBatch(batch.id))
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-sm text-emerald-800"
                      >
                        <RotateCcw size={14} />
                        Restore upload
                      </button>
                    )}
                    {canPurge && !batch.purgedAt && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          const batchConfig = historyConfigForKind(detail.kind);
                          if (!window.confirm(batchConfig.purgeConfirm)) {
                            return;
                          }
                          void runAction(() => purgeImportBatch(batch.id));
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-800"
                      >
                        <ShieldAlert size={14} />
                        Permanently purge
                      </button>
                    )}
                  </div>

                  {canDeleteOne && selectableIds.length > 0 && !batch.purgedAt && (
                    <label className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        disabled={busy}
                      />
                      Select all ({selectableIds.length})
                    </label>
                  )}

                  <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto text-sm">
                    {detail.items.map((item) => {
                      if (detail.kind === "advertisements") {
                        const ad = item.advertisement;
                        if (!ad) return null;
                        const isDeleted = Boolean(ad.deletedAt);
                        return (
                          <li
                            key={item.id}
                            className="flex items-center gap-2 rounded px-2 py-1 hover:bg-white"
                          >
                            {canDeleteOne && !isDeleted && !batch.purgedAt && (
                              <input
                                type="checkbox"
                                checked={selected.has(ad.id)}
                                onChange={() => toggleSelected(ad.id)}
                              />
                            )}
                            <span
                              className={
                                isDeleted ? "text-gray-400 line-through" : ""
                              }
                            >
                              {ad.title}
                              <span className="ml-2 text-xs text-gray-400">
                                {ad.placement}
                              </span>
                            </span>
                            {canDeleteOne && !isDeleted && !batch.purgedAt && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  void runAction(() => deleteOne(ad.id))
                                }
                                className="ml-auto text-xs text-rose-600 hover:underline"
                              >
                                Delete
                              </button>
                            )}
                            {canRestore && isDeleted && !batch.purgedAt && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  void runAction(() => restoreOne(ad.id, batch.id))
                                }
                                className="ml-auto text-xs text-emerald-700 hover:underline"
                              >
                                Restore
                              </button>
                            )}
                          </li>
                        );
                      }

                      if (detail.kind === "brands") {
                        const brand = item.brand;
                        const brandId = brand?.id ?? item.entityId;
                        const brandName =
                          brand?.name ?? item.entityName ?? `Brand #${item.entityId}`;
                        const brandSlug = brand?.slug ?? item.entitySlug ?? "";
                        const isDeleted = Boolean(
                          brand?.deletedAt ?? item.deletedAt,
                        );
                        return (
                          <li
                            key={item.id}
                            className="flex items-center gap-2 rounded px-2 py-1 hover:bg-white"
                          >
                            {canDeleteOne && !isDeleted && !batch.purgedAt && (
                              <input
                                type="checkbox"
                                checked={selected.has(brandId)}
                                onChange={() => toggleSelected(brandId)}
                              />
                            )}
                            <span
                              className={
                                isDeleted ? "text-gray-400 line-through" : ""
                              }
                            >
                              {brandName}
                              {brandSlug ? (
                                <span className="ml-2 text-xs text-gray-400">
                                  {brandSlug}
                                </span>
                              ) : null}
                            </span>
                            {canDeleteOne && !isDeleted && !batch.purgedAt && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  void runAction(() => deleteOne(brandId))
                                }
                                className="ml-auto text-xs text-rose-600 hover:underline"
                              >
                                Delete
                              </button>
                            )}
                            {canRestore && isDeleted && !batch.purgedAt && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  void runAction(() => restoreOne(brandId, batch.id))
                                }
                                className="ml-auto text-xs text-emerald-700 hover:underline"
                              >
                                Restore
                              </button>
                            )}
                          </li>
                        );
                      }

                      if (
                        detail.kind === "news" ||
                        detail.kind === "documentation" ||
                        item.news ||
                        item.entityType === "news"
                      ) {
                        const article = item.news;
                        const title =
                          article?.title ??
                          item.entityName ??
                          `Article #${item.entityId}`;
                        const slug = article?.slug ?? item.entitySlug ?? "";
                        const isDeleted = Boolean(
                          article?.deletedAt ?? item.deletedAt,
                        );
                        return (
                          <li
                            key={item.id}
                            className="flex items-center gap-2 rounded px-2 py-1 hover:bg-white"
                          >
                            <span
                              className={
                                isDeleted ? "text-gray-400 line-through" : ""
                              }
                            >
                              {title}
                              {slug ? (
                                <span className="ml-2 text-xs text-gray-400">
                                  {slug}
                                </span>
                              ) : null}
                            </span>
                          </li>
                        );
                      }

                      const device = item.device;
                      if (device) {
                        const isDeleted = Boolean(device.deletedAt);
                        return (
                          <li
                            key={item.id}
                            className="flex items-center gap-2 rounded px-2 py-1 hover:bg-white"
                          >
                            {canDeleteOne && !isDeleted && !batch.purgedAt && (
                              <input
                                type="checkbox"
                                checked={selected.has(device.id)}
                                onChange={() => toggleSelected(device.id)}
                              />
                            )}
                            <span
                              className={
                                isDeleted ? "text-gray-400 line-through" : ""
                              }
                            >
                              {device.name}
                              <span className="ml-2 text-xs text-gray-400">
                                {device.brand.name}
                              </span>
                            </span>
                            {canDeleteOne && !isDeleted && !batch.purgedAt && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  void runAction(() => deleteOne(device.id))
                                }
                                className="ml-auto text-xs text-rose-600 hover:underline"
                              >
                                Delete
                              </button>
                            )}
                          </li>
                        );
                      }

                      const label =
                        item.entityName ??
                        `${item.entityType.replace(/_/g, " ")} #${item.entityId}`;
                      const slug = item.entitySlug ?? "";
                      const isDeleted = Boolean(item.deletedAt);
                      return (
                        <li
                          key={item.id}
                          className="flex items-center gap-2 rounded px-2 py-1 hover:bg-white"
                        >
                          <span
                            className={
                              isDeleted ? "text-gray-400 line-through" : ""
                            }
                          >
                            {label}
                            {slug ? (
                              <span className="ml-2 text-xs text-gray-400">
                                {slug}
                              </span>
                            ) : null}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {activeItems.length === 0 && !batch.purgedAt && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                      <AlertTriangle size={12} />
                      {historyConfigForKind(detail.kind).allDeletedMessage}
                    </p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function DeletePermissionsNote({
  importKind = "phones",
}: {
  importKind?: ImportHistoryKind;
}) {
  const staffRoles = STAFF_ROLES;
  const matrixActions: DeleteAction[] =
    importKind === "advertisements"
      ? [
          "delete_one_advertisement",
          "delete_selected_advertisements",
          "delete_entire_import",
          "restore_deleted_advertisements",
          "permanently_purge",
        ]
      : [
          "delete_one_phone",
          "delete_selected_phones",
          "delete_one_brand",
          "delete_selected_brands",
          "delete_entire_import",
          "restore_deleted_import",
          "restore_deleted_brands",
          "permanently_purge",
        ];

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white text-sm">
      <table className="min-w-full">
        <thead className="border-b bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Action</th>
            {staffRoles.map((role) => (
              <th key={role} className="px-4 py-3 text-center">
                {role.replace("_", " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {matrixActions.map((action) => (
            <tr key={action}>
              <td className="px-4 py-3 text-zinc-900">
                {DELETE_ACTION_LABELS[action]}
              </td>
              {staffRoles.map((role) => (
                <td key={role} className="px-4 py-3 text-center">
                  {canDeleteAction(role, action) ? (
                    <span className="text-emerald-600">✓</span>
                  ) : action === "permanently_purge" && role === "ADMIN" ? (
                    <span className="text-gray-400">—</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
