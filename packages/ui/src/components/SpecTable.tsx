import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";
import { getCategoryClass } from "../tokens/categories";

export type SpecRow = {
  label: string;
  value: string | null | undefined;
};

export type SpecSection = {
  title: string;
  rows: SpecRow[];
};

export type SpecTableProps = HTMLAttributes<HTMLDivElement> & {
  sections: SpecSection[];
  categorySlug?: string | null;
};

export function SpecTable({
  sections,
  categorySlug,
  className,
  ...props
}: SpecTableProps) {
  const filtered = sections
    .map((s) => ({
      ...s,
      rows: s.rows.filter((r) => r.value != null && r.value !== ""),
    }))
    .filter((s) => s.rows.length > 0);

  if (filtered.length === 0) return null;

  return (
    <div
      className={cn("space-y-6", getCategoryClass(categorySlug), className)}
      {...props}
    >
      {filtered.map((section) => (
        <div key={section.title} className="titan-card overflow-hidden">
          <h3
            className="border-b border-border-soft px-4 py-3 text-sm font-semibold text-text-primary"
            style={{ borderLeftWidth: 3, borderLeftColor: "var(--accent)" }}
          >
            {section.title}
          </h3>
          <table className="titan-spec-table">
            <tbody>
              {section.rows.map((row) => (
                <tr key={row.label}>
                  <td className="spec-label">{row.label}</td>
                  <td className="spec-value">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
