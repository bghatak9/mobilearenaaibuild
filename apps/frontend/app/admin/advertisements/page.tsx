"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { RoleGate } from "@/components/admin/RoleGate";
import { BulkUploadPanel } from "@/components/admin/BulkUploadPanel";
import { ImportAuditPanel } from "@/components/admin/ImportAuditPanel";
import {
  DeletePermissionsNote,
  ImportHistoryPanel,
} from "@/components/admin/ImportHistoryPanel";
import AdCatalogPanel from "@/components/admin/AdCatalogPanel";
import AdCampaignPanel from "@/components/admin/AdCampaignPanel";
import AdSchedulePanel from "@/components/admin/AdSchedulePanel";
import { useAdminAuth } from "@/lib/admin-auth";
import {
  AUDIT_LOG_ROLES,
  IMPORT_HISTORY_ROLES,
  PAID_AD_IMPORT_ROLES,
} from "@/lib/content-permissions";

const AD_IMPORT_FEATURES = [
  "CSV, Excel (.xlsx) & JSON upload",
  "14 ad categories — display, native, in-article, sponsored & more",
  "Validation before upload",
  "Duplicate detection",
  "Progress indicator",
  "Error report download",
  "Rollback if upload fails",
  "Background processing (50+ rows)",
];

const AD_SUPER_ADMIN_FEATURES = [
  "Bulk delete (SUPER_ADMIN)",
  "Restore deleted uploads (SUPER_ADMIN only)",
  "Upload history tracking (SUPER_ADMIN)",
  "Audit logs (SUPER_ADMIN)",
  "Enterprise-grade safety (soft delete + SUPER_ADMIN purge)",
];

export default function AdminAdvertisementsPage() {
  const { user } = useAdminAuth();
  const [tab, setTab] = useState<
    "upload" | "campaigns" | "schedule" | "catalog" | "history" | "audit"
  >("campaigns");

  const canManageLifecycle = user
    ? IMPORT_HISTORY_ROLES.includes(user.role)
    : false;
  const canViewAudit = user ? AUDIT_LOG_ROLES.includes(user.role) : false;
  const adFeatures = user?.role === "SUPER_ADMIN"
    ? [...AD_IMPORT_FEATURES, ...AD_SUPER_ADMIN_FEATURES]
    : AD_IMPORT_FEATURES;

  return (
    <RoleGate allowed={[...PAID_AD_IMPORT_ROLES]}>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-zinc-900">Advertisement Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage ad campaigns, scheduling, and impression & click tracking. Upload
          ads from CSV, Excel, JSON, or PDF.{" "}
          <strong>SUPER_ADMIN</strong> can delete, restore, view audit logs, and
          access Revenue Analytics. <strong>ADMIN</strong> can manage campaigns
          and upload ads.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 border-b border-gray-200 pb-2">
          {(
            [
              ["campaigns", "Campaigns"],
              ["schedule", "Scheduling"],
              ["upload", "Upload ads"],
              ["catalog", "Ad catalog"],
              ...(canManageLifecycle
                ? ([["history", "Upload history"]] as const)
                : []),
              ...(canViewAudit ? ([["audit", "Audit log"]] as const) : []),
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

        {user && !canManageLifecycle && (
          <p className="mt-3 text-sm text-gray-500">
            As <strong>ADMIN</strong> you can upload ads. Delete, restore,
            purge, upload history, and audit log are{" "}
            <strong>SUPER_ADMIN</strong> only.
          </p>
        )}

        {tab === "campaigns" && (
          <div className="mt-6">
            <AdCampaignPanel />
          </div>
        )}

        {tab === "schedule" && (
          <div className="mt-6">
            <AdSchedulePanel />
          </div>
        )}

        {tab === "upload" && user && (
          <>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {adFeatures.map((feature) => (
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

            <div className="mt-6">
              <BulkUploadPanel kind="advertisements" role={user.role} />
            </div>
          </>
        )}

        {tab === "catalog" && (
          <div className="mt-6">
            <AdCatalogPanel />
          </div>
        )}

        {tab === "history" && user && canManageLifecycle && (
          <div className="mt-6 space-y-4">
            <ImportHistoryPanel role={user.role} importKind="advertisements" />
            <DeletePermissionsNote importKind="advertisements" />
          </div>
        )}

        {tab === "audit" && user && canViewAudit && (
          <div className="mt-6">
            <ImportAuditPanel role={user.role} />
          </div>
        )}
      </div>
    </RoleGate>
  );
}
