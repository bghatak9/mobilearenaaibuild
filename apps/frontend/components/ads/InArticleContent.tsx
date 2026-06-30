import AdUnit from "@/components/ads/AdUnit";
import type { PaidAdvertisement } from "@/lib/api";
import { pickAdForPlacement } from "@/lib/ad-utils";

type InArticleContentProps = {
  content: string;
  ads: PaidAdvertisement[];
  className?: string;
};

export default function InArticleContent({
  content,
  ads,
  className = "",
}: InArticleContentProps) {
  const paragraphs = content.split(/\n\n+/).filter((p) => p.trim().length > 0);
  const top = pickAdForPlacement(ads, "in-article-top");
  const middle = pickAdForPlacement(ads, "in-article-middle");
  const end = pickAdForPlacement(ads, "in-article-end");
  const between = pickAdForPlacement(ads, "in-article-between-sections");
  const midIndex = Math.max(1, Math.floor(paragraphs.length / 2) - 1);

  if (paragraphs.length === 0) {
    return (
      <div className={`prose max-w-none whitespace-pre-wrap text-gray-800 ${className}`}>
        {top ? (
          <div className="not-prose my-6">
            <AdUnit ad={top} variant="inline" />
          </div>
        ) : null}
        {content}
        {end ? (
          <div className="not-prose my-6">
            <AdUnit ad={end} variant="inline" />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`prose max-w-none text-gray-800 ${className}`}>
      {top ? (
        <div className="not-prose my-6">
          <AdUnit ad={top} variant="inline" />
        </div>
      ) : null}

      {paragraphs.map((paragraph, index) => (
        <div key={index}>
          <p className="whitespace-pre-wrap">{paragraph}</p>
          {index === midIndex && middle ? (
            <div className="not-prose my-6">
              <AdUnit ad={middle} variant="inline" />
            </div>
          ) : null}
          {index === paragraphs.length - 2 && between && paragraphs.length > 3 ? (
            <div className="not-prose my-6">
              <AdUnit ad={between} variant="inline" />
            </div>
          ) : null}
        </div>
      ))}

      {end ? (
        <div className="not-prose my-6">
          <AdUnit ad={end} variant="inline" />
        </div>
      ) : null}
    </div>
  );
}
