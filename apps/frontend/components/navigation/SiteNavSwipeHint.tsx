"use client";

import { SwipePagination } from "@/design-system/data/SwipePagination";

/** Inline pagination hint only (no section label). */
export function SwipeNavHelper({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <SwipePagination
      page={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
      showSwipeHint
    />
  );
}
