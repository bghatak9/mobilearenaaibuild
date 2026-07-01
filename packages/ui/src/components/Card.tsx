import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
  children: ReactNode;
};

export function Card({
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "titan-card",
        interactive && "titan-card-interactive",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
