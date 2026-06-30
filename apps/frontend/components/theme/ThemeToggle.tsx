"use client";

import { Moon, Sun } from "lucide-react";

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
  nav: "",
};

export function ThemeToggle({
  variant = "header",
  showLabel = false,
  className = "",
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
      title={isDark ? "Day mode" : "Night mode"}
      className={`inline-flex items-center gap-2 rounded p-0.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${VARIANT_CLASS[variant]} ${className}`}
      suppressHydrationWarning
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
      {showLabel ? (
        <span className="text-xs">{isDark ? "Day mode" : "Night mode"}</span>
      ) : null}
    </button>
  );
}
