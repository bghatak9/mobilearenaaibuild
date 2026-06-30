import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/design-system/utils/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  glass?: boolean;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
};

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  children,
  className,
  glass = true,
  hover = false,
  padding = "md",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[20px] border border-[var(--border-subtle)]",
        glass && "glass-panel",
        !glass && "bg-[var(--surface-card)]",
        hover &&
          "transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20",
        paddingMap[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
