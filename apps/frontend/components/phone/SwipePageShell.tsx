"use client";

import type { ReactNode } from "react";

import { SwipePagination } from "@/design-system/data/SwipePagination";
import { useHorizontalSwipe } from "@/hooks/useHorizontalSwipe";
import { cn } from "@/design-system/utils/cn";

type SwipePageShellProps = {
  children: ReactNode;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  swipeEnabled: boolean;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  slideClassName?: string;
  className?: string;
};

export function SwipePageShell({
  children,
  page,
  totalPages,
  onPageChange,
  swipeEnabled,
  onSwipeLeft,
  onSwipeRight,
  slideClassName,
  className,
}: SwipePageShellProps) {
  const swipeRef = useHorizontalSwipe({
    enabled: swipeEnabled,
    onSwipeLeft,
    onSwipeRight,
  });

  const showPagination = totalPages > 1;

  return (
    <div
      ref={swipeRef}
      className={cn(
        "min-w-0",
        showPagination && "arena-swipe-page-shell",
        className,
      )}
    >
      <div key={page} className={slideClassName}>
        {children}
      </div>

      {showPagination ? (
        <SwipePagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
          showSwipeHint={swipeEnabled}
        />
      ) : null}
    </div>
  );
}
