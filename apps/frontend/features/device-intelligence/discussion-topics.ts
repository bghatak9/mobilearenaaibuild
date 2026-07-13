export const DEVICE_DISCUSSION_TOPICS = [
  "Performance",
  "Battery",
  "Camera",
  "Software",
  "Accessories",
  "Tips & Tricks",
] as const;

export type DeviceDiscussionTopic = (typeof DEVICE_DISCUSSION_TOPICS)[number];

export function discussionTopicSlug(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const SLUG_TO_LABEL = Object.fromEntries(
  DEVICE_DISCUSSION_TOPICS.map((topic) => [discussionTopicSlug(topic), topic]),
) as Record<string, DeviceDiscussionTopic>;

/** Resolve a `?topic=` slug to its display label. */
export function discussionTopicLabel(slug: string | null | undefined): string | null {
  if (!slug?.trim()) return null;
  const key = discussionTopicSlug(decodeURIComponent(slug.trim()));
  return SLUG_TO_LABEL[key] ?? null;
}

/** Normalize any topic query value to a canonical slug. */
export function normalizeDiscussionTopicSlug(
  slug: string | null | undefined,
): string | null {
  if (!slug?.trim()) return null;
  const key = discussionTopicSlug(decodeURIComponent(slug.trim()));
  return SLUG_TO_LABEL[key] ? key : null;
}

export const DEVICE_DISCUSSIONS_SECTION_ID = "discussions";
