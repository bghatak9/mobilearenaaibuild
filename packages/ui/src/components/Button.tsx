import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export type ButtonVariant = "primary" | "success" | "warning" | "ghost";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "titan-btn-primary",
  success: "titan-btn-success",
  warning: "titan-btn-warning",
  ghost: "titan-btn-ghost",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  animated?: boolean;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  animated = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "titan-btn",
        VARIANT_CLASS[variant],
        animated && variant === "primary" && "titan-gradient-neon-animated",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
