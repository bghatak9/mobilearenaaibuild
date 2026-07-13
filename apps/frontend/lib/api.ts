import { countryName } from "@/lib/countries";

import { browserApiBase, resolveClientApiBase, resolveUploadApiBase, serverApiBase } from "@/lib/api-base";
import { catalogImportedOnlyFromEnv } from "@/lib/catalog-mode";
import { withLocaleQuery } from "@/lib/content-locale";

/** Browser uses same-origin /api proxy; SSR uses BACKEND_URL. */
export function getApiUrl(): string {
  return typeof window !== "undefined" ? resolveClientApiBase() : serverApiBase();
}

/** Resolved per request so SSR module init never freezes the wrong base in the browser. */
function apiBase(): string {
  return getApiUrl();
}

export type Device = {
  id: number;
  slug: string;
  name: string;
  /** Localized marketing copy — never replace `name` / brand / chipset. */
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  keywords?: string | null;
  locale?: string;
  localeFallback?: "exact" | "en" | "canonical";
  /** Per-locale URL slugs for hreflang (canonical EN always present). */
  localeSlugs?: Record<string, string>;
  price?: number | null;
  rating?: number | null;
  ramGb?: number | null;
  storageGb?: number | null;
  announcedDate?: string | null;
  releasedDate?: string | null;
  weight?: number | null;
  dimensions?: string | null;
  os?: string | null;
  waterproof?: boolean | null;
  fiveG?: boolean | null;
  nfc?: boolean | null;
  infrared?: boolean | null;
  fingerprint?: string | null;
  brand?: { id: number; name: string; slug: string; logo?: string | null };
  category?: { id: number; name: string; slug: string };
  manufacturer?: { id: number; name: string; slug: string };
  display?: {
    type: string;
    size: number;
    resolution: string;
    refreshRate: number;
    brightness: number;
    protection?: string | null;
  } | null;
  battery?: {
    capacity: number;
    charging: string;
    wireless: boolean;
    reverse: boolean;
  } | null;
  chipset?: {
    cpu: string;
    gpu: string;
    fabrication: string;
    benchmark?: number | null;
  } | null;
  cameras?: {
    id: number;
    type: string;
    megapixel: number;
    aperture?: string | null;
    opticalZoom?: string | null;
    stabilization?: boolean;
  }[];
  images?: { id: number; url: string; thumbnail?: string | null }[];
  reviews?: { id: number; slug: string; title: string; score: number }[];
  priceHistory?: {
    price: number;
    currency: string;
    recordedAt: string;
  }[];
  countryAvailability?: {
    countryCode: string;
    available: boolean;
    price?: number | null;
    currency?: string | null;
  }[];
  affiliateOffers?: {
    id: number;
    partner: string;
    price: number;
    currency: string;
    affiliateUrl: string;
    active: boolean;
    priority: number;
  }[];
  communityRatingCount?: number;
  /** Extended intelligence JSON from DeviceIntelligence.payload */
  intelligence?: Record<string, unknown>;
};

export type CompareResult = {
  devices: Device[];
  winners: Record<string, number[]>;
};

export async function getDevices(
  search?: string,
  locale?: string,
): Promise<Device[]> {
  const base = search
    ? `${apiBase()}/devices?search=${encodeURIComponent(search)}`
    : `${apiBase()}/devices`;
  const url = withLocaleQuery(base, locale);

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch devices");
  return res.json();
}

/** Devices bulk-uploaded via Admin → Upcoming Devices (not seed or regular phone uploads). */
export async function getBulkUpcomingDevices(
  locale?: string,
): Promise<Device[]> {
  const res = await fetch(
    withLocaleQuery(`${apiBase()}/devices/upcoming`, locale),
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error("Failed to fetch upcoming devices");
  return res.json();
}

export async function getCatalogStatus(): Promise<{ importedOnly: boolean }> {
  const fallback = catalogImportedOnlyFromEnv();
  try {
    const res = await fetch(`${apiBase()}/catalog/status`, {
      cache: "no-store",
      signal: AbortSignal.timeout(4_000),
    });
    if (!res.ok) return { importedOnly: fallback };
    const data = (await res.json()) as { importedOnly?: boolean };
    return { importedOnly: Boolean(data.importedOnly) };
  } catch {
    return { importedOnly: fallback };
  }
}

export async function getDeviceById(
  id: string,
  locale?: string,
): Promise<Device> {
  const res = await fetch(
    withLocaleQuery(`${apiBase()}/devices/${id}`, locale),
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error("Failed to fetch device");
  return res.json();
}

export async function getDeviceBySlug(
  slug: string,
  locale?: string,
): Promise<Device> {
  let res: Response;
  try {
    res = await fetch(
      withLocaleQuery(`${apiBase()}/devices/slug/${slug}`, locale),
      { cache: "no-store" },
    );
  } catch (error) {
    throw new Error(
      `Device API unreachable for slug "${slug}": ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
  if (res.status === 404) {
    throw new Error(`Device not found: ${slug}`);
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch device (${res.status})`);
  }
  return res.json();
}

export async function compareDevices(
  slug: string,
  locale?: string,
): Promise<CompareResult | null> {
  const res = await fetch(
    withLocaleQuery(`${apiBase()}/compare/${slug}`, locale),
    { cache: "no-store" },
  );
  if (!res.ok) return null;
  return res.json();
}

export type NewsArticle = {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  thumbnail?: string | null;
  featured: boolean;
  status: "DRAFT" | "REVIEW" | "PUBLISHED";
  publishedAt?: string | null;
  createdAt: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  keywords?: string | null;
  locale?: string;
  localeFallback?: "exact" | "en" | "canonical";
  localeSlugs?: Record<string, string>;
};

export type Review = {
  id: number;
  title: string;
  slug: string;
  content: string;
  score: number;
  pros: string[];
  cons: string[];
  deviceId: number;
  publishedAt: string;
  device?: Device;
  seoTitle?: string | null;
  seoDescription?: string | null;
  keywords?: string | null;
  locale?: string;
  localeFallback?: "exact" | "en" | "canonical";
  localeSlugs?: Record<string, string>;
};

export async function getNews(params?: {
  status?: NewsArticle["status"];
  featured?: boolean;
  locale?: string;
  search?: string;
}): Promise<NewsArticle[]> {
  const qs = new URLSearchParams();
  qs.set("status", params?.status ?? "PUBLISHED");
  if (params?.featured !== undefined) qs.set("featured", String(params.featured));
  if (params?.locale) qs.set("locale", params.locale);
  if (params?.search?.trim()) qs.set("search", params.search.trim());

  const res = await fetch(`${apiBase()}/news?${qs.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch news");
  return res.json();
}

export async function getNewsBySlug(
  slug: string,
  locale?: string,
): Promise<NewsArticle> {
  const res = await fetch(
    withLocaleQuery(`${apiBase()}/news/${slug}`, locale),
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error("Failed to fetch article");
  return res.json();
}

export async function getAdminNewsBySlug(slug: string): Promise<NewsArticle> {
  const res = await fetch(`${apiBase()}/news/admin/slug/${slug}`, {
    cache: "no-store",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch article");
  return res.json();
}

export async function getReviews(
  deviceId?: number,
  locale?: string,
): Promise<Review[]> {
  const base = deviceId
    ? `${apiBase()}/reviews?deviceId=${deviceId}`
    : `${apiBase()}/reviews`;
  const res = await fetch(withLocaleQuery(base, locale), { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
}

export async function getReviewBySlug(
  slug: string,
  locale?: string,
): Promise<Review> {
  const res = await fetch(
    withLocaleQuery(`${apiBase()}/reviews/${slug}`, locale),
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error("Failed to fetch review");
  return res.json();
}

export type PaidAdvertisement = {
  id: number;
  title: string;
  slug: string;
  link: string;
  imageUrl?: string | null;
  placement: string;
  adType: string;
  format?: string | null;
  width?: number | null;
  height?: number | null;
  sponsored: boolean;
  priority: number;
  advertiser?: string | null;
  budget?: number | null;
  active: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
};

export type AdCatalogResponse = {
  categories: import("@/lib/ad-catalog").AdCategoryDef[];
  placements: import("@/lib/ad-catalog").AdPlacementDef[];
  priorityMatrix: { type: string; priority: string; recommended: boolean }[];
};

export async function getActiveAdvertisements(options?: {
  placement?: string;
  adType?: string;
}): Promise<PaidAdvertisement[]> {
  const params = new URLSearchParams();
  if (options?.placement) params.set("placement", options.placement);
  if (options?.adType) params.set("adType", options.adType);
  const qs = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${apiBase()}/advertisements/active${qs}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch advertisements");
  return res.json();
}

export async function getAdCatalog(): Promise<AdCatalogResponse> {
  const res = await fetch(`${apiBase()}/advertisements/catalog`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch ad catalog");
  return res.json();
}

/* ------------------------------------------------------------------ *
 * Comments / moderation
 * ------------------------------------------------------------------ */

export type CommentStatus =
  | "PUBLISHED"
  | "PENDING_REVIEW"
  | "SPAM"
  | "REMOVED"
  | "APPROVED"
  | "HIDDEN";

export type Comment = {
  id: number;
  body: string;
  createdAt: string;
  status?: CommentStatus;
  spamScore?: number;
  aiSpamScore?: number | null;
  spamReason?: string | null;
  user?: {
    id: number;
    email: string;
    name?: string | null;
    reputationPoints?: number;
    role?: string;
  } | null;
  device?: { id: number; name: string; slug: string } | null;
};

export type CommentModerationStats = {
  pending: number;
  hidden: number;
  spam: number;
  published: number;
  removed: number;
  reported: number;
  autoRemovedToday: number;
  aiRemovedToday: number;
};

export type CommentAiSpamStatus = {
  configured: boolean;
  model: string;
  autoRemoveThreshold: number;
};

export type CommentAuditLog = {
  id: number;
  action: string;
  entity: string;
  entityId: string | null;
  createdAt: string;
  user?: { id: number; name: string | null; email: string; role: string };
};

export type ContentReport = {
  id: number;
  entityType: string;
  entityId: number;
  reason: string;
  status: string;
  notes?: string | null;
  createdAt: string;
  reporter?: { id: number; email: string; name: string | null };
};

export async function getComments(): Promise<Comment[]> {
  const res = await fetch(`${apiBase()}/comments`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to fetch comments"));
  return res.json();
}

export async function getCommentModerationQueue(
  status?: CommentStatus,
): Promise<Comment[]> {
  const url = status
    ? `${apiBase()}/comments/moderation/queue?status=${status}`
    : `${apiBase()}/comments/moderation/queue`;
  const res = await fetch(url, { headers: authHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to load queue"));
  return res.json();
}

export async function getCommentModerationStats(): Promise<CommentModerationStats> {
  const res = await fetch(`${apiBase()}/comments/moderation/stats`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to load stats"));
  return res.json();
}

export async function getCommentAiSpamStatus(): Promise<CommentAiSpamStatus> {
  const res = await fetch(`${apiBase()}/comments/moderation/ai-status`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) return { configured: false, model: "gpt-4o-mini", autoRemoveThreshold: 85 };
  return res.json();
}

export async function getCommentModerationAudit(
  limit = 50,
): Promise<CommentAuditLog[]> {
  const res = await fetch(`${apiBase()}/comments/moderation/audit?limit=${limit}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to load audit logs"));
  return res.json();
}

export async function moderateComment(
  id: number,
  action: "approve" | "reject" | "spam",
  notes?: string,
): Promise<Comment> {
  const res = await fetch(`${apiBase()}/comments/${id}/moderate`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ action, notes }),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Moderation failed"));
  return res.json();
}

export async function bulkModerateComments(
  ids: number[],
  action: "approve" | "reject" | "spam",
): Promise<{ count: number; items: Comment[] }> {
  const res = await fetch(`${apiBase()}/comments/moderation/bulk`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ ids, action }),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Bulk moderation failed"));
  return res.json();
}

export async function getOpenReports(): Promise<ContentReport[]> {
  const res = await fetch(`${apiBase()}/community/reports`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to load reports"));
  return res.json();
}

export async function reviewReport(
  id: number,
  status: "REVIEWED" | "DISMISSED",
  notes?: string,
): Promise<ContentReport> {
  const res = await fetch(`${apiBase()}/community/reports/${id}/review`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ status, notes }),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to review report"));
  return res.json();
}

export type DeviceComment = {
  id: number;
  body: string;
  createdAt: string;
  status?: CommentStatus;
  moderationMessage?: string | null;
  visible?: boolean;
  user?: {
    id: number;
    name: string | null;
    email?: string;
    avatar?: string | null;
  } | null;
};

export async function getDeviceComments(deviceId: number): Promise<DeviceComment[]> {
  const res = await fetch(`${apiBase()}/comments/device/${deviceId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch comments");
  return res.json();
}

export async function createComment(input: {
  deviceId: number;
  body: string;
}): Promise<DeviceComment> {
  const res = await fetch(`${apiBase()}/comments`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to post comment"));
  return res.json();
}

export async function updateComment(
  id: number,
  body: string,
): Promise<DeviceComment> {
  const res = await fetch(`${apiBase()}/comments/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ body }),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to update comment"));
  return res.json();
}

export type ActivePoll = {
  slug: string;
  question: string;
  pollType?: "DEVICE" | "WEEKLY" | "COMPARISON";
  choices: { id: string; label: string; votes: number; pct: number }[];
  totalVotes: number;
};

export async function getCommunityPolls(
  type?: "DEVICE" | "WEEKLY" | "COMPARISON",
): Promise<ActivePoll[]> {
  const url = type
    ? `${apiBase()}/community/polls?type=${type}`
    : `${apiBase()}/community/polls`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function getActivePoll(): Promise<ActivePoll | null> {
  const res = await fetch(`${apiBase()}/community/polls/active`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data ?? null;
}

export async function voteOnPoll(input: {
  pollSlug: string;
  choiceId: string;
}): Promise<ActivePoll> {
  const res = await fetch(`${apiBase()}/community/polls/vote`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Vote failed"));
  return res.json();
}

export async function getCommunityReviews(deviceId?: number): Promise<
  import("@/lib/community-types").CommunityReviewItem[]
> {
  const url = deviceId
    ? `${apiBase()}/community/reviews?deviceId=${deviceId}`
    : `${apiBase()}/community/reviews`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function getTopReviewers(): Promise<
  import("@/lib/community-types").TopReviewer[]
> {
  const res = await fetch(`${apiBase()}/community/reviews/top-reviewers`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export async function createCommunityReview(input: {
  deviceId: number;
  overallStars: number;
  categoryScores: Record<string, number>;
  body: string;
  verifiedOwner?: boolean;
  photoUrls?: string[];
  videoUrls?: string[];
}): Promise<import("@/lib/community-types").CommunityReviewItem> {
  const res = await fetch(`${apiBase()}/community/reviews`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Review failed"));
  return res.json();
}

export async function replyToCommunityReview(
  reviewId: number,
  body: string,
): Promise<{ id: number; body: string }> {
  const res = await fetch(`${apiBase()}/community/reviews/${reviewId}/replies`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ body }),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Reply failed"));
  return res.json();
}

export async function voteReviewHelpful(
  reviewId: number,
): Promise<{ helpfulCount: number }> {
  const res = await fetch(`${apiBase()}/community/reviews/${reviewId}/helpful`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Vote failed"));
  return res.json();
}

export async function reportContent(input: {
  entityType: "COMMENT" | "REVIEW" | "USER" | "DISCUSSION";
  entityId: number;
  reason: string;
}): Promise<{ id: number }> {
  const res = await fetch(`${apiBase()}/community/reports`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Report failed"));
  return res.json();
}

export async function verifyEmail(input: {
  email: string;
  token: string;
}): Promise<{ message: string }> {
  const res = await fetch(`${apiBase()}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Verification failed"));
  return res.json();
}

export async function resendVerification(
  email: string,
): Promise<{ message: string; devToken?: string }> {
  const res = await fetch(`${apiBase()}/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Could not resend"));
  return res.json();
}

export type DiscussionThread = {
  id: number;
  slug: string;
  title: string;
  body: string;
  createdAt: string;
  user?: { id: number; name: string | null; avatar?: string | null } | null;
  device?: { id: number; name: string; slug: string } | null;
};

export async function getDiscussions(): Promise<DiscussionThread[]> {
  const res = await fetch(`${apiBase()}/community/discussions`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load discussions");
  return res.json();
}

/* ------------------------------------------------------------------ *
 * Auth + admin helpers
 *
 * The token is stored client-side and attached to mutating admin
 * requests. The backend write endpoints are not strictly guarded yet,
 * but we always forward the token so guards can be enabled later.
 * ------------------------------------------------------------------ */

const TOKEN_KEY = "ma_admin_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event("ma-auth-change"));
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function readApiError(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string | string[] };
    const msg = body.message;
    if (Array.isArray(msg)) return msg.join(", ");
    if (typeof msg === "string" && msg.length > 0) return msg;
  } catch {
    /* ignore */
  }
  return fallback;
}

export async function login(
  email: string,
  password: string,
): Promise<{ access_token: string; user: AuthUser }> {
  const res = await fetch(`${apiBase()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Invalid credentials"));
  }
  return res.json();
}

export async function registerUser(input: {
  email: string;
  password: string;
  name?: string;
}): Promise<{
  access_token: string;
  user: AuthUser;
  verificationRequired?: boolean;
  devVerifyToken?: string;
}> {
  const res = await fetch(`${apiBase()}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Registration failed"));
  }
  return res.json();
}

export type SocialAuthConfig = {
  googleClientId: string;
  facebookAppId: string;
  googleSignInEnabled: boolean;
  facebookSignInEnabled: boolean;
  googleUseDevFlow?: boolean;
  facebookUseDevFlow?: boolean;
};

export async function fetchSocialAuthConfig(): Promise<SocialAuthConfig> {
  const res = await fetch(`${apiBase()}/auth/social-config`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Could not load sign-in options");
  }
  return res.json();
}

export async function devSocialSignIn(
  provider: "google" | "facebook",
  email: string,
): Promise<{ access_token: string; user: AuthUser }> {
  const res = await fetch(`${apiBase()}/auth/dev/social`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider, email }),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Social sign-in failed"));
  }
  return res.json();
}

export async function googleSignIn(
  idToken: string,
): Promise<{ access_token: string; user: AuthUser }> {
  const res = await fetch(`${apiBase()}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Google sign-in failed"));
  }
  return res.json();
}

export async function facebookSignIn(
  accessToken: string,
): Promise<{ access_token: string; user: AuthUser }> {
  const res = await fetch(`${apiBase()}/auth/facebook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken }),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Facebook sign-in failed"));
  }
  return res.json();
}

export async function adminLogin(
  email: string,
  password: string,
): Promise<{ access_token: string; user: AuthUser }> {
  const res = await fetch(`${apiBase()}/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Invalid credentials"));
  }
  return res.json();
}

export async function adminGoogleSignIn(
  idToken: string,
): Promise<{ access_token: string; user: AuthUser }> {
  const res = await fetch(`${apiBase()}/admin/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Google sign-in failed"));
  }
  return res.json();
}

export async function requestPasswordReset(input: {
  email: string;
}): Promise<{ message: string; devOtp?: string; devNote?: string }> {
  const res = await fetch(`${apiBase()}/auth/forgot-password/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Could not send verification code"));
  }
  return res.json();
}

export async function resetPasswordWithOtp(input: {
  email: string;
  otp: string;
  newPassword: string;
}): Promise<{ message: string }> {
  const res = await fetch(`${apiBase()}/auth/forgot-password/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Could not reset password"));
  }
  return res.json();
}

export type AuthUser = {
  id: number;
  email: string;
  name: string | null;
  role: import("@/lib/roles").UserRole;
  isVerified?: boolean;
};

/* ---- Users (admin) ---- */

export type AdminUser = {
  id: number;
  name: string | null;
  email: string;
  role: AuthUser["role"];
  isActive: boolean;
  isVerified: boolean;
  isBlocked: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getUsers(): Promise<AdminUser[]> {
  const res = await fetch(`${apiBase()}/users`, {
    cache: "no-store",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function getUser(id: number): Promise<AdminUser> {
  const res = await fetch(`${apiBase()}/users/${id}`, {
    cache: "no-store",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export async function createUser(input: {
  email: string;
  password?: string;
  name?: string;
  role: AuthUser["role"];
}): Promise<AdminUser> {
  const res = await fetch(`${apiBase()}/users`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
}

export async function updateUser(
  id: number,
  input: Partial<{
    name: string;
    role: AuthUser["role"];
    isActive: boolean;
    isVerified: boolean;
    isBlocked: boolean;
  }>,
): Promise<AdminUser> {
  const res = await fetch(`${apiBase()}/users/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return res.json();
}

export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(`${apiBase()}/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete user");
}

export async function getAuthPolicy(): Promise<{
  passwordsStored: string;
  passwordHashAlgorithm?: string;
  bcryptRounds?: number;
  adminCanViewPasswords?: boolean;
  passwordReset: string;
  googleSignInEnabled: boolean;
  resetPath: string;
  passwordRequirementText?: string;
  staffRoles?: AuthUser["role"][];
  staffPasswordSecurity?: Array<{
    role: AuthUser["role"];
    passwordsStored: "bcrypt_hash_only";
    adminCanViewPassword: false;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumber: boolean;
      requireSpecial: boolean;
    };
  }>;
}> {
  const res = await fetch(`${apiBase()}/admin/config/auth-policy`, {
    cache: "no-store",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load auth policy");
  return res.json();
}

export async function sendUserPasswordReset(
  id: number,
): Promise<{
  message: string;
  devOtp?: string;
  devNote?: string;
}> {
  const res = await fetch(`${apiBase()}/users/${id}/send-password-reset`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Failed to send password reset"));
  }
  return res.json();
}

/* ---- News (admin) ---- */

export type NewsInput = {
  title: string;
  content: string;
  excerpt?: string;
  thumbnail?: string;
  featured?: boolean;
  status?: NewsArticle["status"];
};

export async function getAllNews(): Promise<NewsArticle[]> {
  const res = await fetch(`${apiBase()}/news/admin/all`, {
    cache: "no-store",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch news");
  return res.json();
}

export type TranslationCoverageRow = {
  locale: string;
  percent: number;
  news: { done: number; total: number };
  reviews: { done: number; total: number };
  devices: { done: number; total: number };
  brands?: { done: number; total: number };
  categories?: { done: number; total: number };
};

export async function getTranslationCoverage(
  locales?: string[],
): Promise<TranslationCoverageRow[]> {
  const qs =
    locales && locales.length > 0
      ? `?locales=${encodeURIComponent(locales.join(","))}`
      : "";
  const res = await fetch(
    `${apiBase()}/content-translations/workspace/coverage${qs}`,
    { cache: "no-store", headers: authHeaders() },
  );
  if (!res.ok) throw new Error("Failed to fetch translation coverage");
  return res.json();
}

export async function createNews(input: NewsInput): Promise<NewsArticle> {
  const res = await fetch(`${apiBase()}/news`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create article");
  return res.json();
}

export async function updateNews(
  id: number,
  input: Partial<NewsInput>,
): Promise<NewsArticle> {
  const res = await fetch(`${apiBase()}/news/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to update article");
  return res.json();
}

export async function deleteNews(id: number): Promise<void> {
  const res = await fetch(`${apiBase()}/news/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete article");
}

/* ---- Reviews (admin) ---- */

export type ReviewInput = {
  title: string;
  content: string;
  score: number;
  deviceId: number;
  pros?: string[];
  cons?: string[];
};

export async function createReview(input: ReviewInput): Promise<Review> {
  const res = await fetch(`${apiBase()}/reviews`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create review");
  return res.json();
}

export async function updateReview(
  id: number,
  input: Partial<ReviewInput>,
): Promise<Review> {
  const res = await fetch(`${apiBase()}/reviews/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to update review");
  return res.json();
}

export async function deleteReview(id: number): Promise<void> {
  const res = await fetch(`${apiBase()}/reviews/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete review");
}

export async function deleteComment(id: number): Promise<void> {
  const res = await fetch(`${apiBase()}/comments/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to delete comment"));
}

/* ---- Analytics ---- */

export type LabeledCount = { label: string; count: number };

export type CountryStat = {
  code: string;
  name: string;
  visitors: number;
  pageViews: number;
};

export type CountryComparison = CountryStat & { share: number };

export type AnalyticsDashboard = {
  liveNow: number;
  today: number;
  thisMonth: number;
  thisYear: number;
  allTime: number;
  byCountry: CountryStat[];
  topCountries: CountryStat[];
  topCities: LabeledCount[];
  topPages: LabeledCount[];
  devices: LabeledCount[];
  operatingSystems: LabeledCount[];
  browsers: LabeledCount[];
  referrers: LabeledCount[];
  comparison: CountryComparison[];
  filters: { from: string | null; to: string | null; country: string };
  updatedAt: string;
};

export type AnalyticsQuery = {
  from?: string;
  to?: string;
  country?: string;
  compareA?: string;
  compareB?: string;
};

function analyticsQueryString(q: AnalyticsQuery = {}) {
  const params = new URLSearchParams();
  if (q.from) params.set("from", q.from);
  if (q.to) params.set("to", q.to);
  if (q.country && q.country !== "ALL") params.set("country", q.country);
  if (q.compareA) params.set("compareA", q.compareA);
  if (q.compareB) params.set("compareB", q.compareB);
  const s = params.toString();
  return s ? `?${s}` : "";
}

/** Accepts current `{ code, visitors, pageViews }` and legacy `{ label, count }`. */
type RawCountryStat = {
  code?: string;
  name?: string;
  label?: string;
  visitors?: number;
  pageViews?: number;
  count?: number;
  share?: number;
};

function normalizeCountryStat(row: RawCountryStat): CountryStat {
  const code = row.code ?? row.label ?? "Unknown";
  const name =
    row.name ??
    countryName(code) ??
    (code !== "Unknown" ? code : (row.label ?? "Unknown"));
  const visitors = Number(row.visitors ?? row.count ?? 0);
  const pageViews = Number(row.pageViews ?? row.count ?? visitors);
  return { code, name, visitors, pageViews };
}

function normalizeCountryStats(rows: unknown): CountryStat[] {
  if (!Array.isArray(rows)) return [];
  return rows
    .filter(Boolean)
    .map((row) => normalizeCountryStat(row as RawCountryStat));
}

function normalizeCountryComparisons(rows: unknown): CountryComparison[] {
  if (!Array.isArray(rows)) return [];
  return rows.filter(Boolean).map((row) => {
    const stat = normalizeCountryStat(row as RawCountryStat);
    return { ...stat, share: Number((row as RawCountryStat).share ?? 0) };
  });
}

/* ------------------------------------------------------------------ *
 * Advertisement management (admin)
 * ------------------------------------------------------------------ */

export type AdCampaignStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED";

export type AdCampaign = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  advertiser?: string | null;
  budget?: number | null;
  cpm?: number | null;
  cpc?: number | null;
  revenueGoal?: number | null;
  status: AdCampaignStatus;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { advertisements: number };
  createdBy?: { id: number; email: string } | null;
};

export type ManagedAdvertisement = PaidAdvertisement & {
  impressionCount: number;
  clickCount: number;
  campaignId?: number | null;
  campaign?: {
    id: number;
    name: string;
    status: AdCampaignStatus;
    startsAt?: string | null;
    endsAt?: string | null;
  } | null;
};

export type RevenueAnalyticsBucket = {
  total: number;
  impressions: number;
  clicks: number;
  ctr: number;
  adCount: number;
};

export type AdRevenueReport = {
  summary: {
    totalImpressions: number;
    totalClicks: number;
    ctr: number;
    estimatedRevenue: number;
    activeCampaigns: number;
    scheduledCampaigns: number;
    totalAds: number;
    adRevenue?: number;
    affiliateEarnings?: number;
    sponsoredContentIncome?: number;
  };
  revenueAnalytics?: {
    adRevenue: RevenueAnalyticsBucket & {
      byAdType: Array<
        RevenueAnalyticsBucket & { adType: string; revenue: number }
      >;
    };
    affiliateEarnings: RevenueAnalyticsBucket & {
      byPlacement: Array<
        RevenueAnalyticsBucket & { placement: string; revenue: number }
      >;
    };
    sponsoredContentIncome: RevenueAnalyticsBucket & {
      activeDeals: number;
      byAd: Array<{
        id: number;
        title: string;
        advertiser?: string | null;
        impressions: number;
        clicks: number;
        revenue: number;
      }>;
    };
    campaignPerformance: Array<{
      id: number;
      name: string;
      status: AdCampaignStatus;
      advertiser?: string | null;
      budget?: number | null;
      revenueGoal?: number | null;
      cpm?: number | null;
      cpc?: number | null;
      startsAt?: string | null;
      endsAt?: string | null;
      adCount: number;
      impressions: number;
      clicks: number;
      ctr: number;
      estimatedRevenue: number;
      goalProgress: number | null;
      budgetUsedPct: number | null;
      performanceScore: number;
      roi: number | null;
    }>;
  };
  byCampaign: Array<{
    id: number;
    name: string;
    status: AdCampaignStatus;
    advertiser?: string | null;
    budget?: number | null;
    revenueGoal?: number | null;
    cpm?: number | null;
    cpc?: number | null;
    startsAt?: string | null;
    endsAt?: string | null;
    adCount: number;
    impressions: number;
    clicks: number;
    ctr: number;
    estimatedRevenue: number;
    goalProgress: number | null;
  }>;
  byAd: Array<{
    id: number;
    title: string;
    placement: string;
    advertiser?: string | null;
    campaignName?: string | null;
    impressions: number;
    clicks: number;
    ctr: number;
    estimatedRevenue: number;
    revenueCategory?: "ad" | "affiliate" | "sponsored";
  }>;
  daily: Array<{ date: string; impressions: number; clicks: number }>;
  byCountry?: Array<{
    code: string;
    name: string;
    impressions: number;
    clicks: number;
  }>;
  filters: { from: string | null; to: string | null; country?: string };
  generatedAt: string;
};

export async function listAdCampaigns(): Promise<AdCampaign[]> {
  const res = await fetch(`${apiBase()}/advertisements/admin/campaigns`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to load campaigns"));
  return res.json();
}

export async function createAdCampaign(input: {
  name: string;
  description?: string;
  advertiser?: string;
  budget?: number;
  cpm?: number;
  cpc?: number;
  revenueGoal?: number;
  status?: AdCampaignStatus;
  startsAt?: string;
  endsAt?: string;
}): Promise<AdCampaign> {
  const res = await fetch(`${apiBase()}/advertisements/admin/campaigns`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to create campaign"));
  return res.json();
}

export async function updateAdCampaign(
  id: number,
  input: Partial<{
    name: string;
    description: string;
    advertiser: string;
    budget: number;
    cpm: number;
    cpc: number;
    revenueGoal: number;
    status: AdCampaignStatus;
    startsAt: string | null;
    endsAt: string | null;
  }>,
): Promise<AdCampaign> {
  const res = await fetch(`${apiBase()}/advertisements/admin/campaigns/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to update campaign"));
  return res.json();
}

export async function deleteAdCampaign(id: number): Promise<void> {
  const res = await fetch(`${apiBase()}/advertisements/admin/campaigns/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to delete campaign"));
}

export async function listManagedAds(): Promise<ManagedAdvertisement[]> {
  const res = await fetch(`${apiBase()}/advertisements/admin/ads`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to load ads"));
  return res.json();
}

export async function updateManagedAd(
  id: number,
  input: Partial<{
    active: boolean;
    startsAt: string | null;
    endsAt: string | null;
    campaignId: number | null;
    priority: number;
    placement: string;
  }>,
): Promise<ManagedAdvertisement> {
  const res = await fetch(`${apiBase()}/advertisements/admin/ads/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to update ad"));
  return res.json();
}

export async function getAdRevenueReport(query?: {
  from?: string;
  to?: string;
  country?: string;
}): Promise<AdRevenueReport> {
  const params = new URLSearchParams();
  if (query?.from) params.set("from", query.from);
  if (query?.to) params.set("to", query.to);
  if (query?.country && query.country !== "ALL") params.set("country", query.country);
  const qs = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${apiBase()}/advertisements/admin/reports/revenue${qs}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to load revenue report"));
  return res.json();
}

export async function getAdRevenueAnalytics(query?: {
  from?: string;
  to?: string;
  country?: string;
}): Promise<AdRevenueReport> {
  return getAdRevenueReport(query);
}

export async function trackPageView(input: {
  visitorId: string;
  path: string;
  referrer?: string;
  countryCode?: string;
  city?: string;
}): Promise<void> {
  const countryCode = input.countryCode?.match(/^[A-Za-z]{2}$/)
    ? input.countryCode.toUpperCase()
    : undefined;

  const payload = JSON.stringify({
    visitorId: input.visitorId,
    path: input.path,
    referrer: input.referrer,
    countryCode,
    city: input.city,
  });

  try {
    const res = await fetch(`${apiBase()}/analytics/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });
    if (!res.ok) return;
  } catch {
    // Backend offline or unreachable — analytics must never break the UI
    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(
          `${apiBase()}/analytics/track`,
          new Blob([payload], { type: "application/json" }),
        );
      }
    } catch {
      /* ignore */
    }
  }
}

export async function getAnalyticsDashboard(
  query: AnalyticsQuery = {},
): Promise<AnalyticsDashboard> {
  const res = await fetch(
    `${apiBase()}/analytics/dashboard${analyticsQueryString(query)}`,
    {
      cache: "no-store",
      headers: authHeaders(),
    },
  );
  if (!res.ok) throw new Error("Failed to load analytics");
  const raw = (await res.json()) as Partial<AnalyticsDashboard> & {
    byCountry?: unknown;
    topCountries?: unknown;
    comparison?: unknown;
  };
  const byCountry = normalizeCountryStats(raw.byCountry);
  const topCountries = normalizeCountryStats(
    raw.topCountries ?? raw.byCountry,
  ).slice(0, 10);
  return {
    liveNow: raw.liveNow ?? 0,
    today: raw.today ?? 0,
    thisMonth: raw.thisMonth ?? 0,
    thisYear: raw.thisYear ?? 0,
    allTime: raw.allTime ?? 0,
    byCountry,
    topCountries,
    topCities: raw.topCities ?? [],
    topPages: raw.topPages ?? [],
    devices: raw.devices ?? [],
    operatingSystems: raw.operatingSystems ?? [],
    browsers: raw.browsers ?? [],
    referrers: raw.referrers ?? [],
    comparison: normalizeCountryComparisons(raw.comparison),
    filters: raw.filters ?? { from: null, to: null, country: "ALL" },
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}

export async function exportCountryTrafficCsv(
  query: AnalyticsQuery = {},
): Promise<Blob> {
  const res = await fetch(
    `${apiBase()}/analytics/countries/export${analyticsQueryString(query)}`,
    { headers: authHeaders() },
  );
  if (!res.ok) throw new Error("Failed to export country traffic");
  return res.blob();
}

/* ---- Bulk upload (validate → run → job polling) ---- */

export type ImportIssue = {
  rowIndex: number;
  row: Record<string, unknown>;
  reason: string;
  severity: "error" | "duplicate" | "warning";
};

export type ImportValidationResult = {
  kind: string;
  fileName: string;
  totalRows: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  canImport: boolean;
  issues: ImportIssue[];
  preview: Record<string, unknown>[];
};

export type ImportRunResult = {
  success: boolean;
  kind: string;
  jobId?: string;
  status: string;
  totalRows: number;
  inserted: number;
  updated: number;
  skipped: number;
  rolledBack: boolean;
  message?: string;
  issues: ImportIssue[];
};

export type ImportJobSnapshot = {
  id: string;
  kind: string;
  status: string;
  fileName: string;
  progress: number;
  totalRows: number;
  processedRows: number;
  inserted: number;
  updated: number;
  skipped: number;
  rolledBack: boolean;
  message?: string;
  issues: ImportIssue[];
  createdAt: string;
  finishedAt?: string;
};

async function uploadImport(
  path: string,
  file: File,
  query?: Record<string, string>,
): Promise<Response> {
  const token = getToken();
  const form = new FormData();
  form.append("file", file);
  const qs = query
    ? `?${new URLSearchParams(query).toString()}`
    : "";
  try {
    return await fetch(`${resolveUploadApiBase()}${path}${qs}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
  } catch (err) {
    const base = resolveUploadApiBase();
    const hint = base.startsWith("/")
      ? `${window.location.origin}${base}`
      : base;
    const message = `Cannot reach the API at ${hint}.`;
    if (err instanceof TypeError) {
      throw new Error(
        `${message} Start the backend from the repo root: npm run dev:backend (port 4000). Then restart the frontend so the /api proxy picks up .env.local.`,
      );
    }
    throw err instanceof Error ? err : new Error(`${message} Upload failed.`);
  }
}

export async function validateImportFile(
  kind: import("@/lib/content-permissions").BulkImportKind,
  file: File,
  options?: { slug?: string; subkind?: import("@/lib/content-permissions").EvUploadSubkind },
): Promise<ImportValidationResult> {
  const query: Record<string, string> = {};
  if (options?.slug?.trim()) query.slug = options.slug.trim();
  if (options?.subkind) query.subkind = options.subkind;
  const res = await uploadImport(`/import/${kind}/validate`, file, query);
  if (!res.ok) {
    throw new Error(await readApiError(res, "Validation failed"));
  }
  return res.json();
}

export async function runImportFile(
  kind: import("@/lib/content-permissions").BulkImportKind,
  file: File,
  options?: {
    atomic?: boolean;
    background?: boolean;
    slug?: string;
    subkind?: import("@/lib/content-permissions").EvUploadSubkind;
  },
): Promise<ImportRunResult> {
  const params = new URLSearchParams();
  if (options?.atomic === false) params.set("atomic", "false");
  if (options?.background === false) params.set("background", "false");
  if (options?.slug?.trim()) params.set("slug", options.slug.trim());
  if (options?.subkind) params.set("subkind", options.subkind);
  const qs = params.toString();
  const res = await uploadImport(
    `/import/${kind}/run${qs ? `?${qs}` : ""}`,
    file,
  );
  if (!res.ok) {
    throw new Error(await readApiError(res, "Upload failed"));
  }
  return res.json();
}

export async function getImportJob(jobId: string): Promise<ImportJobSnapshot> {
  const res = await fetch(`${apiBase()}/import/jobs/${jobId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch upload job");
  return res.json();
}

export async function downloadImportErrorReport(jobId: string): Promise<Blob> {
  const res = await fetch(`${apiBase()}/import/jobs/${jobId}/error-report`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to download error report");
  return res.blob();
}

/** @deprecated use runImportFile */
export type ImportResult = ImportRunResult;

/** @deprecated use runImportFile */
export async function uploadImportFile(
  kind: import("@/lib/content-permissions").ImportKind,
  file: File,
): Promise<ImportRunResult> {
  if (kind === "article-images") {
    throw new Error("Use news or images bulk upload instead");
  }
  return runImportFile(kind, file, { background: false });
}

/* ---- Upload history, bulk delete, audit ---- */

export type ImportBatchSummary = {
  id: number;
  kind: string;
  fileName: string;
  jobId: string | null;
  status: string;
  totalRows: number;
  inserted: number;
  skipped: number;
  deletedAt: string | null;
  purgedAt: string | null;
  createdAt: string;
  importedBy: { id: number; email: string; role: string };
  _count: { items: number };
};

export type ImportBatchDetail = ImportBatchSummary & {
  items: {
    id: number;
    entityType: string;
    entityId: number;
    entitySlug: string | null;
    entityName: string | null;
    deletedAt: string | null;
    device: {
      id: number;
      name: string;
      slug: string;
      deletedAt: string | null;
      brand: { name: string };
    } | null;
    advertisement: {
      id: number;
      title: string;
      slug: string;
      link: string;
      placement: string;
      deletedAt: string | null;
    } | null;
    brand: {
      id: number;
      name: string;
      slug: string;
      deletedAt: string | null;
    } | null;
    news: {
      id: number;
      title: string;
      slug: string;
      status: string;
      deletedAt: string | null;
    } | null;
  }[];
};

export type AuditLogEntry = {
  id: number;
  action: string;
  entity: string;
  entityId: string | null;
  createdAt: string;
  user: { id: number; name: string | null; email: string; role: string };
};

export async function listImportBatches(options?: {
  kind?: string;
  includeDeleted?: boolean;
}): Promise<ImportBatchSummary[]> {
  const params = new URLSearchParams();
  if (options?.kind) params.set("kind", options.kind);
  if (options?.includeDeleted) params.set("includeDeleted", "true");
  const qs = params.toString();
  const res = await fetch(`${apiBase()}/import/batches${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to load upload history"));
  return res.json();
}

export async function getImportBatch(id: number): Promise<ImportBatchDetail> {
  const res = await fetch(`${apiBase()}/import/batches/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to load upload batch"));
  return res.json();
}

export async function deleteImportBatch(id: number) {
  const res = await fetch(`${apiBase()}/import/batches/${id}/delete`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to delete upload"));
  return res.json();
}

export async function restoreImportBatch(id: number) {
  const res = await fetch(`${apiBase()}/import/batches/${id}/restore`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to restore upload"));
  return res.json();
}

export async function purgeImportBatch(id: number) {
  const res = await fetch(`${apiBase()}/import/batches/${id}/purge`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to purge upload"));
  return res.json();
}

export async function bulkDeleteAdvertisements(ids: number[]) {
  const res = await fetch(`${apiBase()}/import/advertisements/bulk-delete`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Failed to delete advertisements"));
  }
  return res.json();
}

export async function deleteAdvertisement(id: number) {
  const res = await fetch(`${apiBase()}/import/advertisements/bulk-delete`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ ids: [id] }),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Failed to delete advertisement"));
  }
  return res.json();
}

export async function restoreAdvertisement(id: number, batchId?: number) {
  const endpoints = [
    `${apiBase()}/import/batches/advertisements/restore`,
    `${apiBase()}/import/advertisements/bulk-restore`,
  ];

  let lastError = "Failed to restore advertisement";
  for (const url of endpoints) {
    const res = await fetch(url, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
    if (res.ok) {
      return res.json();
    }
    lastError = await readApiError(res, lastError);
    if (res.status !== 404) {
      throw new Error(lastError);
    }
  }

  if (batchId != null) {
    return restoreImportBatch(batchId);
  }

  throw new Error(lastError);
}

export async function bulkRestoreAdvertisements(ids: number[]) {
  const endpoints = [
    `${apiBase()}/import/batches/advertisements/restore`,
    `${apiBase()}/import/advertisements/bulk-restore`,
  ];

  let lastError = "Failed to restore advertisements";
  for (const url of endpoints) {
    const res = await fetch(url, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (res.ok) {
      return res.json();
    }
    lastError = await readApiError(res, lastError);
    if (res.status !== 404) {
      throw new Error(lastError);
    }
  }

  throw new Error(lastError);
}

export async function bulkDeletePhones(ids: number[]) {
  const res = await fetch(`${apiBase()}/import/phones/bulk-delete`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to delete phones"));
  return res.json();
}

export async function bulkDeleteBrands(ids: number[]) {
  const res = await fetch(`${apiBase()}/import/brands/bulk-delete`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to delete brands"));
  return res.json();
}

export async function deleteBrand(id: number) {
  const res = await fetch(`${apiBase()}/import/brands/bulk-delete`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ ids: [id] }),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to delete brand"));
  return res.json();
}

export async function restoreBrand(id: number, batchId?: number) {
  const res = await fetch(`${apiBase()}/import/batches/brands/restore`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ ids: [id] }),
  });
  if (res.ok) {
    return res.json();
  }
  const message = await readApiError(res, "Failed to restore brand");
  if (batchId != null) {
    return restoreImportBatch(batchId);
  }
  throw new Error(message);
}

export async function deletePhone(id: number) {
  const res = await fetch(`${apiBase()}/devices/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to delete phone"));
  return res.json();
}

export async function getAuditLogs(limit = 50): Promise<AuditLogEntry[]> {
  const res = await fetch(`${apiBase()}/audit-logs?limit=${limit}&scope=import`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to load audit logs"));
  return res.json();
}

export async function clearDeletedImportHistory() {
  const res = await fetch(`${apiBase()}/import/batches/clear-deleted`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Failed to clear deleted upload history"));
  }
  return res.json() as Promise<{ cleared: number }>;
}

export async function clearImportAuditLogs() {
  const res = await fetch(`${apiBase()}/audit-logs/clear-import`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Failed to clear audit log"));
  }
  return res.json() as Promise<{ cleared: number }>;
}

/* ------------------------------------------------------------------
 * User profile
 * ------------------------------------------------------------------ */

export type BrandSummary = {
  id: number;
  name: string;
  slug: string;
  logo?: string | null;
  favoritedAt?: string;
};

export type ProfileBadge = {
  id: number;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  pointsRequired: number;
  earned?: boolean;
  earnedAt?: string;
};

export type ProfileActivityItem =
  | {
      type: "comment";
      id: number;
      createdAt: string;
      device: { id: number; name: string; slug: string };
      body: string;
    }
  | {
      type: "rating";
      id: number;
      createdAt: string;
      device: { id: number; name: string; slug: string };
      score: number;
    };

export type UserProfile = {
  id: number;
  email: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  headline: string;
  role: string;
  reputationPoints: number;
  memberSince: string;
  settings: {
    headline: string | null;
    notifyReplies: boolean;
    notifyPriceAlerts: boolean;
    notifyNewsletter: boolean;
    profilePublic: boolean;
    twoFactorEnabled: boolean;
    hasPassword: boolean;
  };
  stats: {
    comments: number;
    ratings: number;
    favoriteBrands: number;
    bookmarks: number;
    favoriteDevices: number;
    wishlist: number;
    notificationsUnread: number;
    pollVotes: number;
    savedComparisons: number;
  };
  favoriteBrands: BrandSummary[];
  badges: {
    earned: ProfileBadge[];
    available: ProfileBadge[];
  };
  activity: ProfileActivityItem[];
};

export type BookmarkEntityType = "DEVICE" | "NEWS" | "REVIEW";

export type UserBookmark = {
  id: number;
  entityType: BookmarkEntityType;
  entityId: number;
  title: string | null;
  slug: string | null;
  createdAt: string;
};

export type FavoriteDevice = {
  id: number;
  name: string;
  slug: string;
  price?: number | null;
  rating?: number | null;
  favoritedAt?: string;
  brand?: { id: number; name: string; slug: string; logo?: string | null };
  images?: { url: string; thumbnail?: string | null }[];
};

export type WishlistItem = {
  id: number;
  targetPrice: number | null;
  alertEnabled: boolean;
  createdAt: string;
  device: FavoriteDevice;
};

export type ProfileComment = {
  id: number;
  body: string;
  createdAt: string;
  status?: CommentStatus;
  spamScore?: number;
  device: { id: number; name: string; slug: string };
};

export type ProfileRating = {
  id: number;
  score: number;
  createdAt: string;
  device: {
    id: number;
    name: string;
    slug: string;
    brand?: { name: string };
  };
};

export type ProfileNotification = {
  id: number;
  type: string;
  title: string;
  body: string;
  read: boolean;
  link: string | null;
  createdAt: string;
};

export type ProfilePollVote = {
  id: number;
  pollSlug: string;
  pollTitle: string;
  choice: string;
  createdAt: string;
};

export type BrandCategoryGroup = {
  category: { id: number; name: string; slug: string };
  brands: BrandSummary[];
};

export async function getBrands(locale?: string): Promise<BrandSummary[]> {
  const res = await fetch(withLocaleQuery(`${apiBase()}/brands`, locale), {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load brands");
  return res.json();
}

export async function getBrandsGrouped(
  locale?: string,
): Promise<BrandCategoryGroup[]> {
  const res = await fetch(
    withLocaleQuery(`${apiBase()}/brands/grouped`, locale),
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error("Failed to load brands");
  return res.json();
}

export type BrandDetail = BrandSummary & {
  locale?: string;
  localeSlugs?: Record<string, string>;
  devices: Device[];
};

export async function getBrandBySlug(
  slug: string,
  locale?: string,
): Promise<BrandDetail> {
  const res = await fetch(
    withLocaleQuery(
      `${apiBase()}/brands/slug/${encodeURIComponent(slug)}`,
      locale,
    ),
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error("Failed to load brand");
  return res.json();
}

export async function getMyProfile(): Promise<UserProfile> {
  const res = await fetch(`${apiBase()}/profile/me`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to load profile"));
  return res.json();
}

export async function updateMyProfile(input: {
  name?: string;
  bio?: string;
  headline?: string | null;
  avatar?: string | null;
}): Promise<UserProfile> {
  const res = await fetch(`${apiBase()}/profile/me`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to update profile"));
  return res.json();
}

export async function updateProfileSettings(input: {
  headline?: string | null;
  notifyReplies?: boolean;
  notifyPriceAlerts?: boolean;
  notifyNewsletter?: boolean;
  profilePublic?: boolean;
}): Promise<UserProfile> {
  const res = await fetch(`${apiBase()}/profile/me/settings`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to update settings"));
  return res.json();
}

export async function changeProfilePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ ok: boolean }> {
  const res = await fetch(`${apiBase()}/profile/me/change-password`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to change password"));
  return res.json();
}

export async function setProfileTwoFactor(input: {
  currentPassword: string;
  enabled: boolean;
}): Promise<{ ok: boolean; twoFactorEnabled: boolean }> {
  const path = input.enabled ? "enable" : "disable";
  const res = await fetch(`${apiBase()}/profile/me/2fa/${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ currentPassword: input.currentPassword }),
  });
  if (!res.ok) throw new Error(await readApiError(res, "2FA update failed"));
  return res.json();
}

export async function getMyComments(): Promise<ProfileComment[]> {
  const res = await fetch(`${apiBase()}/profile/me/comments`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to load comments"));
  return res.json();
}

export async function getMyRatings(): Promise<ProfileRating[]> {
  const res = await fetch(`${apiBase()}/profile/me/ratings`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to load reviews"));
  return res.json();
}

export async function getMyBookmarks(): Promise<UserBookmark[]> {
  const res = await fetch(`${apiBase()}/profile/me/bookmarks`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to load bookmarks"));
  return res.json();
}

export async function addBookmark(input: {
  entityType: BookmarkEntityType;
  entityId: number;
  title?: string;
  slug?: string;
}): Promise<UserBookmark> {
  const res = await fetch(`${apiBase()}/profile/me/bookmarks`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to add bookmark"));
  return res.json();
}

export async function removeBookmark(
  entityType: BookmarkEntityType,
  entityId: number,
): Promise<{ ok: boolean }> {
  const res = await fetch(
    `${apiBase()}/profile/me/bookmarks/${entityType}/${entityId}`,
    { method: "DELETE", headers: authHeaders() },
  );
  if (!res.ok) throw new Error(await readApiError(res, "Failed to remove bookmark"));
  return res.json();
}

export async function getFavoriteDevices(): Promise<FavoriteDevice[]> {
  const res = await fetch(`${apiBase()}/profile/me/favorite-devices`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to load favorites"));
  return res.json();
}

export async function addFavoriteDevice(deviceId: number): Promise<FavoriteDevice[]> {
  const res = await fetch(`${apiBase()}/profile/favorite-devices/${deviceId}`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to add favorite"));
  return res.json();
}

export async function removeFavoriteDevice(deviceId: number): Promise<FavoriteDevice[]> {
  const res = await fetch(`${apiBase()}/profile/favorite-devices/${deviceId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to remove favorite"));
  return res.json();
}

export async function getWishlist(): Promise<WishlistItem[]> {
  const res = await fetch(`${apiBase()}/profile/me/wishlist`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to load wishlist"));
  return res.json();
}

export async function addWishlistItem(
  deviceId: number,
  input?: { targetPrice?: number | null; alertEnabled?: boolean },
): Promise<WishlistItem> {
  const res = await fetch(`${apiBase()}/profile/wishlist/${deviceId}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input ?? {}),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to add to wishlist"));
  return res.json();
}

export async function updateWishlistItem(
  deviceId: number,
  input: { targetPrice?: number | null; alertEnabled?: boolean },
): Promise<WishlistItem> {
  const res = await fetch(`${apiBase()}/profile/wishlist/${deviceId}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to update wishlist"));
  return res.json();
}

export async function removeWishlistItem(deviceId: number): Promise<{ ok: boolean }> {
  const res = await fetch(`${apiBase()}/profile/wishlist/${deviceId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to remove from wishlist"));
  return res.json();
}

export async function getPublicNotifications(): Promise<
  import("@/lib/notification-inbox").PublicNotification[]
> {
  const res = await fetch(`${apiBase()}/notifications/public`, { cache: "no-store" });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to load notifications"));
  return res.json();
}

export async function getProfileNotifications(options?: {
  scope?: "replies" | "all";
}): Promise<ProfileNotification[]> {
  const scope = options?.scope === "replies" ? "replies" : undefined;
  const url = scope
    ? `${apiBase()}/profile/me/notifications?scope=replies`
    : `${apiBase()}/profile/me/notifications`;
  const res = await fetch(url, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to load notifications"));
  return res.json();
}

export async function markNotificationRead(id: number): Promise<ProfileNotification> {
  const res = await fetch(`${apiBase()}/profile/me/notifications/${id}/read`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to mark notification"));
  return res.json();
}

export async function markAllNotificationsRead(
  scope?: "replies" | "all",
): Promise<{ ok: boolean }> {
  const url =
    scope === "replies"
      ? `${apiBase()}/profile/me/notifications/read-all?scope=replies`
      : `${apiBase()}/profile/me/notifications/read-all`;
  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to mark notifications"));
  return res.json();
}

export async function deleteNotification(id: number): Promise<{ ok: boolean }> {
  const res = await fetch(`${apiBase()}/profile/me/notifications/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to delete notification"));
  return res.json();
}

export async function clearAllNotifications(): Promise<{ ok: boolean; cleared: number }> {
  const res = await fetch(`${apiBase()}/profile/me/notifications`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to clear notifications"));
  return res.json();
}

export async function getPollHistory(): Promise<ProfilePollVote[]> {
  const res = await fetch(`${apiBase()}/profile/me/polls`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to load poll history"));
  return res.json();
}

export async function addFavoriteBrand(brandId: number): Promise<UserProfile> {
  const res = await fetch(`${apiBase()}/profile/favorite-brands/${brandId}`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Failed to add favorite brand"));
  }
  return res.json();
}

export async function removeFavoriteBrand(
  brandId: number,
): Promise<UserProfile> {
  const res = await fetch(`${apiBase()}/profile/favorite-brands/${brandId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Failed to remove favorite brand"));
  }
  return res.json();
}

export type SavedComparison = {
  id: number;
  name: string | null;
  compareSlug: string;
  deviceSlugs: string[];
  createdAt: string;
};

export async function subscribeNewsletter(email: string): Promise<{ id: number }> {
  const res = await fetch(`${apiBase()}/newsletter/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Newsletter signup failed"));
  }
  return res.json();
}

export async function submitContactMessage(input: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): Promise<{ id: number; createdAt: string }> {
  const res = await fetch(`${apiBase()}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Could not send message"));
  }
  return res.json();
}

export async function getSavedComparisons(): Promise<SavedComparison[]> {
  const res = await fetch(`${apiBase()}/profile/me/comparisons`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Failed to load saved comparisons"));
  }
  return res.json();
}

export async function saveComparison(input: {
  deviceSlugs: string[];
  name?: string;
}): Promise<SavedComparison> {
  const res = await fetch(`${apiBase()}/profile/me/comparisons`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Failed to save comparison"));
  }
  return res.json();
}

export async function deleteSavedComparison(id: number): Promise<{ ok: boolean }> {
  const res = await fetch(`${apiBase()}/profile/me/comparisons/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Failed to delete comparison"));
  }
  return res.json();
}

export type SearchHistoryItem = {
  id: string;
  query: string;
  searchedAt: string;
};

export type TranslateVoiceResponse = {
  configured: boolean;
  originalText: string;
  translatedText: string;
  target: string;
  sourceLanguage?: string | null;
};

export async function getTranslateStatus(): Promise<{ configured: boolean }> {
  const res = await fetch(`${apiBase()}/translate/status`, { cache: "no-store" });
  if (!res.ok) return { configured: false };
  return res.json();
}

export async function translateVoiceQuery(input: {
  text: string;
  source?: string;
  target?: string;
}): Promise<TranslateVoiceResponse> {
  const res = await fetch(`${apiBase()}/translate/voice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Translation failed"));
  }
  return res.json();
}

export async function getSearchHistory(): Promise<SearchHistoryItem[]> {
  const res = await fetch(`${apiBase()}/profile/me/search-history`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to load search history"));
  return res.json();
}

export async function addSearchHistory(query: string): Promise<SearchHistoryItem[]> {
  const res = await fetch(`${apiBase()}/profile/me/search-history`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to save search"));
  return res.json();
}

export async function removeSearchHistory(id: number): Promise<SearchHistoryItem[]> {
  const res = await fetch(`${apiBase()}/profile/me/search-history/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to remove search"));
  return res.json();
}

export async function clearSearchHistory(): Promise<SearchHistoryItem[]> {
  const res = await fetch(`${apiBase()}/profile/me/search-history`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Failed to clear search history"));
  return res.json();
}
