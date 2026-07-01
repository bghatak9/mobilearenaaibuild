import type { InputHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  inputSize?: "sm" | "md" | "lg";
};

const SIZE_CLASS = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-4 py-3 text-base",
};

export function Input({
  inputSize = "md",
  className,
  ...props
}: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-[var(--radius-button)] border border-border-soft bg-surface-2 text-text-primary placeholder:text-text-muted outline-none transition",
        "focus:border-border-strong focus:ring-1 focus:ring-blue/40",
        SIZE_CLASS[inputSize],
        className,
      )}
      {...props}
    />
  );
}
