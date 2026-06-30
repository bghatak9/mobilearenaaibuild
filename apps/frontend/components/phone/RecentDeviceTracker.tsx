"use client";

import { useEffect } from "react";

import { trackRecentDevice } from "@/design-system/navigation/FloatingNav";

type Props = {
  slug: string;
  name: string;
};

export function RecentDeviceTracker({ slug, name }: Props) {
  useEffect(() => {
    trackRecentDevice({ slug, name });
  }, [slug, name]);
  return null;
}
