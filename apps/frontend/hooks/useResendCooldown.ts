"use client";

import { useCallback, useEffect, useState } from "react";

export const RESEND_COOLDOWN_SECONDS = 120;

export function formatCooldown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

export function useResendCooldown(initialSeconds = 0) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timerId = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [secondsLeft]);

  const startCooldown = useCallback(
    (seconds = RESEND_COOLDOWN_SECONDS) => {
      setSecondsLeft(seconds);
    },
    [],
  );

  return {
    secondsLeft,
    canResend: secondsLeft === 0,
    startCooldown,
  };
}
