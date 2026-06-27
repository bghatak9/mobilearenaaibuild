import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getReviewBySlug, type Review } from "@/lib/api";

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let review: Review;
  try {
    review = await getReviewBySlug(slug);
  } catch {
    notFound();
  }

  const pros = Array.isArray(review.pros) ? review.pros : [];
  const cons = Array.isArray(review.cons) ? review.cons : [];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header />

      <article className="mx-auto max-w-3xl px-5 py-10">
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/reviews" className="hover:underline">
            Reviews
          </Link>{" "}
          / <span className="text-gray-700">{review.title}</span>
        </nav>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl font-bold text-gray-900">{review.title}</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-4 py-2 text-lg font-bold text-amber-600">
            <Star size={18} className="fill-amber-400 stroke-amber-400" />
            {review.score.toFixed(1)}/10
          </span>
        </div>

        {review.device && (
          <Link
            href={`/phones/${review.device.slug}`}
            className="mt-2 inline-block text-indigo-600 hover:underline"
          >
            {review.device.name} →
          </Link>
        )}

        <div className="mt-8 whitespace-pre-wrap text-gray-800">
          {review.content}
        </div>

        {(pros.length > 0 || cons.length > 0) && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {pros.length > 0 && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <h2 className="mb-3 flex items-center gap-2 font-semibold text-emerald-700">
                  <ThumbsUp size={16} /> Pros
                </h2>
                <ul className="list-inside list-disc space-y-1 text-sm text-emerald-900">
                  {pros.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
            {cons.length > 0 && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
                <h2 className="mb-3 flex items-center gap-2 font-semibold text-rose-700">
                  <ThumbsDown size={16} /> Cons
                </h2>
                <ul className="list-inside list-disc space-y-1 text-sm text-rose-900">
                  {cons.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </article>

      <Footer />
    </div>
  );
}
