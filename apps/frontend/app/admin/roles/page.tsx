"use client";

import { RoleGate } from "@/components/admin/RoleGate";
import { roleLabel, type UserRole } from "@/lib/roles";

const HIERARCHY: { role: UserRole; summary: string }[] = [
  { role: "SUPER_ADMIN", summary: "Platform owner — full system access" },
  { role: "ADMIN", summary: "Business content & staff management" },
  { role: "EDITOR", summary: "Publish news and reviews" },
  { role: "AUTHOR", summary: "Write drafts (no direct publish)" },
  { role: "MODERATOR", summary: "Comment moderation" },
  { role: "USER", summary: "Public registered accounts" },
];

export default function RoleManagementPage() {
  return (
    <RoleGate allowed={["SUPER_ADMIN"]}>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-zinc-900">Role Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Role hierarchy and assignment rules. Assign roles from User Management
          or Admin Creation.
        </p>
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Responsibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {HIERARCHY.map(({ role, summary }) => (
                <tr key={role}>
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {roleLabel(role)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RoleGate>
  );
}
