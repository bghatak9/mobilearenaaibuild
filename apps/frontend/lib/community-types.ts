export type PollType = "DEVICE" | "WEEKLY" | "COMPARISON";

export type CommunityPoll = {
  slug: string;
  question: string;
  pollType: PollType;
  choices: { id: string; label: string; votes: number; pct: number }[];
  totalVotes: number;
};

export const POLL_TYPE_LABELS: Record<PollType, string> = {
  DEVICE: "Device Polls",
  WEEKLY: "Weekly Polls",
  COMPARISON: "Comparison Polls",
};

export const POLL_TYPE_META: Record<
  PollType,
  { label: string; description: string; accent: string }
> = {
  DEVICE: {
    label: "Device Polls",
    description: "Crowd picks for camera kings, gaming beasts, battery champions, and foldables.",
    accent: "cyan",
  },
  WEEKLY: {
    label: "Weekly Polls",
    description: "Fresh Arena pulse — phone of the week, brand heat, and launch hype.",
    accent: "purple",
  },
  COMPARISON: {
    label: "Comparison Polls",
    description: "Head-to-head matchups decided by the community.",
    accent: "gold",
  },
};

export const REVIEW_CATEGORIES = [
  { id: "camera", label: "📸 Camera", emoji: "📸" },
  { id: "battery", label: "🔋 Battery", emoji: "🔋" },
  { id: "performance", label: "🎮 Performance", emoji: "🎮" },
  { id: "display", label: "📱 Display", emoji: "📱" },
  { id: "audio", label: "🎵 Audio", emoji: "🎵" },
  { id: "build", label: "🛡️ Build Quality", emoji: "🛡️" },
  { id: "software", label: "🤖 Software", emoji: "🤖" },
  { id: "value", label: "💰 Value for Money", emoji: "💰" },
] as const;

export type CategoryScores = Record<(typeof REVIEW_CATEGORIES)[number]["id"], number>;

export const DEFAULT_CATEGORY_SCORES: CategoryScores = {
  camera: 3,
  battery: 3,
  performance: 3,
  display: 3,
  audio: 3,
  build: 3,
  software: 3,
  value: 3,
};

export type CommunityReviewItem = {
  id: number;
  overallStars: number;
  categoryScores: CategoryScores;
  body: string;
  helpfulCount: number;
  verifiedOwner: boolean;
  photoUrls: string[];
  videoUrls: string[];
  createdAt: string;
  user?: { id: number; name: string | null; avatar?: string | null } | null;
  device?: { id: number; name: string; slug: string } | null;
  replies?: {
    id: number;
    body: string;
    createdAt: string;
    user?: { id: number; name: string | null; avatar?: string | null } | null;
  }[];
};

export type TopReviewer = {
  rank: number;
  reviewCount: number;
  helpfulTotal: number;
  user: { id: number; name: string | null; avatar?: string | null; reputationPoints: number } | null;
};
