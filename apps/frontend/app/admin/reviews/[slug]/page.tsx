"use client";

import { use, useEffect, useState } from "react";
import ReviewForm from "@/components/admin/ReviewForm";
import { getReviewBySlug, updateReview, type Review } from "@/lib/api";

export default function EditReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [review, setReview] = useState<Review | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setReview(await getReviewBySlug(slug));
      } catch {
        setError("Review not found.");
      }
    })();
  }, [slug]);

  if (error) return <div className="p-8 text-rose-600">{error}</div>;
  if (!review) return <div className="p-8 text-gray-400">Loading…</div>;

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit review</h1>
      <ReviewForm
        initial={review}
        lockDevice
        submitLabel="Save changes"
        onSubmit={async (input) => {
          await updateReview(review.id, input);
        }}
      />
    </div>
  );
}
