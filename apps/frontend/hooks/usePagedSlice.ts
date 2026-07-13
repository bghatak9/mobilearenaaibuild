"use client";

import { useEffect, useMemo, useState } from "react";

export function usePagedSlice<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / Math.max(pageSize, 1)));

  useEffect(() => {
    setPage(1);
  }, [items, pageSize]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const slice = useMemo(() => {
    if (pageSize <= 0 || items.length <= pageSize) return items;
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return {
    page,
    setPage,
    totalPages,
    slice,
    canPrev,
    canNext,
    goNext: () => setPage((p) => Math.min(totalPages, p + 1)),
    goPrev: () => setPage((p) => Math.max(1, p - 1)),
    isPaginated: items.length > pageSize,
  };
}
