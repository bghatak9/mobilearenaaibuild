"use client";

import { useEffect, useState } from "react";

import { useProfile } from "@/components/profile/ProfileProvider";
import {
  ProfileError,
  ProfileLoading,
  ProfilePageHeader,
  ProfilePanel,
} from "@/components/profile/ProfileShell";
import {
  addFavoriteBrand,
  getBrandsGrouped,
  removeFavoriteBrand,
  updateMyProfile,
  type BrandCategoryGroup,
} from "@/lib/api";

export default function EditProfilePage() {
  const { profile, loading, error, setProfile } = useProfile();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [headline, setHeadline] = useState("");
  const [brandGroups, setBrandGroups] = useState<BrandCategoryGroup[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setBio(profile.bio ?? "");
      setHeadline(profile.settings.headline ?? "");
    }
  }, [profile]);

  useEffect(() => {
    getBrandsGrouped().then(setBrandGroups).catch(() => undefined);
  }, []);

  if (loading) return <ProfileLoading />;
  if (error) return <ProfileError message={error} />;
  if (!profile) return null;

  const favoriteIds = new Set(profile.favoriteBrands.map((b) => b.id));
  const availableGroups = brandGroups
    .map((group) => ({
      ...group,
      brands: group.brands.filter((b) => !favoriteIds.has(b.id)),
    }))
    .filter((group) => group.brands.length > 0);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setLocalError(null);
    setMsg(null);
    try {
      const updated = await updateMyProfile({
        name,
        bio,
        headline: headline || null,
      });
      setProfile(updated);
      setMsg("Profile saved.");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddBrand() {
    const id = Number(selectedBrandId);
    if (!id) return;
    try {
      const updated = await addFavoriteBrand(id);
      setProfile(updated);
      setSelectedBrandId("");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to add brand");
    }
  }

  async function handleRemoveBrand(brandId: number) {
    try {
      const updated = await removeFavoriteBrand(brandId);
      setProfile(updated);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to remove brand");
    }
  }

  return (
    <>
      <ProfilePageHeader
        title="Edit Profile"
        description="Update your display name, bio, headline, and favorite brands."
      />
      {localError && <ProfileError message={localError} />}
      {msg && (
        <p className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {msg}
        </p>
      )}
      <ProfilePanel>
        <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
          <label className="block text-sm">
            <span className="font-medium">Display name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Headline</span>
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Tech Enthusiast"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Bio</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={500}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>

        <div className="mt-8 border-t border-gray-100 pt-6 dark:border-zinc-800">
          <h3 className="font-semibold">Favorite brands</h3>
          <div className="mt-3 flex gap-2">
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="">Add brand…</option>
              {availableGroups.map((group) => (
                <optgroup key={group.category.slug} label={group.category.name}>
                  {group.brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void handleAddBrand()}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Add
            </button>
          </div>
          <ul className="mt-3 space-y-2">
            {profile.favoriteBrands.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2 dark:border-zinc-800"
              >
                <span>{b.name}</span>
                <button
                  type="button"
                  onClick={() => void handleRemoveBrand(b.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </ProfilePanel>
    </>
  );
}
