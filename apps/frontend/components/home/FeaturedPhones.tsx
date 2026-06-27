"use client";

import { useEffect, useState } from "react";
import { getDevices, type Device } from "@/lib/api";
import PhoneCard from "@/components/phone/PhoneCard";

export default function FeaturedPhones() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDevices()
      .then((data) => {
        const top = [...data]
          .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
          .slice(0, 4);
        setDevices(top);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="lg:col-span-2">
      <h2 className="mb-4 text-xl font-bold text-gray-900">Top Rated Phones</h2>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : devices.length === 0 ? (
        <p className="text-gray-500">No phones yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {devices.map((device) => (
            <PhoneCard key={device.id} device={device} />
          ))}
        </div>
      )}
    </div>
  );
}
