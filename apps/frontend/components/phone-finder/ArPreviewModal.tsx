"use client";

import { useRef, useState } from "react";
import { RotateCw, X } from "lucide-react";

import { Modal } from "@/design-system/modals/Modal";
import type { Device } from "@/lib/api";

const COLORS = ["Midnight", "Silver", "Gold", "Blue", "Green"];

export function ArPreviewModal({
  device,
  onClose,
}: {
  device: Device;
  onClose: () => void;
}) {
  const [rotation, setRotation] = useState(0);
  const [tilt, setTilt] = useState(12);
  const [placed, setPlaced] = useState(false);
  const [colorIdx, setColorIdx] = useState(0);
  const dragging = useRef(false);
  const lastX = useRef(0);

  const dims = device.dimensions ?? "146.7 × 71.5 × 7.8 mm";
  const image = device.images?.[colorIdx]?.url ?? device.images?.[0]?.url;

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true;
    lastX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    setRotation((r) => r + dx * 0.5);
  }

  function onPointerUp() {
    dragging.current = false;
  }

  return (
    <Modal open onClose={onClose} title={`AR Preview · ${device.name}`} size="lg">
      <div className="space-y-4">
        <p className="text-xs text-[var(--text-secondary)]">
          Place on a table, rotate 360°, and explore color variants. Dimensions: {dims}
          {device.weight != null ? ` · ${device.weight}g` : ""}
        </p>

        <div
          className={`relative flex h-72 items-end justify-center overflow-hidden rounded-2xl transition ${
            placed
              ? "bg-gradient-to-b from-[var(--dark-space)] to-[#1a1208]"
              : "bg-gradient-to-br from-[var(--arena-blue)]/20 to-[var(--aurora-purple)]/20"
          }`}
          style={{ perspective: "800px" }}
        >
          {placed && (
            <div className="absolute bottom-8 h-3 w-40 rounded-full bg-black/40 blur-md" />
          )}
          <div
            className="cursor-grab active:cursor-grabbing"
            style={{
              transform: `rotateY(${rotation}deg) rotateX(${tilt}deg) translateY(${placed ? "0" : "-20px"}) scale(${placed ? 1 : 0.9})`,
              transformStyle: "preserve-3d",
              transition: dragging.current ? "none" : "transform 0.15s ease",
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            <div className="relative flex h-48 w-24 items-center justify-center rounded-[28px] border-4 border-white/20 bg-gradient-to-b from-zinc-700 to-zinc-900 shadow-2xl">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt=""
                  className="h-full w-full rounded-[24px] object-contain p-1"
                  draggable={false}
                />
              ) : (
                <span className="text-4xl opacity-50">📱</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPlaced((p) => !p)}
            className="arena-btn-secondary text-xs"
          >
            {placed ? "Lift from table" : "Place on table"}
          </button>
          <button
            type="button"
            onClick={() => setRotation(0)}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs"
          >
            <RotateCw size={12} />
            Reset rotation
          </button>
          {COLORS.map((c, i) => (
            <button
              key={c}
              type="button"
              onClick={() => setColorIdx(i % (device.images?.length || 1))}
              className={`rounded-full border px-2.5 py-1 text-[11px] ${
                colorIdx === i % (device.images?.length || 1)
                  ? "border-[var(--electric-cyan)] text-[var(--electric-cyan)]"
                  : "border-white/10 text-[var(--text-secondary)]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <X size={16} />
          Close AR preview
        </button>
      </div>
    </Modal>
  );
}
