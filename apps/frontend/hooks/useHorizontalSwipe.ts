"use client";

import { useEffect, useRef, type RefObject } from "react";

type Options = {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  enabled?: boolean;
  /** Minimum horizontal distance in px to count as a swipe. */
  threshold?: number;
};

/**
 * Pointer-based horizontal swipe on a container ref.
 * Uses capture-phase listeners so gestures work over links/cards, and
 * setPointerCapture only after horizontal intent (buttons still tap).
 */
export function useHorizontalSwipe<T extends HTMLElement = HTMLDivElement>({
  onSwipeLeft,
  onSwipeRight,
  enabled = true,
  threshold = 40,
}: Options) {
  const ref = useRef<T | null>(null);
  const startRef = useRef<{ x: number; y: number; id: number } | null>(null);
  const intentRef = useRef<"horizontal" | "vertical" | null>(null);
  const swipedRef = useRef(false);

  const onSwipeLeftRef = useRef(onSwipeLeft);
  const onSwipeRightRef = useRef(onSwipeRight);

  useEffect(() => {
    onSwipeLeftRef.current = onSwipeLeft;
    onSwipeRightRef.current = onSwipeRight;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const reset = () => {
      startRef.current = null;
      intentRef.current = null;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      startRef.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
      intentRef.current = null;
      swipedRef.current = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      const start = startRef.current;
      if (!start || start.id !== e.pointerId) return;

      const dx = Math.abs(e.clientX - start.x);
      const dy = Math.abs(e.clientY - start.y);
      if (dx < 8 && dy < 8) return;

      if (!intentRef.current) {
        intentRef.current = dx > dy ? "horizontal" : "vertical";
        if (intentRef.current === "horizontal") {
          try {
            el.setPointerCapture(e.pointerId);
          } catch {
            /* ignore */
          }
        }
      }

      if (intentRef.current === "horizontal" && dx > 12) {
        e.preventDefault();
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      const start = startRef.current;
      if (!start || start.id !== e.pointerId) return;

      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      const intent = intentRef.current;

      try {
        if (el.hasPointerCapture(e.pointerId)) {
          el.releasePointerCapture(e.pointerId);
        }
      } catch {
        /* ignore */
      }

      reset();

      if (intent === "vertical") return;
      if (Math.abs(dx) < threshold) return;
      if (Math.abs(dx) < Math.abs(dy)) return;

      swipedRef.current = true;
      window.setTimeout(() => {
        swipedRef.current = false;
      }, 400);

      if (dx < 0) {
        // In RTL, a leftward swipe advances toward the "start" visually —
        // invert so next/prev still feel natural for reading direction.
        const rtl =
          typeof document !== "undefined" &&
          document.documentElement.dir === "rtl";
        if (rtl) onSwipeRightRef.current?.();
        else onSwipeLeftRef.current?.();
      } else {
        const rtl =
          typeof document !== "undefined" &&
          document.documentElement.dir === "rtl";
        if (rtl) onSwipeLeftRef.current?.();
        else onSwipeRightRef.current?.();
      }
    };

    const onPointerCancel = (e: PointerEvent) => {
      if (startRef.current?.id !== e.pointerId) return;
      try {
        if (el.hasPointerCapture(e.pointerId)) {
          el.releasePointerCapture(e.pointerId);
        }
      } catch {
        /* ignore */
      }
      reset();
    };

    const onClickCapture = (e: MouseEvent) => {
      if (!swipedRef.current) return;
      e.preventDefault();
      e.stopPropagation();
    };

    const captureOpts = { capture: true };
    const moveOpts = { capture: true, passive: false };

    el.addEventListener("pointerdown", onPointerDown, captureOpts);
    el.addEventListener("pointermove", onPointerMove, moveOpts);
    el.addEventListener("pointerup", onPointerUp, captureOpts);
    el.addEventListener("pointercancel", onPointerCancel, captureOpts);
    el.addEventListener("click", onClickCapture, captureOpts);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown, captureOpts);
      el.removeEventListener("pointermove", onPointerMove, moveOpts);
      el.removeEventListener("pointerup", onPointerUp, captureOpts);
      el.removeEventListener("pointercancel", onPointerCancel, captureOpts);
      el.removeEventListener("click", onClickCapture, captureOpts);
    };
  }, [enabled, threshold]);

  return ref as RefObject<T>;
}
