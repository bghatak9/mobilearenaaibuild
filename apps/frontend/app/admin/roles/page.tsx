"use client";

import { Shield } from "lucide-react";

import { RoleGate } from "@/components/admin/RoleGate";
import { StaffPasswordSecurityTable } from "@/components/admin/StaffPasswordSecurityTable";
import { GOOGLE_SIGNIN_ENABLED } from "@/lib/google-auth";
import {
  CONTENT_AREAS,
  CONTENT_AREA_LABELS,
  contentAccessMatrix,
  DELETE_ACTION_LABELS,
  deletePermissionMatrix,
  IMAGE_SCOPE_NOTES,
  PDF_PHONES_POLICY,
  pdfPermissionMatrix,
  ROLE_RESPONSIBILITIES,
  type DeleteAction,
} from "@/lib/content-permissions";
import {
  ROLE_DESCRIPTIONS,
  ROLE_HIERARCHY,
  STAFF_ROLES,
  roleLabel,
} from "@/lib/roles";
import { PASSWORD_POLICY_ROWS } from "@/lib/password-policy";
import { STAFF_PASSWORD_SECURITY } from "@/lib/staff-password-policy";

export default function RoleManagementPage() {
  return (
    <RoleGate allowed={["SUPER_ADMIN"]}>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-zinc-900">Role Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Staff roles and authentication policy.
        </p>

        <section className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
            <Shield size={16} />
            Authentication
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-emerald-800/80">
            <li>
              Passwords stored as <strong>bcrypt hashes only</strong> — never
              plain text.
            </li>
            <li>
              Self-service reset via <strong>email OTP</strong> at{" "}
              <code className="rounded bg-emerald-100 px-1">/forgot-password</code>
              .
            </li>
            <li>
              Sign in with email/User ID + password at{" "}
              <code className="rounded bg-emerald-100 px-1">/login</code>{" "}
              (website) or{" "}
              <code className="rounded bg-emerald-100 px-1">/admin/login</code>{" "}
              (staff).
            </li>
            {GOOGLE_SIGNIN_ENABLED && (
              <li>
                <strong>Google Sign-In</strong> is enabled when{" "}
                <code className="rounded bg-emerald-100 px-1">
                  NEXT_PUBLIC_GOOGLE_CLIENT_ID
                </code>{" "}
                is set.
              </li>
            )}
            <li>
              Applies to all staff:{" "}
              <strong>SUPER ADMIN, ADMIN, EDITOR, AUTHOR, MODERATOR</strong>.
              Administrators cannot view or retrieve passwords.
            </li>
            <li>
              SUPER_ADMIN can send password reset codes from User Management.
            </li>
          </ul>
        </section>

        <div className="mt-4">
          <StaffPasswordSecurityTable rows={STAFF_PASSWORD_SECURITY} />
        </div>

        <section className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-zinc-900">
              Content access policy
            </h2>
            <p className="text-xs text-gray-500">
              Phones, News, Brands, Images, Prices, Users — enforced on API
              routes and bulk upload.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Role</th>
                  {CONTENT_AREAS.map((area) => (
                    <th key={area} className="px-4 py-3">
                      {CONTENT_AREA_LABELS[area]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ROLE_HIERARCHY.map((role) => {
                  const matrix = contentAccessMatrix()[role];
                  return (
                    <tr key={role}>
                      <td className="px-4 py-3 font-medium text-zinc-900">
                        {roleLabel(role)}
                      </td>
                      {CONTENT_AREAS.map((area) => (
                        <td key={area} className="px-4 py-3 text-center">
                          {matrix[area] ? (
                            <span className="text-emerald-600" title="Allowed">
                              ✓
                            </span>
                          ) : (
                            <span className="text-gray-300" title="Denied">
                              —
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {Object.keys(IMAGE_SCOPE_NOTES).length > 0 && (
            <p className="border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
              Images: EDITOR — {IMAGE_SCOPE_NOTES.EDITOR}; AUTHOR —{" "}
              {IMAGE_SCOPE_NOTES.AUTHOR}.
            </p>
          )}
        </section>

        <section className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-zinc-900">
              PDF upload permissions
            </h2>
            <p className="text-xs text-gray-500">
              PDF allowed only for news, reviews, and documentation. Phones use
              CSV/XLSX only.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Upload PDF News</th>
                  <th className="px-4 py-3">Upload PDF Phones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ROLE_HIERARCHY.map((role) => {
                  const pdf = pdfPermissionMatrix()[role];
                  return (
                    <tr key={role}>
                      <td className="px-4 py-3 font-medium text-zinc-900">
                        {roleLabel(role)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {pdf.pdfNews ? (
                          <span className="text-emerald-600" title="Allowed">
                            ✓
                          </span>
                        ) : (
                          <span className="text-gray-300" title="Denied">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-600">
                        {pdf.pdfPhones === "warn" ? (
                          <span title={PDF_PHONES_POLICY.note}>⚠️ CSV/XLSX</span>
                        ) : (
                          <span className="text-gray-300" title="Blocked">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
            {PDF_PHONES_POLICY.note}
          </p>
        </section>

        <section className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-zinc-900">
              Delete option permissions
            </h2>
            <p className="text-xs text-gray-500">
              Soft delete, restore, and permanent erase — SUPER_ADMIN only.
              ADMIN can bulk upload only.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Action</th>
                  {(["SUPER_ADMIN", "ADMIN", "EDITOR"] as const).map((role) => (
                    <th key={role} className="px-4 py-3 text-center">
                      {roleLabel(role)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(
                  Object.keys(DELETE_ACTION_LABELS) as DeleteAction[]
                ).map((action) => (
                  <tr key={action}>
                    <td className="px-4 py-3 text-zinc-900">
                      {DELETE_ACTION_LABELS[action]}
                    </td>
                    {(["SUPER_ADMIN", "ADMIN", "EDITOR"] as const).map(
                      (role) => {
                        const allowed = deletePermissionMatrix()[role][action];
                        return (
                          <td key={role} className="px-4 py-3 text-center">
                            {allowed ? (
                              <span className="text-emerald-600">✓</span>
                            ) : action === "permanently_purge" &&
                              role === "ADMIN" ? (
                              <span className="text-gray-400" title="Denied">
                                —
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        );
                      },
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">
            Bulk upload responsibilities
          </h2>
          <div className="mt-4 space-y-4">
            {(Object.keys(ROLE_RESPONSIBILITIES) as Array<
              keyof typeof ROLE_RESPONSIBILITIES
            >).map((role) => (
              <div key={role}>
                <p className="font-medium text-zinc-900">{roleLabel(role)}</p>
                <ul className="mt-1 list-inside list-disc text-sm text-gray-600">
                  {ROLE_RESPONSIBILITIES[role]?.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-zinc-900">
              Password policy
            </h2>
            <p className="text-xs text-gray-500">
              Enforced on signup, password reset, and admin user creation.
            </p>
          </div>
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Minimum length</th>
                <th className="px-4 py-3">Requirements</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {PASSWORD_POLICY_ROWS.map((row) => (
                <tr key={row.role}>
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {roleLabel(row.role)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.minLength} characters
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.requirements}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Staff roles</h2>
          <p className="mt-1 text-xs text-gray-500">
            SUPER ADMIN, ADMIN, EDITOR, AUTHOR, and MODERATOR — each uses
            bcrypt-hashed passwords (never plain text).
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {STAFF_ROLES.map((role) => (
              <div
                key={role}
                className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <p className="font-medium text-zinc-900">{roleLabel(role)}</p>
                <p className="mt-1 text-sm text-gray-600">
                  {ROLE_DESCRIPTIONS[role]}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Responsibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ROLE_HIERARCHY.map((role) => (
                <tr key={role}>
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {roleLabel(role)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {ROLE_DESCRIPTIONS[role]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RoleGate>
  );
}
