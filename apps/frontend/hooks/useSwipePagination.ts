"use client";

import { useCallback, useState } from "react";

import { useClientMounted } from "@/hooks/useClientMounted";
import { usePagedSlice } from "@/hooks/usePagedSlice";
import { useResponsiveSwipePageSize } from "@/hooks/useResponsiveSwipePageSize";

type Options = {
  pageSize?: number;
  disabled?: boolean;
};

export function useSwipePagination<T>(items: T[], options: Options = {}) {
  const mounted = useClientMounted();
  const responsivePageSize = useResponsiveSwipePageSize();
  const { pageSize: customPageSize, disabled = false } = options;

  const pageSize =
    mounted && !disabled
      ? (customPageSize ?? responsivePageSize)
      : Math.max(items.length, 1);

  const pager = usePagedSlice(items, pageSize);
  const [slideDir, setSlideDir] = useState<"forward" | "back">("forward");

  const swipeEnabled = mounted && !disabled && pager.isPaginated;

  const goNextPage = useCallback(() => {
    if (!pager.canNext) return;
    setSlideDir("forward");
    pager.goNext();
  }, [pager.canNext, pager.goNext]);

  const goPrevPage = useCallback(() => {
    if (!pager.canPrev) return;
    setSlideDir("back");
    pager.goPrev();
  }, [pager.canPrev, pager.goPrev]);

  const setPageWithDir = useCallback(
    (next: number) => {
      setSlideDir(next > pager.page ? "forward" : "back");
      pager.setPage(next);
    },
    [pager.page, pager.setPage],
  );

  const slideClassSuffix = pager.isPaginated
    ? slideDir === "back"
      ? "arena-swipe-page-enter-back"
      : "arena-swipe-page-enter"
    : "";

  return {
    ...pager,
    pageSize,
    slideDir,
    slideClassSuffix,
    swipeEnabled,
    goNextPage,
    goPrevPage,
    setPageWithDir,
  };
}
