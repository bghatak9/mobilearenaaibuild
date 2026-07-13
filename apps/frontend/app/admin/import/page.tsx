"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { RoleGate } from "@/components/admin/RoleGate";
import { BulkUploadPanel } from "@/components/admin/BulkUploadPanel";
import { ImportAuditPanel } from "@/components/admin/ImportAuditPanel";
import {
  DeletePermissionsNote,
  ImportHistoryPanel,
} from "@/components/admin/ImportHistoryPanel";
import { useAdminAuth } from "@/lib/admin-auth";
import {
  BULK_UPLOAD_CATALOG,
  getBulkImportKindsForRole,
  IMPORT_HISTORY_ROLES,
  type BulkImportKind,
} from "@/lib/content-permissions";
import { roleLabel } from "@/lib/roles";

const STAFF_WITH_IMPORT = [
  "SUPER_ADMIN",
  "ADMIN",
  "EDITOR",
  "AUTHOR",
  "MODERATOR",
] as const;

function AdminImportContent() {
  const { user } = useAdminAuth();
  const [selected, setSelected] = useState<BulkImportKind | "">("");
  const [tab, setTab] = useState<"upload" | "history" | "audit">("upload");
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const allowedKinds = useMemo(
    () => (user ? getBulkImportKindsForRole(user.role) : []),
    [user],
  );

  const canViewHistory = user
    ? IMPORT_HISTORY_ROLES.includes(user.role)
    : false;

  const visibleCatalog = BULK_UPLOAD_CATALOG.filter((item) =>
    allowedKinds.includes(item.kind),
  );

  useEffect(() => {
    if (selected && !allowedKinds.includes(selected)) {
      setSelected("");
    }
  }, [allowedKinds, selected]);

  return (
    <RoleGate allowed={[...STAFF_WITH_IMPORT]}>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-zinc-900">Bulk Upload</h1>
        <p className="mt-1 text-sm text-gray-500">
          Structured data via CSV/XLSX. Images live inside Phones, News, and
          Documentation. EV hub covers catalog, upcoming launches, EV news, and
          EV reviews in one section.
        </p>

        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-semibold">Upload strategy</p>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            <li>Phones → CSV/XLSX + images</li>
            <li>EV → catalog · upcoming · news · reviews</li>
            <li>News &amp; Documentation → PDF/CSV + images</li>
            <li>Phone reviews → separate Reviews tab</li>
          </ul>
        </div>

        {user && (
          <p className="mt-2 text-sm text-gray-600">
            Signed in as <strong>{roleLabel(user.role)}</strong> — choose what to
            upload:
          </p>
        )}

        {user && !canViewHistory && (
          <p className="mt-2 text-sm text-gray-500">
            Upload history, audit log, and delete/restore/purge are available to{" "}
            <strong>SUPER_ADMIN</strong> only. ADMIN can bulk upload phones.
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2 border-b border-gray-200 pb-2">
          {(
            [
              ["upload", "Bulk upload"],
              ...(canViewHistory
                ? ([
                    ["history", "Upload history"],
                    ["audit", "Audit log"],
                  ] as const)
                : []),
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                tab === id
                  ? "bg-red-600 text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:border-red-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "history" && user && canViewHistory && (
          <div className="mt-6 space-y-4">
            <ImportHistoryPanel
              role={user.role}
              refreshKey={historyRefreshKey}
            />
            <DeletePermissionsNote />
          </div>
        )}

        {tab === "audit" && canViewHistory && user && (
          <div className="mt-6">
            <ImportAuditPanel role={user.role} />
          </div>
        )}

        {tab === "upload" && (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              {visibleCatalog.map((item) => (
                <button
                  key={item.kind}
                  type="button"
                  onClick={() => setSelected(item.kind)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    selected === item.kind
                      ? "bg-red-600 text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:border-red-300"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                "CSV & Excel (.xlsx) upload",
                "Validation before upload",
                "Duplicate detection",
                "Progress indicator",
                "Error report download",
                "Rollback if upload fails",
                "Background processing (50+ rows)",
                "Bulk delete with undo/restore",
                "Upload history tracking",
                "Audit logs",
                "Enterprise-grade safety (soft delete + SUPER_ADMIN purge)",
              ].map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
                >
                  <CheckCircle2
                    size={16}
                    className="shrink-0 text-emerald-600"
                  />
                  {feature}
                </li>
              ))}
            </ul>

            {selected ? (
              <div className="mt-6">
                <BulkUploadPanel
                  kind={selected}
                  role={user!.role}
                  onUploadSuccess={() => {
                    setHistoryRefreshKey((key) => key + 1);
                    if (canViewHistory) {
                      setTab("history");
                    }
                  }}
                />
              </div>
            ) : (
              <p className="mt-8 text-sm text-gray-500">
                Select a category above. For EV, use the tabs inside the panel
                for catalog, upcoming launches, EV news, and EV reviews.
              </p>
            )}

            {visibleCatalog.length === 0 && (
              <p className="mt-6 text-sm text-gray-500">
                Your role does not have bulk upload access.
              </p>
            )}
          </>
        )}
      </div>
    </RoleGate>
  );
}

export default function AdminImportPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm text-gray-500">Loading bulk upload…</div>
      }
    >
      <AdminImportContent />
    </Suspense>
  );
}
