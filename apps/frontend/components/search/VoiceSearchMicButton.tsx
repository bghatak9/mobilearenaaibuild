"use client";

import { Mic } from "lucide-react";

import { cn } from "@/design-system/utils/cn";

type VoiceSearchMicButtonProps = {
  listening: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  size?: number;
};

export function VoiceSearchMicButton({
  listening,
  disabled,
  onClick,
  className,
  size = 16,
}: VoiceSearchMicButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "shrink-0 rounded-full p-1.5 text-[var(--text-secondary)] transition hover:bg-white/5 hover:text-[var(--text-primary)] disabled:opacity-40",
        listening && "text-[var(--rose-alert)]",
        className,
      )}
      aria-label={listening ? "Stop voice search" : "Start voice search"}
      aria-pressed={listening}
      title={listening ? "Stop listening" : "Speak to search"}
    >
      <Mic size={size} className={listening ? "animate-pulse" : ""} />
    </button>
  );
}
