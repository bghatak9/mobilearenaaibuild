"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/design-system/utils/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <label className="block w-full text-sm">
        {label && (
          <span className="mb-1.5 block font-medium text-[var(--text-primary)]">
            {label}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-2.5",
            "text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]",
            "outline-none transition duration-150",
            "focus:border-[var(--ma-brand)]/50 focus:ring-2 focus:ring-[var(--ma-brand)]/25",
            error && "border-red-500/50 focus:ring-red-500/25",
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {hint && !error && (
          <span id={`${inputId}-hint`} className="mt-1 block text-xs text-[var(--text-secondary)]">
            {hint}
          </span>
        )}
        {error && (
          <span id={`${inputId}-error`} className="mt-1 block text-xs text-red-400" role="alert">
            {error}
          </span>
        )}
      </label>
    );
  },
);
Input.displayName = "Input";
