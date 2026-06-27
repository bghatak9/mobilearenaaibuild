"use client";

import ReviewForm from "@/components/admin/ReviewForm";
import { createReview } from "@/lib/api";

export default function NewReviewPage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">New review</h1>
      <ReviewForm
        submitLabel="Create review"
        onSubmit={async (input) => {
          await createReview(input);
        }}
      />
    </div>
  );
}
