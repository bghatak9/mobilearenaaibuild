"use client";

import { useEffect, useState } from "react";

import { useProfile } from "@/components/profile/ProfileProvider";
import {
  ProfileError,
  ProfileLoading,
  ProfilePageHeader,
  ProfilePanel,
} from "@/components/profile/ProfileShell";
import { updateMyProfile } from "@/lib/api";
import { AVATAR_PRESETS, resolveAvatarUrl } from "@/lib/profile-avatars";

export default function AvatarPage() {
  const { profile, loading, error, setProfile } = useProfile();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) setAvatar(profile.avatar);
  }, [profile]);

  if (loading) return <ProfileLoading />;
  if (error) return <ProfileError message={error} />;
  if (!profile) return null;

  const preview = resolveAvatarUrl(avatar, profile.email);

  async function save(next: string | null) {
    setSaving(true);
    setMsg(null);
    try {
      const updated = await updateMyProfile({ avatar: next });
      setProfile(updated);
      setAvatar(updated.avatar);
      setMsg("Avatar updated.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <ProfilePageHeader
        title="Change Avatar"
        description="Pick a preset avatar or use your own image URL."
      />
      {msg && (
        <p className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {msg}
        </p>
      )}
      <ProfilePanel>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <img
            src={preview}
            alt=""
            className="h-28 w-28 rounded-full border-4 border-red-100 object-cover dark:border-red-900"
          />
          <div className="flex-1">
            <p className="text-sm font-medium">Choose a preset</p>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {AVATAR_PRESETS.map((preset) => {
                const url = preset.build(profile.email);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    disabled={saving}
                    onClick={() => void save(url)}
                    className="rounded-lg border p-1 hover:border-red-500 dark:border-zinc-700"
                    title={preset.label}
                  >
                    <img src={url} alt={preset.label} className="h-12 w-12 rounded-md" />
                  </button>
                );
              })}
            </div>
            <label className="mt-4 block text-sm">
              <span className="font-medium">Custom URL</span>
              <div className="mt-1 flex gap-2">
                <input
                  value={avatar ?? ""}
                  onChange={(e) => setAvatar(e.target.value || null)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  placeholder="https://…"
                />
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void save(avatar)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Apply
                </button>
              </div>
            </label>
          </div>
        </div>
      </ProfilePanel>
    </>
  );
}
