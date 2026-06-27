"use client";

import NewsForm from "@/components/admin/NewsForm";
import { createNews } from "@/lib/api";

export default function NewNewsPage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">New article</h1>
      <NewsForm
        submitLabel="Create article"
        onSubmit={async (input) => {
          await createNews(input);
        }}
      />
    </div>
  );
}
