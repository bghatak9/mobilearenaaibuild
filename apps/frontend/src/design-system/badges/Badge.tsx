import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/design-system/utils/cn";

const variants = {
  default:
    "bg-white/5 text-[var(--text-secondary)] border border-[var(--border-subtle)]",
  gold: "bg-[var(--premium-gold)]/12 text-[var(--premium-gold)] border border-[var(--premium-gold)]/25",
  cyan: "bg-[var(--electric-cyan)]/12 text-[var(--electric-cyan)] border border-[var(--electric-cyan)]/25",
  success:
    "bg-[var(--emerald-success)]/12 text-[var(--emerald-success)] border border-[var(--emerald-success)]/25",
  purple:
    "bg-[var(--aurora-purple)]/12 text-[var(--aurora-purple)] border border-[var(--aurora-purple)]/25",
} as const;

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: keyof typeof variants;
};

export function Badge({
  children,
  variant = "default",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
