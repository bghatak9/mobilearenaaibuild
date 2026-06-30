"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import { RoleGate } from "@/components/admin/RoleGate";
import { PasswordRequirementHint } from "@/components/auth/PasswordRequirementHint";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
  type AdminUser,
} from "@/lib/api";
import { useAdminAuth } from "@/lib/admin-auth";
import { passwordValidationMessage } from "@/lib/password-policy";
import {
  assignableRoles,
  roleDescription,
  roleLabel,
  sortRoles,
  sortUsersByRole,
  type UserRole,
} from "@/lib/roles";
import { userDisplayId } from "@/lib/user-display-id";

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function UserRows({
  users,
  onBlock,
  onDelete,
  groupByRole = false,
}: {
  users: AdminUser[];
  onBlock: (u: AdminUser) => void;
  onDelete: (id: number) => void;
  groupByRole?: boolean;
}) {
  let lastRole: UserRole | null = null;

  return (
    <>
      {users.map((u) => {
        const showRoleHeader = groupByRole && u.role !== lastRole;
        if (groupByRole) lastRole = u.role;

        return (
          <Fragment key={u.id}>
            {showRoleHeader && (
              <tr className="bg-zinc-50">
                <td
                  colSpan={7}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-600"
                >
                  {roleLabel(u.role)} — {roleDescription(u.role)}
                </td>
              </tr>
            )}
            <tr className="hover:bg-gray-50">
          <td className="px-4 py-3">
            <p className="font-medium text-zinc-900">{u.name ?? "—"}</p>
            <Link
              href={`/admin/users/${u.id}`}
              className="text-gray-500 hover:text-red-600 hover:underline"
            >
              {u.email}
            </Link>
          </td>
          <td className="px-4 py-3 font-mono text-xs text-zinc-700">
            {userDisplayId(u.email)}
          </td>
          <td className="px-4 py-3">
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">
              {roleLabel(u.role)}
            </span>
            {u.role === "USER" && (
              <span className="ml-1.5 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                Website signup
              </span>
            )}
            <p className="mt-0.5 max-w-[200px] text-xs text-gray-400">
              {roleDescription(u.role)}
            </p>
          </td>
          <td className="px-4 py-3">
            {u.isBlocked ? (
              <span className="text-rose-600">Blocked</span>
            ) : u.isActive ? (
              <span className="text-emerald-600">Active</span>
            ) : (
              <span className="text-gray-400">Inactive</span>
            )}
            {!u.isVerified && u.role === "USER" && (
              <p className="text-xs text-amber-600">Unverified</p>
            )}
          </td>
          <td className="px-4 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
          <td className="px-4 py-3 text-gray-500">
            {u.lastLogin ? formatDate(u.lastLogin) : "Never"}
          </td>
          <td className="px-4 py-3 text-right">
            <Link
              href={`/admin/users/${u.id}`}
              className="mr-2 text-xs font-medium text-red-600 hover:underline"
            >
              Details
            </Link>
            <button
              type="button"
              onClick={() => onBlock(u)}
              className="mr-2 text-xs font-medium text-amber-700 hover:underline"
            >
              {u.isBlocked ? "Unblock" : "Block"}
            </button>
            {u.role !== "SUPER_ADMIN" && (
              <button
                type="button"
                onClick={() => onDelete(u.id)}
                className="text-xs font-medium text-rose-600 hover:underline"
              >
                Delete
              </button>
            )}
          </td>
            </tr>
          </Fragment>
        );
      })}
    </>
  );
}

function UserTable({
  title,
  description,
  users,
  emptyMessage,
  onBlock,
  onDelete,
  collapsible = false,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = true,
  accent = "default",
  groupByRole = false,
}: {
  title: string;
  description: string;
  users: AdminUser[];
  emptyMessage: string;
  onBlock: (u: AdminUser) => void;
  onDelete: (id: number) => void;
  collapsible?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  accent?: "default" | "website";
  groupByRole?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;

  function toggleOpen() {
    const next = !open;
    onOpenChange?.(next);
    if (controlledOpen === undefined) setInternalOpen(next);
  }

  const borderAccent =
    accent === "website" && open ? "border-blue-200" : "border-gray-200";
  const headerAccent =
    accent === "website" ? "hover:bg-blue-50/60" : "hover:bg-gray-50";

  return (
    <section
      className={`overflow-hidden rounded-xl border bg-white shadow-sm ${borderAccent}`}
    >
      {collapsible ? (
        <button
          type="button"
          onClick={toggleOpen}
          className={`flex w-full items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 text-left ${headerAccent}`}
          aria-expanded={open}
        >
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">
              {title}{" "}
              <span className="font-normal text-gray-400">({users.length})</span>
            </h2>
            <p className="text-xs text-gray-500">
              {open ? description : "Click to show list"}
            </p>
          </div>
          <ChevronDown
            size={18}
            className={`shrink-0 text-gray-400 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      ) : (
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-zinc-900">
            {title}{" "}
            <span className="font-normal text-gray-400">({users.length})</span>
          </h2>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      )}
      {open && users.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-gray-400">
          {emptyMessage}
        </p>
      ) : open ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Signed up</th>
                <th className="px-4 py-3">Last login</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <UserRows
                users={users}
                onBlock={onBlock}
                onDelete={onDelete}
                groupByRole={groupByRole}
              />
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

export default function AdminUsersPage() {
  const { user: actor } = useAdminAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [formEmail, setFormEmail] = useState("");
  const [formName, setFormName] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<UserRole>("EDITOR");
  const [showWebsiteSignups, setShowWebsiteSignups] = useState(false);

  function loadUsers() {
    setLoading(true);
    getUsers()
      .then(setUsers)
      .catch(() => setError("Failed to load users."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const roles = actor ? assignableRoles(actor.role) : [];
  const staffRoles = useMemo(
    () => sortRoles(roles.filter((r) => r !== "USER")),
    [roles],
  );

  function resetCreateForm() {
    setFormEmail("");
    setFormName("");
    setFormPassword("");
    setFormRole(staffRoles[0] ?? "EDITOR");
  }

  const websiteSignups = useMemo(
    () => users.filter((u) => u.role === "USER"),
    [users],
  );
  const staffUsers = useMemo(
    () => sortUsersByRole(users.filter((u) => u.role !== "USER")),
    [users],
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreateSuccess(null);
    if (formPassword.trim()) {
      const passwordError = passwordValidationMessage(
        formPassword.trim(),
        formRole,
      );
      if (passwordError) {
        setError(passwordError);
        return;
      }
    }
    try {
      const created = await createUser({
        email: formEmail,
        password: formPassword.trim() || undefined,
        name: formName || undefined,
        role: formRole,
      });
      setUsers((prev) => [created, ...prev]);
      setShowForm(false);
      resetCreateForm();
      setCreateSuccess(
        formPassword.trim()
          ? "User created with the provided password (stored as a hash only)."
          : "User created. Send a password reset email from their account page, or they can use Forgot password.",
      );
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

  if (!actor) return null;

  return (
    <RoleGate allowed={["SUPER_ADMIN"]}>
      <div className="p-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">User Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage staff accounts and view public website signups.{" "}
              {websiteSignups.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowWebsiteSignups(true)}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {websiteSignups.length} website signup
                  {websiteSignups.length === 1 ? "" : "s"} — click to show
                </button>
              )}{" "}
              {actor.role === "SUPER_ADMIN"
                ? "SUPER_ADMIN accounts are protected."
                : null}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={loadUsers}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-red-300"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
            >
              {showForm ? "Cancel" : "Create staff account"}
            </button>
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </p>
        )}
        {createSuccess && (
          <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {createSuccess}
          </p>
        )}

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <h2 className="mb-4 font-semibold text-zinc-900">New staff account</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium text-gray-700">
                  Email <span className="text-red-600">*</span>
                </span>
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
                <span className="font-medium text-gray-700">Staff role</span>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  {staffRoles.map((r) => (
                    <option key={r} value={r}>
                      {roleLabel(r)} — {roleDescription(r)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="font-medium text-gray-700">
                  Password{" "}
                  <span className="font-normal text-gray-400">(optional)</span>
                </span>
                <input
                  type="password"
                  minLength={8}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Leave blank to require email OTP reset"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                {formPassword.trim() ? <PasswordRequirementHint /> : null}
              </label>
            </div>
            <button
              type="submit"
              className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Create staff account
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-gray-400">Loading users…</p>
        ) : (
          <div className="space-y-6">
            <UserTable
              title="Staff & admin accounts"
              description="Listed by role priority: SUPER_ADMIN, ADMIN, EDITOR, AUTHOR, MODERATOR."
              users={staffUsers}
              emptyMessage="No staff accounts yet."
              onBlock={toggleBlock}
              onDelete={handleDelete}
              collapsible
              defaultOpen
              groupByRole
            />
            <UserTable
              title="Website signups"
              description="Public accounts registered at /signup only — not creatable from admin."
              users={websiteSignups}
              emptyMessage="No website signups yet. Users who register on the site will appear here."
              onBlock={toggleBlock}
              onDelete={handleDelete}
              collapsible
              open={showWebsiteSignups}
              onOpenChange={setShowWebsiteSignups}
              accent="website"
            />
          </div>
        )}
      </div>
    </RoleGate>
  );
}
