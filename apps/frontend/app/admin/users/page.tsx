"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
  type AdminUser,
} from "@/lib/api";
import { useAdminAuth } from "@/lib/admin-auth";
import {
  assignableRoles,
  canManageUsers,
  roleLabel,
  type UserRole,
} from "@/lib/roles";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: actor } = useAdminAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [formEmail, setFormEmail] = useState("");
  const [formName, setFormName] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<UserRole>("EDITOR");

  useEffect(() => {
    if (actor && !canManageUsers(actor.role)) {
      router.replace("/admin");
    }
  }, [actor, router]);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch(() => setError("Failed to load users."))
      .finally(() => setLoading(false));
  }, []);

  const roles = actor ? assignableRoles(actor.role) : [];

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const created = await createUser({
        email: formEmail,
        password: formPassword,
        name: formName || undefined,
        role: formRole,
      });
      setUsers((prev) => [created, ...prev]);
      setShowForm(false);
      setFormEmail("");
      setFormName("");
      setFormPassword("");
      setFormRole("EDITOR");
    } catch {
      setError("Could not create user. Check permissions and try again.");
    }
  }

  async function toggleBlock(target: AdminUser) {
    try {
      const updated = await updateUser(target.id, {
        isBlocked: !target.isBlocked,
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? updated : u)),
      );
    } catch {
      setError("Failed to update user.");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this user permanently?")) return;
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setError("Failed to delete user.");
    }
  }

  if (!actor || !canManageUsers(actor.role)) return null;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage staff and registered accounts.{" "}
            {actor.role === "ADMIN"
              ? "You cannot view or modify SUPER_ADMIN or other ADMIN accounts."
              : "SUPER_ADMIN accounts are protected."}
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
        >
          {showForm ? "Cancel" : "Create user"}
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {error}
        </p>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <h2 className="mb-4 font-semibold text-zinc-900">New user</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Email</span>
              <input
                type="email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Name</span>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Password</span>
              <input
                type="password"
                required
                minLength={8}
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Role</span>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as UserRole)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {roleLabel(r)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="submit"
            className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Create
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400">Loading users…</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last login</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900">
                      {u.name ?? "—"}
                    </p>
                    <p className="text-gray-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">
                      {roleLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.isBlocked ? (
                      <span className="text-rose-600">Blocked</span>
                    ) : u.isActive ? (
                      <span className="text-emerald-600">Active</span>
                    ) : (
                      <span className="text-gray-400">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {u.lastLogin
                      ? new Date(u.lastLogin).toLocaleString()
                      : "Never"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleBlock(u)}
                      className="mr-2 text-xs font-medium text-amber-700 hover:underline"
                    >
                      {u.isBlocked ? "Unblock" : "Block"}
                    </button>
                    {u.role !== "SUPER_ADMIN" && (
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="text-xs font-medium text-rose-600 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
