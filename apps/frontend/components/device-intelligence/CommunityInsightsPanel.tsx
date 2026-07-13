"use client";

import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { MessageCircle, ThumbsDown, ThumbsUp, Users } from "lucide-react";

import { TechnicalText } from "@/components/i18n/TechnicalText";
import {
  buildCommunityInsights,
  DEVICE_DISCUSSIONS_SECTION_ID,
  discussionTopicSlug,
  normalizeDiscussionTopicSlug,
} from "@/features/device-intelligence";
import { cn } from "@/design-system/utils/cn";
import type { Device } from "@/lib/api";

type Props = {
  device: Device;
  discussionBasePath?: string;
  className?: string;
  /** Nested in compare / narrow columns — hide chrome, stack stats. */
  compact?: boolean;
};

export function CommunityInsightsPanel({
  device,
  discussionBasePath,
  className = "",
  compact = false,
}: Props) {
  const searchParams = useSearchParams();
  const activeTopicSlug = normalizeDiscussionTopicSlug(searchParams.get("topic"));
  const insights = buildCommunityInsights(device);
  const satisfactionNum = parseFloat(insights.ownerSatisfaction);
  const rebuyNum = parseInt(insights.polls[0]?.value ?? "0", 10);

  useEffect(() => {
    if (!activeTopicSlug) return;
    const target = document.getElementById(DEVICE_DISCUSSIONS_SECTION_ID);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeTopicSlug]);

  return (
    <section
      className={cn(
        "intel-community",
        compact && "intel-community--embedded",
        className,
      )}
    >
      {!compact ? (
        <header className="intel-community__header">
          <div>
            <p className="intel-community__eyebrow">
              <TechnicalText value="Community Intelligence" />
            </p>
            <h2 className="intel-community__title">
              <TechnicalText value="Owner insights" />
            </h2>
          </div>
          {device.communityRatingCount != null && device.communityRatingCount > 0 ? (
            <p className="intel-community__meta">
              <Users size={14} aria-hidden />
              {device.communityRatingCount}{" "}
              <TechnicalText
                value={device.communityRatingCount === 1 ? "rating" : "ratings"}
              />
            </p>
          ) : null}
        </header>
      ) : null}

      <div className="intel-community__stats">
        <div className="intel-community__stat intel-community__stat--gold">
          <p className="intel-community__stat-label">
            <TechnicalText value="Satisfaction" />
          </p>
          <p className="intel-community__stat-value">{insights.ownerSatisfaction}</p>
          <div className="intel-community__meter" aria-hidden>
            <span
              className="intel-community__meter-fill"
              style={{ width: `${Math.min(100, (satisfactionNum / 5) * 100)}%` }}
            />
          </div>
        </div>
        <div className="intel-community__stat intel-community__stat--green">
          <p className="intel-community__stat-label">
            <TechnicalText value={compact ? "Buy again" : "Would buy again"} />
          </p>
          <p className="intel-community__stat-value">{insights.polls[0]?.value ?? "—"}</p>
          <div className="intel-community__meter" aria-hidden>
            <span
              className="intel-community__meter-fill"
              style={{ width: `${rebuyNum}%` }}
            />
          </div>
        </div>
        <div className="intel-community__stat intel-community__stat--cyan">
          <p className="intel-community__stat-label">
            <TechnicalText value="Recommend" />
          </p>
          <p className="intel-community__stat-value">{insights.polls[1]?.value ?? "—"}</p>
          <div className="intel-community__meter" aria-hidden>
            <span
              className="intel-community__meter-fill"
              style={{
                width: `${parseInt(insights.polls[1]?.value ?? "0", 10)}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="intel-community__columns">
        <div className="intel-community__card">
          <p className="intel-community__card-title">
            <ThumbsUp size={15} aria-hidden />
            <TechnicalText value="Most praised" />
          </p>
          <ul className="intel-community__list">
            {insights.mostPraised.map((item) => (
              <li key={item}>
                <TechnicalText value={item} />
              </li>
            ))}
          </ul>
        </div>
        <div className="intel-community__card">
          <p className="intel-community__card-title">
            <ThumbsDown size={15} aria-hidden />
            <TechnicalText value="Room to improve" />
          </p>
          <ul className="intel-community__list intel-community__list--muted">
            {insights.improvements.map((item) => (
              <li key={item}>
                <TechnicalText value={item} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="intel-community__topics">
        <p className="intel-community__card-title">
          <MessageCircle size={15} aria-hidden />
          <TechnicalText value="Discussion topics" />
        </p>
        <div className="intel-community__chips">
          {insights.discussionTopics.map((topic) => {
            const slug = discussionTopicSlug(topic);
            const isActive = activeTopicSlug === slug;

            if (!discussionBasePath) {
              return (
                <span key={topic} className="intel-community__chip">
                  <TechnicalText value={topic} />
                </span>
              );
            }

            return (
              <Link
                key={topic}
                href={`${discussionBasePath}?topic=${slug}#${DEVICE_DISCUSSIONS_SECTION_ID}`}
                className={cn(
                  "intel-community__chip",
                  isActive && "intel-community__chip--active",
                )}
                aria-current={isActive ? "true" : undefined}
              >
                <TechnicalText value={topic} />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
