import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";

import { cn } from "@/design-system/utils/cn";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.label + i} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight
                  size={14}
                  className="text-[var(--text-secondary)]"
                  aria-hidden
                />
              )}
              {last || !item.href ? (
                <span
                  className={cn(
                    "min-w-0 max-w-full",
                    last
                      ? "line-clamp-2 font-medium break-words text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)]",
                  )}
                  aria-current={last ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-[var(--text-secondary)] hover:text-[var(--ma-brand)]"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
