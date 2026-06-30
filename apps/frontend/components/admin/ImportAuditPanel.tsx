"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardList, Eraser, Loader2 } from "lucide-react";

import { clearImportAuditLogs, getAuditLogs, type AuditLogEntry } from "@/lib/api";
import { canDeleteAction } from "@/lib/content-permissions";
import type { UserRole } from "@/lib/roles";

export function ImportAuditPanel({ role }: { role: UserRole }) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const canClear = canDeleteAction(role, "clear_audit_log_history");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setLogs(await getAuditLogs(100));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleClear() {
    if (
      !window.confirm(
        "Clear all upload-related audit log entries? This cannot be undone.",
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const { cleared } = await clearImportAuditLogs();
      await refresh();
      setNotice(
        cleared > 0
          ? `Cleared ${cleared} audit ${cleared === 1 ? "entry" : "entries"}.`
          : "Audit log is already empty.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear audit log");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <ClipboardList className="mt-0.5 text-red-600" size={20} />
          <div>
            <h2 className="font-semibold text-zinc-900">Upload audit log</h2>
            <p className="text-sm text-gray-500">
              Trail for uploads, deletes, restores, purges, and history clears
              (SUPER_ADMIN only).
            </p>
          </div>
        </div>
        {canClear && logs.length > 0 && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleClear()}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-red-300 disabled:opacity-60"
          >
            <Eraser size={14} />
            Clear audit log
          </button>
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {error}
        </p>
      )}

      {notice && (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {notice}
        </p>
      )}

      {loading ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-gray-500">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </p>
      ) : logs.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">No upload-related audit entries yet.</p>
      ) : (
        <ul className="mt-4 max-h-80 divide-y divide-gray-100 overflow-y-auto text-sm">
          {logs.map((log) => (
            <li key={log.id} className="py-2">
              <p className="font-medium text-zinc-900">
                {log.action.replace(/\./g, " · ")}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(log.createdAt).toLocaleString()} · {log.user.email} (
                {log.user.role}) · {log.entity}
                {log.entityId ? ` #${log.entityId}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
