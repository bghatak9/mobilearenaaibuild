"use client";

import { useCallback, type MouseEvent } from "react";

import { getDeviceBySlug, type Device } from "@/lib/api";
import { useDeviceBriefOptional } from "@/lib/device-brief-context";

type BriefTarget = Device | { slug: string };

function isFullDevice(target: BriefTarget): target is Device {
  if (!("id" in target)) return false;
  return "display" in target || "cameras" in target || "battery" in target;
}

function shouldOpenInNewTab(e: MouseEvent) {
  return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
}

export function useDeviceBriefOpen() {
  const brief = useDeviceBriefOptional();

  const open = useCallback(
    async (target: BriefTarget) => {
      if (!brief) return;
      if (isFullDevice(target)) {
        brief.openBrief(target);
        return;
      }
      await brief.openBriefBySlug(target.slug);
    },
    [brief],
  );

  const onBriefClick = useCallback(
    (target: BriefTarget) => (e: MouseEvent<HTMLElement>) => {
      if (!brief || shouldOpenInNewTab(e)) return;
      e.preventDefault();
      void open(target);
    },
    [brief, open],
  );

  return { open, onBriefClick, enabled: Boolean(brief) };
}
