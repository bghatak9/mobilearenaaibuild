"use client";

import { cn } from "@/design-system/utils/cn";

type Props = {
  brand?: string;
  displaySize?: string;
  /** Hero fill for main-strip — full 3D tilt, scaled to frame. */
  hero?: boolean;
};

/** Pure CSS 3D phone silhouette — shown when no product photo is uploaded. */
export function DeviceBrief3DPhone({ brand, displaySize, hero = false }: Props) {
  const monogram = brand?.charAt(0).toUpperCase() ?? "M";

  return (
    <div className={cn("arena-brief-3d", hero && "arena-brief-3d--hero")} aria-hidden>
      <div className="arena-brief-3d__glow" />
      <div className="arena-brief-3d__scene">
        <div className="arena-brief-3d__phone">
          <div className="arena-brief-3d__shell">
            <div className="arena-brief-3d__bezel">
              <div className="arena-brief-3d__screen">
                <div className="arena-brief-3d__screen-shine" />
                <span className="arena-brief-3d__monogram">{monogram}</span>
                {displaySize ? (
                  <span className="arena-brief-3d__display-size">
                    {displaySize}&quot;
                  </span>
                ) : null}
                <div className="arena-brief-3d__dock" />
              </div>
            </div>
            <div className="arena-brief-3d__side arena-brief-3d__side--left" />
            <div className="arena-brief-3d__side arena-brief-3d__side--right" />
            <div className="arena-brief-3d__back">
              <div className="arena-brief-3d__camera-module">
                <span />
                <span />
                <span />
              </div>
              <div className="arena-brief-3d__back-flare" />
            </div>
          </div>
        </div>
      </div>
      <div className="arena-brief-3d__shadow" />
    </div>
  );
}
