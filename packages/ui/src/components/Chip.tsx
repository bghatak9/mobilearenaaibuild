import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  accent?: string;
  children: ReactNode;
};

export function Chip({
  accent,
  className,
  style,
  children,
  ...props
}: ChipProps) {
  return (
    <span
      className={cn("titan-chip", className)}
      style={
        accent
          ? {
              ...style,
              borderColor: `${accent}44`,
              color: accent,
            }
          : style
      }
      {...props}
    >
      {children}
    </span>
  );
}
