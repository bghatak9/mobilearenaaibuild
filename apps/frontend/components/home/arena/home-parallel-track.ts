import { cn } from "@/design-system/utils/cn";

/** Landscape cards in a responsive grid that fills the content width. */
export function homeParallelTrackClass(columns: 3 | 4 | 5 = 4) {
  return cn(
    "arena-home-parallel-track grid w-full min-w-0 max-w-full gap-3 sm:gap-4",
    columns === 3 && "grid-cols-1 md:grid-cols-3",
    columns === 4 && "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
    columns === 5 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5",
  );
}

export const HOME_PARALLEL_CHIP_CLASS = "w-full min-w-0";
