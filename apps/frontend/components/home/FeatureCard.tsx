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
        "group relative block overflow-hidden rounded-[var(--radius-card)] shadow-card transition hover:-translate-y-1 hover:shadow-card-hover",
        HEIGHTS[size],
      )}
    >
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

      <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/90 via-bg-primary/30 to-transparent" />

      {premium && (
        <Badge premium className="absolute right-3 top-3">
          Premium
        </Badge>
      )}

      {meta && (
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-[var(--radius-chip)] bg-surface-1/80 px-2 py-1 text-[11px] font-medium text-text-primary">
          <Clock size={12} /> {meta}
        </span>
      )}

      {comments != null && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-[var(--radius-chip)] bg-surface-1/80 px-2 py-1 text-[11px] font-medium text-text-primary">
          <MessageSquare size={12} /> {comments}
        </span>
      )}

      <h3
        className={cn(
          "titan-display absolute bottom-0 left-0 right-0 p-4 leading-tight text-text-primary",
          size === "hero" ? "text-2xl md:text-3xl" : "text-base",
        )}
      >
        {title}
      </h3>
    </Link>
  );
}
