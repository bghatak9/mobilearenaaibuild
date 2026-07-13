"use client";

import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";

import {
  ProfileError,
  ProfileLoading,
  ProfilePageHeader,
  ProfilePanel,
} from "@/components/profile/ProfileShell";
import { SwipePagedList } from "@/components/ui/SwipePagedList";
import {
  addWishlistItem,
  getDevices,
  getWishlist,
  removeWishlistItem,
  updateWishlistItem,
  type Device,
  type WishlistItem,
} from "@/lib/api";
import { useLocale } from "next-intl";

export default function WishlistPage() {
  const locale = useLocale();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getWishlist(), getDevices(undefined, locale)])
      .then(([list, all]) => {
        setItems(list);
        setDevices(all);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      )
      .finally(() => setLoading(false));
  }, [locale]);

  const wishIds = new Set(items.map((i) => i.device.id));
  const available = devices.filter((d) => !wishIds.has(d.id));

  async function handleAdd() {
    const id = Number(selectedId);
    if (!id) return;
    const item = await addWishlistItem(id, {
      targetPrice: targetPrice ? Number(targetPrice) : null,
      alertEnabled: true,
    });
    setItems((prev) => [item, ...prev.filter((x) => x.device.id !== id)]);
    setSelectedId("");
    setTargetPrice("");
  }

  async function toggleAlert(item: WishlistItem) {
    const updated = await updateWishlistItem(item.device.id, {
      alertEnabled: !item.alertEnabled,
    });
    setItems((prev) =>
      prev.map((x) => (x.id === updated.id ? updated : x)),
    );
  }

  async function handleRemove(deviceId: number) {
    await removeWishlistItem(deviceId);
    setItems((prev) => prev.filter((x) => x.device.id !== deviceId));
  }

  if (loading) return <ProfileLoading />;
  if (error) return <ProfileError message={error} />;

  return (
    <>
      <ProfilePageHeader
        title="Wishlist & Price Alerts"
        description="Track phones you want and get notified when prices drop."
      />
      <ProfilePanel>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="">Add to wishlist…</option>
            {available.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            placeholder="Target $"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:w-32 dark:border-zinc-700 dark:bg-zinc-950"
          />
          <button
            type="button"
            onClick={() => void handleAdd()}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Add
          </button>
        </div>

        {items.length === 0 ? (
          <p className="mt-6 py-8 text-center text-sm text-gray-500">
            Your wishlist is empty.
          </p>
        ) : (
          <div className="mt-6">
            <SwipePagedList
              items={items}
              getKey={(item) => item.id}
              as="ul"
              wrapperClassName="space-y-3"
              listClassName="space-y-3"
              renderItem={(item) => (
                <li className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
                  <div>
                    <Link
                      href={`/phones/${item.device.slug}`}
                      className="font-semibold text-red-600 hover:underline"
                    >
                      {item.device.name}
                    </Link>
                    <p className="text-sm text-gray-500">
                      Current:{" "}
                      {item.device.price != null
                        ? `$${item.device.price.toLocaleString()}`
                        : "—"}{" "}
                      · Target:{" "}
                      {item.targetPrice != null
                        ? `$${item.targetPrice.toLocaleString()}`
                        : "Not set"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={item.alertEnabled}
                        onChange={() => void toggleAlert(item)}
                      />
                      Price alert
                    </label>
                    <button
                      type="button"
                      onClick={() => void handleRemove(item.device.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              )}
            />
          </div>
        )}
      </ProfilePanel>
    </>
  );
}
