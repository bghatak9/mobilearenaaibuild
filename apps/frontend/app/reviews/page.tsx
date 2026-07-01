import Link from "next/link";
import { Star } from "lucide-react";

import { ArenaShell } from "@/components/layout/ArenaShell";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import { getReviews, type Review } from "@/lib/api";

export default async function ReviewsPage() {
  let reviews: Review[] = [];
  let error = false;
  try {
    reviews = await getReviews();
  } catch {
    error = true;
  }

  return (
    <ArenaShell>
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--electric-cyan)]">
          Editor&apos;s Arena
        </p>
        <h1 className="arena-page-title mt-2 font-extrabold text-[var(--text-primary)]">
          Reviews
        </h1>
      </header>

      {error ? (
        <p className="text-red-400">Couldn&apos;t load reviews. Is the API running?</p>
      ) : reviews.length === 0 ? (
        <SpectrumPanel className="p-8 text-center text-[var(--text-secondary)]">
          No reviews published yet.
        </SpectrumPanel>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
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
          ))}
        </div>
      )}
    </ArenaShell>
  );
}
