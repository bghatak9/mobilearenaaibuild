"use client";

import { useEffect, useState } from "react";

import { formatDateLong } from "@/lib/format-datetime";

import { useProfile } from "@/components/profile/ProfileProvider";
import {
  ProfileError,
  ProfileLoading,
  ProfilePageHeader,
  ProfilePanel,
} from "@/components/profile/ProfileShell";
import { updateProfileSettings } from "@/lib/api";

export default function SettingsPage() {
  const { profile, loading, error, setProfile } = useProfile();
  const [notifyReplies, setNotifyReplies] = useState(true);
  const [notifyPriceAlerts, setNotifyPriceAlerts] = useState(true);
  const [notifyNewsletter, setNotifyNewsletter] = useState(false);
  const [profilePublic, setProfilePublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setNotifyReplies(profile.settings.notifyReplies ?? true);
      setNotifyPriceAlerts(profile.settings.notifyPriceAlerts ?? true);
      setNotifyNewsletter(profile.settings.notifyNewsletter ?? false);
      setProfilePublic(profile.settings.profilePublic ?? true);
    }
  }, [profile]);

  if (loading) return <ProfileLoading />;
  if (error) return <ProfileError message={error} />;
  if (!profile) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const updated = await updateProfileSettings({
        notifyReplies,
        notifyPriceAlerts,
        notifyNewsletter,
        profilePublic,
      });
      setProfile(updated);
      setMsg("Settings saved.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <ProfilePageHeader
        title="Account Settings"
        description="Manage notification preferences and account options."
      />
      {msg && (
        <p className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {msg}
        </p>
      )}
      <ProfilePanel>
        <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={notifyReplies}
              onChange={(e) => setNotifyReplies(e.target.checked)}
            />
            Email me when someone replies to my comments
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={notifyPriceAlerts}
              onChange={(e) => setNotifyPriceAlerts(e.target.checked)}
            />
            Price drop alerts for wishlist items
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={notifyNewsletter}
              onChange={(e) => setNotifyNewsletter(e.target.checked)}
            />
            MobileArena newsletter and deals digest
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={Boolean(profilePublic)}
              onChange={(e) => setProfilePublic(e.target.checked)}
            />
            Show my profile publicly (reputation, badges, activity)
          </label>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
        </form>

        <dl className="mt-8 space-y-2 border-t border-gray-100 pt-6 text-sm dark:border-zinc-800">
          <div className="flex justify-between">
            <dt className="text-gray-500">Email</dt>
            <dd className="font-medium">{profile.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Member since</dt>
            <dd className="font-medium">
              {formatDateLong(profile.memberSince)}
            </dd>
          </div>
        </dl>
      </ProfilePanel>
    </>
  );
}
