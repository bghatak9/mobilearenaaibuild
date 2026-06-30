"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/design-system/utils/cn";

const variants = {
  primary:
    "bg-gradient-to-r from-[var(--arena-blue)] to-[var(--electric-cyan)] text-white shadow-md hover:shadow-[var(--arena-blue)]/30 hover:-translate-y-px",
  secondary:
    "border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--ma-surface-page)]",
  ghost:
    "text-[var(--muted)] hover:bg-[var(--ma-surface-page)] hover:text-[var(--foreground)]",
  danger: "bg-red-600/90 text-white hover:bg-red-500",
} as const;

const sizes = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
} as const;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold transition duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--electric-cyan)]/50",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
