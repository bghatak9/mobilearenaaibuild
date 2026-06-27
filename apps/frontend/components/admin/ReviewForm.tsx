"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getDevices, type Device, type Review, type ReviewInput } from "@/lib/api";

function linesToArray(value: string): string[] {
  return value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export default function ReviewForm({
  initial,
  onSubmit,
  submitLabel = "Save",
  lockDevice = false,
}: {
  initial?: Partial<Review>;
  onSubmit: (input: ReviewInput) => Promise<void>;
  submitLabel?: string;
  lockDevice?: boolean;
}) {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [score, setScore] = useState(initial?.score ?? 8);
  const [deviceId, setDeviceId] = useState<number | "">(
    initial?.deviceId ?? initial?.device?.id ?? "",
  );
  const [pros, setPros] = useState(
    Array.isArray(initial?.pros) ? initial!.pros.join("\n") : "",
  );
  const [cons, setCons] = useState(
    Array.isArray(initial?.cons) ? initial!.cons.join("\n") : "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDevices()
      .then(setDevices)
      .catch(() => setError("Could not load devices."));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (deviceId === "") {
      setError("Please choose a device.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        title,
        content,
        score: Number(score),
        deviceId: Number(deviceId),
        pros: linesToArray(pros),
        cons: linesToArray(cons),
      });
      router.push("/admin/reviews");
      router.refresh();
    } catch {
      setError("Save failed. Check the fields and try again.");
    } finally {
      setSaving(false);
    }
  }

  const field = "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500";
  const labelCls = "block text-sm font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-5">
      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {error}
        </p>
      )}

      <label className={labelCls}>
        Title
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={field}
        />
      </label>

      <div className="flex flex-wrap gap-6">
        <label className={`${labelCls} flex-1`}>
          Device
          <select
            value={deviceId}
            disabled={lockDevice}
            onChange={(e) =>
              setDeviceId(e.target.value === "" ? "" : Number(e.target.value))
            }
            className={`${field} disabled:bg-gray-100`}
          >
            <option value="">Select a device…</option>
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        <label className={labelCls}>
          Score (0–10)
          <input
            type="number"
            min={0}
            max={10}
            step={0.1}
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            className={`${field} w-32`}
          />
        </label>
      </div>

      <label className={labelCls}>
        Content
        <textarea
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className={field}
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelCls}>
          Pros (one per line)
          <textarea
            value={pros}
            onChange={(e) => setPros(e.target.value)}
            rows={5}
            className={field}
          />
        </label>
        <label className={labelCls}>
          Cons (one per line)
          <textarea
            value={cons}
            onChange={(e) => setCons(e.target.value)}
            rows={5}
            className={field}
          />
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-500 disabled:opacity-60"
        >
          {saving ? "Saving…" : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/reviews")}
          className="rounded-lg border border-gray-300 px-5 py-2 font-semibold text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
