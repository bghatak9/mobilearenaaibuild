"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { ThumbsUp, Trophy } from "lucide-react";

import { SwipePagedList } from "@/components/ui/SwipePagedList";
import { Avatar } from "@/design-system/feedback/Avatar";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import { Button } from "@/design-system/buttons/Button";
import {
  DEFAULT_CATEGORY_SCORES,
  REVIEW_CATEGORIES,
  type CategoryScores,
  type CommunityReviewItem,
  type TopReviewer,
} from "@/lib/community-types";
import {
  createCommunityReview,
  getDevices,
  getToken,
  getTopReviewers,
  replyToCommunityReview,
  voteReviewHelpful,
  type Device,
} from "@/lib/api";
import { useLocale } from "next-intl";

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`text-lg ${n <= value ? "text-[var(--premium-gold)]" : "text-white/20"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewCard({
  review,
  onHelpful,
  onReply,
}: {
  review: CommunityReviewItem;
  onHelpful: (id: number, count: number) => void;
  onReply: () => void;
}) {
  const [replyText, setReplyText] = useState("");
  const [showReply, setShowReply] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submitReply() {
    if (!getToken() || !replyText.trim()) return;
    setBusy(true);
    try {
      await replyToCommunityReview(review.id, replyText.trim());
      setReplyText("");
      setShowReply(false);
      onReply();
    } finally {
      setBusy(false);
    }
  }

  async function markHelpful() {
    if (!getToken()) return;
    try {
      const { helpfulCount } = await voteReviewHelpful(review.id);
      onHelpful(review.id, helpfulCount);
    } catch {
      /* already voted */
    }
  }

  return (
    <SpectrumPanel className="p-5">
      <div className="flex gap-3">
        <Avatar src={review.user?.avatar} name={review.user?.name} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)]">
              {review.user?.name ?? "Member"}
            </span>
            {review.verifiedOwner && (
              <span className="rounded-full border border-[var(--premium-gold)]/30 bg-[var(--premium-gold)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--premium-gold)]">
                🏆 Verified owner
              </span>
            )}
            <StarPicker value={review.overallStars} onChange={() => undefined} />
          </div>
          {review.device && (
            <Link
              href={`/phones/${review.device.slug}`}
              className="text-xs text-[var(--electric-cyan)] hover:underline"
            >
              {review.device.name}
            </Link>
          )}
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{review.body}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {REVIEW_CATEGORIES.map((cat) => (
              <span
                key={cat.id}
                className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-[var(--text-secondary)]"
                title={cat.label}
              >
                {cat.emoji} {(review.categoryScores as CategoryScores)[cat.id] ?? "—"}
              </span>
            ))}
          </div>

          {(review.photoUrls?.length > 0 || review.videoUrls?.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {review.photoUrls?.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--electric-cyan)] hover:underline"
                >
                  📷 Sample photo
                </a>
              ))}
              {review.videoUrls?.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--electric-cyan)] hover:underline"
                >
                  🎥 Video
                </a>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void markHelpful()}
              className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--electric-cyan)]"
            >
              <ThumbsUp size={14} /> Helpful ({review.helpfulCount})
            </button>
            <button
              type="button"
              onClick={() => setShowReply((v) => !v)}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--electric-cyan)]"
            >
              💬 Reply
            </button>
          </div>

          {review.replies && review.replies.length > 0 && (
            <ul className="mt-4 space-y-2 border-l-2 border-white/10 pl-4">
              {review.replies.map((r) => (
                <li key={r.id} className="text-sm text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)]">
                    {r.user?.name ?? "Member"}:
                  </strong>{" "}
                  {r.body}
                </li>
              ))}
            </ul>
          )}

          {showReply && (
            <div className="mt-3 flex gap-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply…"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
              />
              <Button
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={() => void submitReply()}
              >
                Post
              </Button>
            </div>
          )}
        </div>
      </div>
    </SpectrumPanel>
  );
}

export function CommunityReviewsSection({
  reviews: initial,
  onRefresh,
}: {
  reviews: CommunityReviewItem[];
  onRefresh: () => void;
}) {
  const locale = useLocale();
  const [reviews, setReviews] = useState(initial);
  const [topReviewers, setTopReviewers] = useState<TopReviewer[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceId, setDeviceId] = useState<number | "">("");
  const [overallStars, setOverallStars] = useState(4);
  const [categoryScores, setCategoryScores] = useState<CategoryScores>({
    ...DEFAULT_CATEGORY_SCORES,
  });
  const [body, setBody] = useState("");
  const [verifiedOwner, setVerifiedOwner] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setReviews(initial);
  }, [initial]);

  useEffect(() => {
    getTopReviewers().then(setTopReviewers).catch(() => setTopReviewers([]));
    getDevices(undefined, locale).then(setDevices).catch(() => setDevices([]));
  }, [locale]);

  async function submitReview() {
    if (!getToken()) {
      setSubmitError("Sign in to post a review.");
      return;
    }
    if (!deviceId || body.trim().length < 10) {
      setSubmitError("Pick a device and write at least 10 characters.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createCommunityReview({
        deviceId: Number(deviceId),
        overallStars,
        categoryScores,
        body: body.trim(),
        verifiedOwner,
        photoUrls: photoUrl.trim() ? [photoUrl.trim()] : [],
        videoUrls: videoUrl.trim() ? [videoUrl.trim()] : [],
      });
      setBody("");
      setPhotoUrl("");
      setVideoUrl("");
      onRefresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-2 text-lg font-bold text-[var(--text-primary)]">
          Review system
        </h2>
        <p className="mb-4 text-sm text-[var(--text-secondary)]">
          Rate by category · 1–5 stars · helpful votes · sample photos & videos · verified
          owner badge · replies · top reviewer rankings
        </p>

        <SpectrumPanel className="mb-6 p-5">
          <h3 className="mb-4 font-bold text-[var(--text-primary)]">Write a review</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm md:col-span-2">
              <span className="mb-1 text-[var(--text-secondary)]">Device</span>
              <select
                value={deviceId}
                onChange={(e) =>
                  setDeviceId(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
              >
                <option value="">Select a phone…</option>
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <span className="mb-1 block text-sm text-[var(--text-secondary)]">
                Overall rating
              </span>
              <StarPicker value={overallStars} onChange={setOverallStars} />
            </div>
            <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <input
                type="checkbox"
                checked={verifiedOwner}
                onChange={(e) => setVerifiedOwner(e.target.checked)}
              />
              🏆 I own this device (verified owner badge)
            </label>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {REVIEW_CATEGORIES.map((cat) => (
              <label key={cat.id} className="text-xs">
                <span className="mb-1 block text-[var(--text-secondary)]">{cat.label}</span>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={categoryScores[cat.id]}
                  onChange={(e) =>
                    setCategoryScores((s) => ({
                      ...s,
                      [cat.id]: Number(e.target.value),
                    }))
                  }
                  className="w-full"
                />
                <span className="text-[var(--premium-gold)]">{categoryScores[cat.id]}/5</span>
              </label>
            ))}
          </div>

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Share your experience…"
            className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
          />

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="📷 Sample photo URL (optional)"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
            />
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="🎥 Video URL (optional)"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
            />
          </div>

          {submitError && (
            <p className="mt-2 text-xs text-[var(--rose-alert)]">{submitError}</p>
          )}
          <Button
            type="button"
            className="mt-4"
            disabled={submitting}
            onClick={() => void submitReview()}
          >
            Publish review
          </Button>
        </SpectrumPanel>

        {topReviewers.length > 0 && (
          <SpectrumPanel className="mb-6 p-5">
            <p className="mb-3 flex items-center gap-2 font-bold text-[var(--text-primary)]">
              <Trophy size={18} className="text-[var(--premium-gold)]" />
              🔥 Top reviewer rankings
            </p>
            <ol className="space-y-2">
              {topReviewers.map((r) => (
                <li
                  key={r.rank}
                  className="flex items-center justify-between rounded-lg border border-white/5 px-3 py-2 text-sm"
                >
                  <span>
                    #{r.rank} {r.user?.name ?? "Member"} · {r.reviewCount} reviews
                  </span>
                  <span className="text-[var(--electric-cyan)]">
                    👍 {r.helpfulTotal}
                  </span>
                </li>
              ))}
            </ol>
          </SpectrumPanel>
        )}

        <SwipePagedList
          items={reviews}
          getKey={(review) => review.id}
          listClassName="space-y-4"
          renderItem={(review) => (
            <ReviewCard
              review={review}
              onHelpful={(id, count) =>
                setReviews((list) =>
                  list.map((r) => (r.id === id ? { ...r, helpfulCount: count } : r)),
                )
              }
              onReply={onRefresh}
            />
          )}
        />
        {!reviews.length && (
          <SpectrumPanel className="p-8 text-center text-[var(--text-secondary)]">
            No community reviews yet. Be the first to review a phone.
          </SpectrumPanel>
        )}
      </section>
    </div>
  );
}
