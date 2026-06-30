import type { ReactNode } from "react";

import { cn } from "@/design-system/utils/cn";

type SocialContinueButtonProps = {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  overlay?: ReactNode;
};

export function SocialContinueButton({
  label,
  icon,
  onClick,
  disabled = false,
  loading = false,
  className,
  overlay,
}: SocialContinueButtonProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={onClick}
        className={cn(
          "social-continue-btn flex w-full min-w-0 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition duration-200",
          "border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-primary)]",
          "hover:border-[var(--border-accent)] hover:bg-white/10 hover:shadow-md",
          "disabled:cursor-not-allowed disabled:opacity-45",
          overlay && "pointer-events-none",
        )}
      >
        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
          {icon}
        </span>
        <span>{loading ? "Please wait…" : label}</span>
      </button>
      {overlay ? (
        <div className="absolute inset-0 overflow-hidden rounded-lg opacity-[0.02] [&_iframe]:!h-full [&_iframe]:!w-full [&>div]:!h-full [&>div]:!w-full">
          {overlay}
        </div>
      ) : null}
    </div>
  );
}
