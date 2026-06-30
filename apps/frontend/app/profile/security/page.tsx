"use client";

import Link from "next/link";
import { useState } from "react";

import { useProfile } from "@/components/profile/ProfileProvider";
import {
  ProfileError,
  ProfileLoading,
  ProfilePageHeader,
  ProfilePanel,
} from "@/components/profile/ProfileShell";
import { changeProfilePassword, setProfileTwoFactor } from "@/lib/api";

export default function SecurityPage() {
  const { profile, loading, error } = useProfile();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [twoFactorPassword, setTwoFactorPassword] = useState("");
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  if (loading) return <ProfileLoading />;
  if (error) return <ProfileError message={error} />;
  if (!profile) return null;

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    setMsg(null);
    if (newPassword !== confirmPassword) {
      setLocalError("New passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      await changeProfilePassword({ currentPassword, newPassword });
      setMsg("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Password change failed");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTwoFactor(enable: boolean) {
    setTwoFactorLoading(true);
    setLocalError(null);
    setMsg(null);
    try {
      await setProfileTwoFactor({
        currentPassword: twoFactorPassword,
        enabled: enable,
      });
      setMsg(enable ? "2FA enabled." : "2FA disabled.");
      setTwoFactorPassword("");
      window.location.reload();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "2FA update failed");
    } finally {
      setTwoFactorLoading(false);
    }
  }

  return (
    <>
      <ProfilePageHeader
        title="Password & 2FA"
        description="Keep your account secure with a strong password."
      />
      {localError && <ProfileError message={localError} />}
      {msg && (
        <p className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {msg}
        </p>
      )}

      <ProfilePanel>
        {profile.settings.hasPassword ? (
          <form
            onSubmit={(e) => void handleChangePassword(e)}
            className="space-y-4"
          >
            <label className="block text-sm">
              <span className="font-medium">Current password</span>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">New password</span>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Confirm new password</span>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Updating…" : "Change password"}
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-600">
            This account uses Google Sign-In.{" "}
            <Link href="/forgot-password" className="text-red-600 hover:underline">
              Set a password via forgot password
            </Link>{" "}
            if you want email login as well.
          </p>
        )}

        <div className="mt-8 rounded-xl border border-dashed border-gray-200 p-4 dark:border-zinc-700">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Two-factor authentication (2FA)
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {profile.settings.twoFactorEnabled
              ? "2FA is enabled — you'll be prompted for a code at sign-in (authenticator app support coming soon)."
              : "Add an extra layer of security by enabling 2FA with your password."}
          </p>
          {profile.settings.hasPassword && (
            <div className="mt-4 space-y-3">
              <input
                type="password"
                placeholder="Current password"
                value={twoFactorPassword}
                onChange={(e) => setTwoFactorPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
              <button
                type="button"
                disabled={twoFactorLoading || !twoFactorPassword}
                onClick={() =>
                  void toggleTwoFactor(!profile.settings.twoFactorEnabled)
                }
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
              >
                {twoFactorLoading
                  ? "Updating…"
                  : profile.settings.twoFactorEnabled
                    ? "Disable 2FA"
                    : "Enable 2FA"}
              </button>
            </div>
          )}
        </div>
      </ProfilePanel>
    </>
  );
}
