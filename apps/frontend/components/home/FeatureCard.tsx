import Link from "next/link";
import { MessageSquare, Clock } from "lucide-react";
import { Badge, cn, titanGradients } from "@mobilearena/ui";

export type FeatureCardProps = {
  href: string;
  title: string;
  meta?: string;
  comments?: number;
  image?: string | null;
  gradient?: string;
  size?: "hero" | "md" | "sm";
  premium?: boolean;
};

const HEIGHTS: Record<NonNullable<FeatureCardProps["size"]>, string> = {
  hero: "h-[300px]",
  md: "h-[150px]",
  sm: "h-[220px]",
};

export default function FeatureCard({
  href,
  title,
  meta,
  comments,
  image,
  gradient = titanGradients.ocean,
  size = "sm",
  premium = false,
}: FeatureCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-border-soft bg-surface-1 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover",
        HEIGHTS[size],
      )}
    >
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className={cn("absolute inset-0", gradient)} />
        )}

        {premium && (
          <Badge premium className="absolute right-3 top-3">
            Premium
          </Badge>
        )}

        {meta && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-[var(--radius-chip)] border border-border-soft bg-surface-2 px-2 py-1 text-[11px] font-medium text-text-primary">
            <Clock size={12} /> {meta}
          </span>
        )}

        {comments != null && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-[var(--radius-chip)] border border-border-soft bg-surface-2 px-2 py-1 text-[11px] font-medium text-text-primary">
            <MessageSquare size={12} /> {comments}
          </span>
        )}
      </div>

      <div className="border-t border-border-soft bg-bg-primary px-4 py-3">
        <h3
          className={cn(
            "titan-display leading-tight text-text-primary",
            size === "hero" ? "text-2xl md:text-3xl" : "text-base",
          )}
        >
          {title}
        </h3>
      </div>
    </Link>
  );
}
