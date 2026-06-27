import Link from "next/link";
import { MessageSquare, Clock } from "lucide-react";

export type FeatureCardProps = {
  href: string;
  title: string;
  meta?: string;
  comments?: number;
  image?: string | null;
  gradient?: string;
  size?: "hero" | "md" | "sm";
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
  gradient = "bg-gradient-to-br from-zinc-700 to-zinc-900",
  size = "sm",
}: FeatureCardProps) {
  return (
    <Link
      href={href}
      className={`group relative block overflow-hidden rounded-md ${HEIGHTS[size]}`}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105"
        />
      ) : (
        <div className={`absolute inset-0 ${gradient}`} />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5" />

      {meta && (
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded bg-black/55 px-2 py-1 text-[11px] font-medium text-white">
          <Clock size={12} /> {meta}
        </span>
      )}

      {comments != null && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded bg-black/55 px-2 py-1 text-[11px] font-medium text-white">
          <MessageSquare size={12} /> {comments}
        </span>
      )}

      <h3
        className={`absolute bottom-0 left-0 right-0 p-4 font-bold leading-tight text-white ${
          size === "hero" ? "text-2xl md:text-3xl" : "text-base"
        }`}
      >
        {title}
      </h3>
    </Link>
  );
}
