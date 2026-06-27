"use client";

import Link from "next/link";
import { Scale } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PhoneGrid from "@/components/phone/PhoneGrid";
import { MAX_COMPARE, useCompare } from "@/lib/compare-context";

export default function ComparePage() {
  const { items, compareHref, clear } = useCompare();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header />

      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
              <Scale size={26} /> Compare Phones
            </h1>
            <p className="mt-1 text-gray-500">
              Pick {2}–{MAX_COMPARE} phones, then compare them side by side.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {items.length > 0 && (
              <button
                onClick={clear}
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                Clear ({items.length})
              </button>
            )}
            {compareHref ? (
              <Link
                href={compareHref}
                className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-500"
              >
                Compare now ({items.length})
              </Link>
            ) : (
              <span className="rounded-lg bg-gray-200 px-5 py-2 font-medium text-gray-500">
                Select at least 2
              </span>
            )}
          </div>
        </div>

        <PhoneGrid />
      </section>

      <Footer />
    </div>
  );
}
