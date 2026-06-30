import Link from "next/link";
import { Star } from "lucide-react";

import { ArenaShell } from "@/components/layout/ArenaShell";
import { GlassPanel } from "@/design-system/glass/GlassPanel";
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
        <h1 className="mt-2 text-3xl font-extrabold text-[var(--text-primary)]">
          Reviews
        </h1>
      </header>

      {error ? (
        <p className="text-red-400">Couldn&apos;t load reviews. Is the API running?</p>
      ) : reviews.length === 0 ? (
        <GlassPanel className="p-8 text-center text-[var(--text-secondary)]">
          No reviews published yet.
        </GlassPanel>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Link key={review.id} href={`/reviews/${review.slug}`}>
              <GlassPanel className="flex items-center justify-between gap-4 p-5 transition duration-200 hover:border-[var(--electric-cyan)]/30">
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
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
              </GlassPanel>
            </Link>
          ))}
        </div>
      )}
    </ArenaShell>
  );
}
