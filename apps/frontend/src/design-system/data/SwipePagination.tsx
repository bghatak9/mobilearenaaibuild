"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/design-system/utils/cn";
import { Button } from "@/design-system/buttons/Button";

type SwipePaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  /** Show swipe hint (mobile). */
  showSwipeHint?: boolean;
};

export function SwipePagination({
  page,
  totalPages,
  onPageChange,
  className,
  showSwipeHint = false,
}: SwipePaginationProps) {
  const t = useTranslations("common");
  if (totalPages <= 1) return null;

  return (
    <div className={cn("mt-5 space-y-3", className)}>
      {showSwipeHint ? (
        <p className="text-center text-[11px] font-medium leading-relaxed text-[var(--text-secondary)]">
          {t("swipeNext")}
          <span className="mx-1.5 text-white/20" aria-hidden>
            ·
          </span>
          {t("swipePrev")}
        </p>
      ) : null}

      <nav
        className="flex items-center justify-center gap-2"
        aria-label={t("pagination")}
      >
        <Button
          variant="ghost"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label={t("previousPage")}
          className="shrink-0"
        >
          <ChevronLeft size={16} className="arena-rtl-mirror" />
        </Button>

        <div className="flex max-w-[10rem] items-center justify-center gap-1.5 overflow-hidden" aria-hidden>
          {totalPages <= 8 ? (
            Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={cn(
                  "h-2 shrink-0 rounded-full transition-all",
                  p === page
                    ? "w-6 bg-[var(--electric-cyan)]"
                    : "w-2 bg-white/20 hover:bg-white/35",
                )}
                aria-label={t("pageOf", { page: p, total: totalPages })}
              />
            ))
          ) : (
            <span className="h-2 w-6 rounded-full bg-[var(--electric-cyan)]" />
          )}
        </div>

        <span className="min-w-[4.5rem] text-center text-xs font-semibold text-[var(--text-secondary)]">
          {page} / {totalPages}
        </span>

        <Button
          variant="ghost"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label={t("nextPage")}
          className="shrink-0"
        >
          <ChevronRight size={16} className="arena-rtl-mirror" />
        </Button>
      </nav>
    </div>
  );
}
