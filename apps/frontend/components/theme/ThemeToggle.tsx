"use client";

import { Moon, Sun } from "lucide-react";

import { useClientMounted } from "@/hooks/useClientMounted";
import { useTheme } from "@/lib/theme";

type ThemeToggleProps = {
  /** Visual context for the toggle button. */
  variant?: "header" | "admin" | "light" | "nav";
  /** Show Day/Night text label beside the icon (admin sidebar). */
  showLabel?: boolean;
  className?: string;
};

const VARIANT_CLASS: Record<NonNullable<ThemeToggleProps["variant"]>, string> = {
  header: "text-zinc-300 hover:text-white",
  admin:
    "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white",
  light:
    "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white",
  nav: "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
};

export function ThemeToggle({
  variant = "header",
  showLabel = false,
  className = "",
}: ThemeToggleProps) {
  const { theme, toggleTheme, ready } = useTheme();
  const mounted = useClientMounted();
  const isDark = theme === "dark";
  const showIcon = mounted && ready;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        showIcon
          ? isDark
            ? "Switch to day mode"
            : "Switch to night mode"
          : "Toggle theme"
      }
      title={showIcon ? (isDark ? "Day mode" : "Night mode") : "Toggle theme"}
      className={`inline-flex items-center justify-center gap-2 rounded p-0.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] ${VARIANT_CLASS[variant]} ${className}`}
      suppressHydrationWarning
    >
      {showIcon ? (
        isDark ? (
          <Sun size={18} aria-hidden />
        ) : (
          <Moon size={18} aria-hidden />
        )
      ) : (
        <span className="inline-block h-[18px] w-[18px] shrink-0" aria-hidden />
      )}
      {showLabel && showIcon ? (
        <span className="text-xs">{isDark ? "Day mode" : "Night mode"}</span>
      ) : null}
    </button>
  );
}
