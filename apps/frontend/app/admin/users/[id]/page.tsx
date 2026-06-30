"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, KeyRound, Save } from "lucide-react";

import { RoleGate } from "@/components/admin/RoleGate";
import {
  deleteUser,
  getUser,
  sendUserPasswordReset,
  updateUser,
  type AdminUser,
} from "@/lib/api";
import { useAdminAuth } from "@/lib/admin-auth";
import {
  assignableRoles,
  roleDescription,
  roleLabel,
  sortRoles,
  type UserRole,
} from "@/lib/roles";
import { userDisplayId } from "@/lib/user-display-id";

function formatDate(value: string | null): string {
  if (!value) return "Never";
  return new Date(value).toLocaleString();
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: actor } = useAdminAuth();
  const id = Number(params.id);

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("USER");
  const [isActive, setIsActive] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [saving, setSaving] = useState(false);

  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(id)) {
      setError("Invalid user ID.");
      setLoading(false);
      return;
    }
    getUser(id)
      .then((u) => {
        setUser(u);
        setName(u.name ?? "");
        setRole(u.role);
        setIsActive(u.isActive);
        setIsVerified(u.isVerified);
        setIsBlocked(u.isBlocked);
      })
      .catch(() => setError("Could not load account details."))
      .finally(() => setLoading(false));
  }, [id]);

  const staffRoles = actor ? sortRoles(assignableRoles(actor.role)) : [];
  const canEditRole =
    user != null &&
    user.role !== "SUPER_ADMIN" &&
    (staffRoles.includes(user.role) || user.role === "USER");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const updated = await updateUser(user.id, {
        name: name.trim() || undefined,
        role:
          canEditRole && staffRoles.includes(role) && role !== user.role
            ? role
            : undefined,
        isActive,
        isVerified,
        isBlocked,
      });
      setUser(updated);
      setRole(updated.role);
      setSuccess("Account updated.");
    } catch {
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSendPasswordReset() {
    if (!user) return;
    if (
      !confirm(
        `Send a password reset verification code to ${user.email}? They can set a new password at /forgot-password.`,
      )
    ) {
      return;
    }
    setError(null);
    setSuccess(null);
    setResetting(true);
    try {
      const result = await sendUserPasswordReset(user.id);
      setSuccess(
        result.devOtp
          ? `${result.message} (Dev OTP: ${result.devOtp})`
          : result.message,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send password reset.",
      );
    } finally {
      setResetting(false);
    }
  }

  async function handleDelete() {
    if (!user || user.role === "SUPER_ADMIN") return;
    if (!confirm(`Delete ${user.email} permanently?`)) return;
    try {
      await deleteUser(user.id);
      router.push("/admin/users");
    } catch {
      setError("Failed to delete user.");
    }
  }

  if (!actor) return null;

  return (
    <RoleGate allowed={["SUPER_ADMIN"]}>
      <div className="p-8">
        <Link
          href="/admin/users"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600"
        >
          <ArrowLeft size={16} />
          Back to users
        </Link>

        {loading ? (
          <p className="text-gray-400">Loading account…</p>
        ) : !user ? (
          <p className="text-rose-600">{error ?? "User not found."}</p>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">
                  {user.name ?? user.email}
                </h1>
                <p className="mt-1 text-sm text-gray-500">{user.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
                    {roleLabel(user.role)}
                  </span>
                  {user.role === "USER" && (
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      Website signup
                    </span>
                  )}
                  {user.isBlocked ? (
                    <span className="text-xs text-rose-600">Blocked</span>
                  ) : user.isActive ? (
                    <span className="text-xs text-emerald-600">Active</span>
                  ) : (
                    <span className="text-xs text-gray-400">Inactive</span>
                  )}
                  {user.isVerified && (
                    <span className="text-xs text-blue-600">Verified</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {roleDescription(user.role)}
                </p>
              </div>
              {user.role !== "SUPER_ADMIN" && (
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  className="rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  Delete account
                </button>
              )}
            </div>

            {error && (
              <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
                {error}
              </p>
            )}
            {success && (
              <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {success}
              </p>
            )}

            <div className={`grid gap-6 ${actor.role === "SUPER_ADMIN" ? "lg:grid-cols-2" : ""}`}>
              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold text-zinc-900">
                  Account details
                </h2>
                <dl className="mb-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">User ID</dt>
                    <dd className="font-mono font-medium text-zinc-900">
                      {userDisplayId(user.email)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Email</dt>
                    <dd className="text-zinc-900">{user.email}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Account source</dt>
                    <dd className="text-zinc-900">
                      {user.role === "USER" ? "Website signup" : "Admin created"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Last login</dt>
                    <dd className="text-zinc-900">
                      {formatDate(user.lastLogin)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Created</dt>
                    <dd className="text-zinc-900">
                      {formatDate(user.createdAt)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Updated</dt>
                    <dd className="text-zinc-900">
                      {formatDate(user.updatedAt)}
                    </dd>
                  </div>
                </dl>

                <form onSubmit={handleSave} className="space-y-4 border-t border-gray-100 pt-4">
                  <label className="block text-sm">
                    <span className="font-medium text-gray-700">Display name</span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </label>

                  {canEditRole && (
                    <label className="block text-sm">
                      <span className="font-medium text-gray-700">Role</span>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      >
                        {staffRoles.map((r) => (
                          <option key={r} value={r}>
                            {roleLabel(r)} — {roleDescription(r)}
                          </option>
                        ))}
                        {user.role === "USER" && (
                          <option value="USER" disabled>
                            {roleLabel("USER")} — {roleDescription("USER")} (current)
                          </option>
                        )}
                        {!staffRoles.includes(user.role) && user.role !== "USER" && (
                          <option value={user.role}>
                            {roleLabel(user.role)} — {roleDescription(user.role)}
                          </option>
                        )}
                      </select>
                    </label>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                      />
                      Active
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isVerified}
                        onChange={(e) => setIsVerified(e.target.checked)}
                      />
                      Verified
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isBlocked}
                        onChange={(e) => setIsBlocked(e.target.checked)}
                      />
                      Blocked
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
                  >
                    <Save size={16} />
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                </form>
              </section>

              {actor.role === "SUPER_ADMIN" && (
              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-zinc-900">
                  <KeyRound size={16} />
                  Password reset
                </h2>
                <p className="mb-4 text-sm text-gray-500">
                  Sends a verification code by email so the user can set a new
                  password at{" "}
                  <code className="text-xs">/forgot-password</code>. Passwords
                  are stored as hashes only — never shown here.
                </p>

                <button
                  type="button"
                  onClick={() => void handleSendPasswordReset()}
                  disabled={resetting}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
                >
                  {resetting ? "Sending…" : "Send password reset code"}
                </button>
              </section>
              )}
            </div>
          </>
        )}
      </div>
    </RoleGate>
  );
}
