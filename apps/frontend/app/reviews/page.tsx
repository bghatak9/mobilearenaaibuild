import Link from "next/link";
import { Star } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
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
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header />

      <section className="mx-auto max-w-5xl px-5 py-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Reviews</h1>

        {error ? (
          <p className="text-red-500">Couldn&apos;t load reviews. Is the API running?</p>
        ) : reviews.length === 0 ? (
          <p className="text-gray-500">No reviews published yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Link
                key={review.id}
                href={`/reviews/${review.slug}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition hover:shadow-md"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {review.title}
                  </h2>
                  {review.device && (
                    <p className="text-sm text-gray-500">
                      {review.device.name}
                    </p>
                  )}
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-600">
                  <Star size={15} className="fill-amber-400 stroke-amber-400" />
                  {review.score.toFixed(1)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
