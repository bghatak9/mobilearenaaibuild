"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ProfileError,
  ProfileLoading,
  ProfilePageHeader,
  ProfilePanel,
} from "@/components/profile/ProfileShell";
import {
  getDevices,
  getFavoriteDevices,
  addFavoriteDevice,
  removeFavoriteDevice,
  type Device,
  type FavoriteDevice,
} from "@/lib/api";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteDevice[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getFavoriteDevices(), getDevices()])
      .then(([fav, all]) => {
        setFavorites(fav);
        setDevices(all);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      )
      .finally(() => setLoading(false));
  }, []);

  const favIds = new Set(favorites.map((f) => f.id));
  const available = devices.filter((d) => !favIds.has(d.id));

  async function handleAdd() {
    const id = Number(selectedId);
    if (!id) return;
    const updated = await addFavoriteDevice(id);
    setFavorites(updated);
    setSelectedId("");
  }

  async function handleRemove(deviceId: number) {
    const updated = await removeFavoriteDevice(deviceId);
    setFavorites(updated);
  }

  if (loading) return <ProfileLoading />;
  if (error) return <ProfileError message={error} />;

  return (
    <>
      <ProfilePageHeader
        title="Favorite Phones"
        description="Your personal collection of favorite devices."
      />
      <ProfilePanel>
        <div className="flex gap-2">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="">Add a phone…</option>
            {available.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void handleAdd()}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Add
          </button>
        </div>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {favorites.length === 0 ? (
            <li className="col-span-full py-8 text-center text-sm text-gray-500">
              No favorite phones yet.
            </li>
          ) : (
            favorites.map((phone) => (
              <li
                key={phone.id}
                className="flex items-center justify-between rounded-xl border p-4 dark:border-zinc-800"
              >
                <div>
                  <Link
                    href={`/phones/${phone.slug}`}
                    className="font-semibold text-red-600 hover:underline"
                  >
                    {phone.name}
                  </Link>
                  {phone.brand && (
                    <p className="text-xs text-gray-500">{phone.brand.name}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => void handleRemove(phone.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))
          )}
        </ul>
      </ProfilePanel>
    </>
  );
}
