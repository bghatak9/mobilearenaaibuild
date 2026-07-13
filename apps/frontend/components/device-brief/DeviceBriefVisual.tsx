"use client";

import { useState } from "react";

import { DeviceBrief3DPhone } from "@/components/device-brief/DeviceBrief3DPhone";
import type { DeviceBriefData } from "@/features/device-brief";
import { cn } from "@/design-system/utils/cn";

type Props = {
  brief: DeviceBriefData;
  deviceName: string;
  compact?: boolean;
  /** Fill the main-strip frame edge-to-edge (detail page hero). */
  fitFrame?: boolean;
};

export function DeviceBriefVisual({
  brief,
  deviceName,
  compact = false,
  fitFrame = false,
}: Props) {
  const images = brief.gallery;
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const activeImage = images[activeIndex] ?? images[0];
  const showPhoto = Boolean(activeImage) && !imageError;

  return (
    <div
      className={cn(
        "arena-brief__visual",
        compact && "arena-brief__visual--compact",
        fitFrame && "arena-brief__visual--fit",
      )}
    >
      <div
        className={cn(
          "arena-brief__stage",
          !showPhoto && "arena-brief__stage--3d",
          fitFrame && "arena-brief__stage--fit",
        )}
        aria-label={`${deviceName} product visual`}
      >
        <div className="arena-brief__stage-aura" aria-hidden />
        <div className="arena-brief__stage-grid" aria-hidden />
        <div className="arena-brief__stage-pedestal" aria-hidden />

        <div className="arena-brief__stage-content">
          {showPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeImage}
              alt={deviceName}
              className="arena-brief__stage-device"
              onError={() => setImageError(true)}
            />
          ) : (
            <DeviceBrief3DPhone
              brand={brief.brand}
              displaySize={brief.displaySize}
              hero={fitFrame}
            />
          )}
        </div>
      </div>

      {images.length > 1 && showPhoto ? (
        <div className="arena-brief__thumbs" role="tablist" aria-label="Device gallery">
          {images.slice(0, 5).map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`View image ${index + 1}`}
              className={cn(
                "arena-brief__thumb",
                index === activeIndex && "arena-brief__thumb--active",
              )}
              onClick={() => {
                setImageError(false);
                setActiveIndex(index);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
