"use client";

import { Link } from "@/i18n/navigation";
import { Star } from "lucide-react";

import { SwipePagedList } from "@/components/ui/SwipePagedList";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import type { Review } from "@/lib/api";

export function ReviewsList({ reviews }: { reviews: Review[] }) {
  return (
    <>
      <SwipePagedList
      items={reviews}
      getKey={(review) => review.id}
      listClassName="space-y-4"
      renderItem={(review) => (
        <Link key={review.id} href={`/reviews/${review.slug}`}>
          <SpectrumPanel className="flex items-center justify-between gap-3 p-4 sm:gap-4 sm:p-5">
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-[var(--text-primary)] sm:text-lg">
                {review.title}
              </h2>
              {review.device && (
                <p className="text-sm text-[var(--text-secondary)]">
                  {review.device.name}
                </p>
              )}
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--premium-gold)]/15 px-3 py-1 font-bold text-[var(--premium-gold)]">
              <Star size={15} className="fill-current" />
              {review.score.toFixed(1)}
            </span>
          </SpectrumPanel>
        </Link>
      )}
    />
    </>
  );
}
