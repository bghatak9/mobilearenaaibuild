import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  premium?: boolean;
  children: ReactNode;
};

export function Badge({
  premium = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        premium ? "titan-badge-premium" : "titan-chip",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
