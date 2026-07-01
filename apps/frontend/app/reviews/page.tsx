import Link from "next/link";
import { Star } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getReviews, type Review } from "@/lib/api";
import { Card, Container } from "@mobilearena/ui";

export default async function ReviewsPage() {
  let reviews: Review[] = [];
  let error = false;
  try {
    reviews = await getReviews();
  } catch {
    error = true;
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-24">
      <Header />

      <section>
        <Container className="py-8">
          <h1 className="titan-display mb-8 text-3xl">Reviews</h1>

          {error ? (
            <p className="text-danger">Couldn&apos;t load reviews. Is the API running?</p>
          ) : reviews.length === 0 ? (
            <p className="text-text-muted">No reviews published yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Link key={review.id} href={`/reviews/${review.slug}`}>
                  <Card
                    interactive
                    className="flex items-center justify-between gap-4 p-5"
                  >
                    <div>
                      <h2 className="text-lg font-semibold text-text-primary">
                        {review.title}
                      </h2>
                      {review.device && (
                        <p className="text-sm text-text-muted">
                          {review.device.name}
                        </p>
                      )}
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-[var(--radius-chip)] bg-surface-2 px-3 py-1 font-semibold text-orange">
                      <Star size={15} className="fill-orange stroke-orange" />
                      <span className="titan-mono">{review.score.toFixed(1)}</span>
                    </span>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>

      <Footer />
    </div>
  );
}
