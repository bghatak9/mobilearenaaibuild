import { cn } from "@/design-system/utils/cn";

type SkeletonProps = {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
};

export function Skeleton({ className, variant = "rectangular" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-white/10",
        variant === "text" && "h-4 w-full rounded-md",
        variant === "circular" && "rounded-full",
        variant === "rectangular" && "rounded-xl",
        className,
      )}
      aria-hidden
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="spectrum-panel space-y-4 rounded-[24px] p-6">
      <Skeleton className="h-40 w-full" />
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton variant="text" className="w-1/2" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
