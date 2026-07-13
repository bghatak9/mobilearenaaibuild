"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { DeviceBriefModal } from "@/components/device-brief/DeviceBriefModal";
import type { PriceCurrency } from "@/features/phone-finder/types";
import { getDeviceBySlug, type Device } from "@/lib/api";
import { useCompare } from "@/lib/compare-context";
import { useLocale } from "next-intl";

type DeviceBriefContextValue = {
  openBrief: (device: Device) => void;
  openBriefBySlug: (slug: string) => Promise<void>;
  closeBrief: () => void;
  briefDevice: Device | null;
  briefLoading: boolean;
};

const DeviceBriefContext = createContext<DeviceBriefContextValue | null>(null);

export function DeviceBriefProvider({
  children,
  currency = "USD",
}: {
  children: ReactNode;
  currency?: PriceCurrency;
}) {
  const [device, setDevice] = useState<Device | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const compare = useCompare();
  const locale = useLocale();

  const openBrief = useCallback((next: Device) => {
    setBriefLoading(false);
    setDevice(next);
  }, []);

  const openBriefBySlug = useCallback(
    async (slug: string) => {
      setBriefLoading(true);
      setDevice(null);
      try {
        const loaded = await getDeviceBySlug(slug, locale);
        setDevice(loaded);
      } catch {
        setDevice(null);
      } finally {
        setBriefLoading(false);
      }
    },
    [locale],
  );

  const closeBrief = useCallback(() => {
    setBriefLoading(false);
    setDevice(null);
  }, []);

  const value = useMemo(
    () => ({
      openBrief,
      openBriefBySlug,
      closeBrief,
      briefDevice: device,
      briefLoading,
    }),
    [openBrief, openBriefBySlug, closeBrief, device, briefLoading],
  );

  return (
    <DeviceBriefContext.Provider value={value}>
      {children}
      <DeviceBriefModal
        device={device}
        loading={briefLoading}
        open={device != null || briefLoading}
        onClose={closeBrief}
        currency={currency}
        inCompare={device ? compare.has(device.slug) : false}
        compareDisabled={
          device ? compare.isFull && !compare.has(device.slug) : false
        }
        onCompare={() => {
          if (!device) return;
          compare.toggle({
            id: device.id,
            slug: device.slug,
            name: device.name,
          });
        }}
      />
    </DeviceBriefContext.Provider>
  );
}

export function useDeviceBrief() {
  const ctx = useContext(DeviceBriefContext);
  if (!ctx) {
    throw new Error("useDeviceBrief must be used within DeviceBriefProvider");
  }
  return ctx;
}

/** Safe hook for optional brief opening (e.g. cards rendered outside provider). */
export function useDeviceBriefOptional() {
  return useContext(DeviceBriefContext);
}
