"use client";

import Link from "next/link";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PhoneGrid from "@/components/phone/PhoneGrid";
import { MAX_COMPARE, useCompare } from "@/lib/compare-context";
import { Button, CompareScaleIcon, Container } from "@mobilearena/ui";

export default function ComparePage() {
  const { items, compareHref, clear } = useCompare();

  return (
    <div className="min-h-screen bg-bg-primary pb-24">
      <Header />

      <section>
        <Container wide className="py-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="titan-display flex items-center gap-2 text-3xl">
                <CompareScaleIcon className="h-7 w-7" />
                Compare Phones
              </h1>
              <p className="mt-1 text-text-muted">
                Pick {2}–{MAX_COMPARE} phones, then compare them side by side.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clear}
                  className="text-sm text-text-muted hover:text-text-primary transition"
                >
                  Clear ({items.length})
                </button>
              )}
              {compareHref ? (
                <Link href={compareHref}>
                  <Button variant="primary">
                    Compare now ({items.length})
                  </Button>
                </Link>
              ) : (
                <span className="rounded-[var(--radius-button)] bg-surface-2 px-5 py-2 font-medium text-text-muted">
                  Select at least 2
                </span>
              )}
            </div>
          </div>

          <PhoneGrid />
        </Container>
      </section>

      <Footer />
    </div>
  );
}
