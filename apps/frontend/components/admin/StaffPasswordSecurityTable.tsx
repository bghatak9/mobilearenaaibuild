"use client";

import type { StaffPasswordSecurityRow } from "@/lib/staff-password-policy";
import { staffRoleLabel } from "@/lib/staff-password-policy";
import type { UserRole } from "@/lib/roles";

export function StaffPasswordSecurityTable({
  rows,
  title = "Staff password security",
  description = "All staff roles — passwords are bcrypt-hashed; administrators cannot view them.",
}: {
  rows: StaffPasswordSecurityRow[];
  title?: string;
  description?: string;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Storage</th>
              <th className="px-4 py-3">Admin can view</th>
              <th className="px-4 py-3">Requirements</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.role}>
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {staffRoleLabel(row.role as UserRole)}
                </td>
                <td className="px-4 py-3 text-emerald-700">
                  bcrypt hash only
                </td>
                <td className="px-4 py-3 text-rose-600">No</td>
                <td className="px-4 py-3 text-gray-600">{row.requirements}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
