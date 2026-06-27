"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import type { Device } from "@/lib/api";
import CompareButton from "@/components/compare/CompareButton";

export default function PhoneCard({ device }: { device: Device }) {
  const image = device.images?.[0]?.url ?? null;

  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <Link href={`/phones/${device.slug}`} className="block">
        <div className="mb-3 flex h-36 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={device.name}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-sm text-gray-400">No image</span>
          )}
        </div>

        <h2 className="text-base font-semibold text-gray-900">
          {device.name}
        </h2>
        <p className="text-sm text-gray-500">
          {device.brand?.name ?? "Unknown brand"}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <span className="font-semibold text-emerald-600">
            {device.price != null ? `$${device.price}` : "—"}
          </span>
          {device.rating != null && (
            <span className="inline-flex items-center gap-1 text-sm text-amber-500">
              <Star size={14} className="fill-amber-400 stroke-amber-400" />
              {device.rating.toFixed(1)}
            </span>
          )}
        </div>
      </Link>

      <div className="mt-3">
        <CompareButton
          device={{ id: device.id, slug: device.slug, name: device.name }}
          className="w-full"
        />
      </div>
    </div>
  );
}
