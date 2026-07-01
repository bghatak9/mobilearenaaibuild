"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { MAX_COMPARE, useCompare } from "@/lib/compare-context";
import { Button, Container, CompareScaleIcon } from "@mobilearena/ui";

export default function CompareBar() {
  const { items, remove, clear, compareHref } = useCompare();

  if (items.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border-soft bg-surface-1">
      <Container wide className="flex flex-wrap items-center gap-3 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <CompareScaleIcon className="h-4 w-4" />
          Compare ({items.length}/{MAX_COMPARE})
        </span>

        <div className="flex flex-1 flex-wrap items-center gap-2">
          {items.map((item) => (
            <span
              key={item.slug}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-chip)] bg-surface-2 px-3 py-1 text-sm text-text-secondary"
            >
              {item.name}
              <button
                type="button"
                onClick={() => remove(item.slug)}
                className="text-text-muted hover:text-text-primary transition"
                aria-label={`Remove ${item.name}`}
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={clear}
          className="text-sm text-text-muted hover:text-text-primary transition"
        >
          Clear
        </button>

        {compareHref ? (
          <Link href={compareHref}>
            <Button variant="primary">Compare now</Button>
          </Link>
        ) : (
          <span className="rounded-[var(--radius-button)] bg-surface-2 px-5 py-2 text-sm font-medium text-text-muted">
            Add 1 more
          </span>
        )}
      </Container>
    </div>
  );
}
