"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/design-system/utils/cn";

export type DropdownItem = {
  label: string;
  onClick?: () => void;
  href?: string;
  destructive?: boolean;
};

type DropdownProps = {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
};

export function Dropdown({
  trigger,
  items,
  align = "right",
  className,
}: DropdownProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (
        detailsRef.current?.open &&
        !detailsRef.current.contains(e.target as Node)
      ) {
        detailsRef.current.open = false;
      }
    }
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <details ref={detailsRef} className={cn("relative inline-block", className)}>
      <summary className="flex cursor-pointer list-none items-center gap-1 [&::-webkit-details-marker]:hidden">
        {trigger}
        <ChevronDown size={14} className="text-[var(--text-secondary)]" />
      </summary>
      <div
        className={cn(
          "glass-panel absolute z-50 mt-2 min-w-[10rem] overflow-hidden rounded-xl py-1 shadow-lg",
          align === "right" ? "right-0" : "left-0",
        )}
        role="menu"
      >
        {items.map((item) =>
          item.href ? (
            <a
              key={item.label}
              href={item.href}
              className="block px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-white/5"
              role="menuitem"
            >
              {item.label}
            </a>
          ) : (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                item.onClick?.();
                if (detailsRef.current) detailsRef.current.open = false;
              }}
              className={cn(
                "block w-full px-4 py-2 text-left text-sm hover:bg-white/5",
                item.destructive ? "text-red-400" : "text-[var(--text-primary)]",
              )}
              role="menuitem"
            >
              {item.label}
            </button>
          ),
        )}
      </div>
    </details>
  );
}
