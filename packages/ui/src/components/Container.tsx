import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  wide?: boolean;
};

export function Container({
  wide = false,
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4",
        wide ? "max-w-7xl" : "max-w-[var(--container-max)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
