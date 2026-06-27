export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type Device = {
  id: number;
  slug: string;
  name: string;
  price?: number | null;
  rating?: number | null;
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
  }[];
  images?: { id: number; url: string; thumbnail?: string | null }[];
  reviews?: { id: number; slug: string; title: string; score: number }[];
};

export type CompareResult = {
  devices: Device[];
  winners: Record<string, number[]>;
};

export async function getDevices(search?: string): Promise<Device[]> {
  const url = search
    ? `${API_URL}/devices?search=${encodeURIComponent(search)}`
    : `${API_URL}/devices`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch devices");
  return res.json();
}

export async function getDeviceById(id: string): Promise<Device> {
  const res = await fetch(`${API_URL}/devices/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch device");
  return res.json();
}

export async function getDeviceBySlug(slug: string): Promise<Device> {
  const res = await fetch(`${API_URL}/devices/slug/${slug}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch device");
  return res.json();
}

export async function compareDevices(
  slug: string,
): Promise<CompareResult | null> {
  const res = await fetch(`${API_URL}/compare/${slug}`, { cache: "no-store" });
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
};

export async function getNews(params?: {
  status?: NewsArticle["status"];
  featured?: boolean;
}): Promise<NewsArticle[]> {
  const qs = new URLSearchParams();
  qs.set("status", params?.status ?? "PUBLISHED");
  if (params?.featured !== undefined) qs.set("featured", String(params.featured));

  const res = await fetch(`${API_URL}/news?${qs.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch news");
  return res.json();
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle> {
  const res = await fetch(`${API_URL}/news/${slug}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch article");
  return res.json();
}

export async function getReviews(deviceId?: number): Promise<Review[]> {
  const url = deviceId
    ? `${API_URL}/reviews?deviceId=${deviceId}`
    : `${API_URL}/reviews`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
}

export async function getReviewBySlug(slug: string): Promise<Review> {
  const res = await fetch(`${API_URL}/reviews/${slug}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch review");
  return res.json();
}
