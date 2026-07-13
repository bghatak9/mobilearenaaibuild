"use client";

import type { ReactNode } from "react";

import { SwipePageShell } from "@/components/phone/SwipePageShell";
import { useSwipePagination } from "@/hooks/useSwipePagination";
import { cn } from "@/design-system/utils/cn";

type SwipePagedListProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  getKey: (item: T, index: number) => string | number;
  /** Outer shell class */
  className?: string;
  /** Animated page wrapper — grid/stack classes */
  listClassName?: string;
  pageSize?: number;
  disabled?: boolean;
  /** Wrap items in ul/div inside the animated page */
  as?: "div" | "ul" | "fragment";
  wrapperClassName?: string;
};

export function SwipePagedList<T>({
  items,
  renderItem,
  getKey,
  className,
  listClassName,
  pageSize,
  disabled,
  as = "div",
  wrapperClassName,
}: SwipePagedListProps<T>) {
  const {
    page,
    totalPages,
    slice,
    swipeEnabled,
    goNextPage,
    goPrevPage,
    setPageWithDir,
    slideClassSuffix,
    isPaginated,
  } = useSwipePagination(items, { pageSize, disabled });

  const slideClassName = cn(
    listClassName,
    isPaginated && "arena-swipe-page-grid",
    slideClassSuffix,
  );

  const pageItems = slice.map((item, index) => (
    <span key={getKey(item, index)} className="contents">
      {renderItem(item, index)}
    </span>
  ));

  const children =
    as === "fragment" ? (
      pageItems
    ) : as === "ul" ? (
      <ul className={wrapperClassName}>{pageItems}</ul>
    ) : (
      <div className={wrapperClassName}>{pageItems}</div>
    );

  return (
    <SwipePageShell
      className={className}
      page={page}
      totalPages={totalPages}
      swipeEnabled={swipeEnabled}
      onSwipeLeft={goNextPage}
      onSwipeRight={goPrevPage}
      onPageChange={setPageWithDir}
      slideClassName={slideClassName}
    >
      {children}
    </SwipePageShell>
  );
}
