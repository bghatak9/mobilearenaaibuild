"use client";

import { useEffect, useState } from "react";
import { getDevices, type Device } from "@/lib/api";
import PhoneCard from "./PhoneCard";

export default function PhoneGrid({
  search,
  devices: controlled,
}: {
  search?: string;
  devices?: Device[];
}) {
  const [devices, setDevices] = useState<Device[]>(controlled ?? []);
  const [loading, setLoading] = useState(!controlled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (controlled) {
      setDevices(controlled);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    getDevices(search)
      .then((data) => {
        if (active) setDevices(data);
      })
      .catch(() => {
        if (active) setError("Could not load devices. Is the API running?");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search, controlled]);

  if (loading) return <p className="p-4 text-gray-500">Loading devices…</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!devices.length)
    return <p className="p-4 text-gray-500">No devices found.</p>;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {devices.map((device) => (
        <PhoneCard key={device.id} device={device} />
      ))}
    </div>
  );
}
