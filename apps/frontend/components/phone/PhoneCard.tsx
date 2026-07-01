"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import type { Device } from "@/lib/api";
import CompareButton from "@/components/compare/CompareButton";
import {
  Card,
  Chip,
  getBrandColor,
  getCategoryClass,
  cn,
} from "@mobilearena/ui";

export default function PhoneCard({ device }: { device: Device }) {
  const image = device.images?.[0]?.url ?? null;
  const brandColor = getBrandColor(device.brand?.name);
  const categoryClass = getCategoryClass(
    device.category?.slug ?? device.category?.name,
  );

  return (
    <Card
      interactive
      className={cn("flex flex-col p-4", categoryClass)}
    >
      <Link href={`/phones/${device.slug}`} className="block">
        <div className="mb-3 flex h-36 items-center justify-center overflow-hidden rounded-[var(--radius-image)] bg-surface-2">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={device.name}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-sm text-text-muted">No image</span>
          )}
        </div>

        <h2 className="text-base font-semibold text-text-primary">
          {device.name}
        </h2>
        <p className="text-sm text-text-muted">
          <span style={{ color: brandColor }}>{device.brand?.name ?? "Unknown brand"}</span>
        </p>

        {device.category?.name && (
          <Chip accent="var(--accent)" className="mt-2">
            {device.category.name}
          </Chip>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="titan-mono font-semibold text-green">
            {device.price != null ? `$${device.price}` : "—"}
          </span>
          {device.rating != null && (
            <span className="inline-flex items-center gap-1 text-sm text-orange">
              <Star size={14} className="fill-orange stroke-orange" />
              <span className="titan-mono">{device.rating.toFixed(1)}</span>
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
    </Card>
  );
}
