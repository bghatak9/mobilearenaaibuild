import type { HTMLAttributes } from "react";

import { cn } from "@/design-system/utils/cn";

type AvatarProps = HTMLAttributes<HTMLDivElement> & {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
};

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
} as const;

function initials(name?: string | null, email?: string) {
  const source = name?.trim() || email?.trim() || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function Avatar({
  src,
  name,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const label = name ?? "User";

  if (src) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full ring-2 ring-white/10",
          sizes[size],
          className,
        )}
        {...props}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={label} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      aria-label={label}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--arena-blue)] to-[var(--aurora-purple)] font-bold text-white ring-2 ring-white/10",
        sizes[size],
        className,
      )}
      {...props}
    >
      {initials(name)}
    </div>
  );
}
