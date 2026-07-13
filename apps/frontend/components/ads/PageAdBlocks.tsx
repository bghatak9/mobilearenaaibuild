import AdUnit from "@/components/ads/AdUnit";
import type { PaidAdvertisement } from "@/lib/api";

type PageAdBlockProps = {
  ad: PaidAdvertisement | null | undefined;
  className?: string;
};

/** Native sponsored card — same rules on every ad-enabled page via ArenaShell. */
export function NativeCardAdBlock({ ad, className = "mt-10" }: PageAdBlockProps) {
  if (!ad) return null;
  return (
    <section aria-label="Sponsored" className={className}>
      <AdUnit ad={ad} />
    </section>
  );
}

/** Review detail affiliate CTA — uses shared AdUnit variant rules. */
export function AffiliateAdBlock({ ad, className = "mt-6" }: PageAdBlockProps) {
  if (!ad) return null;
  return (
    <section aria-label="Sponsored offer" className={className}>
      <AdUnit ad={ad} />
    </section>
  );
}
