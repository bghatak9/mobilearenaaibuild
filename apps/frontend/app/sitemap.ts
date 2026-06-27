import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getDevices, getNews, getReviews } from "@/lib/api";

async function safe<T>(p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch {
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [devices, news, reviews] = await Promise.all([
    safe(getDevices()),
    safe(getNews()),
    safe(getReviews()),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/phones",
    "/compare",
    "/news",
    "/reviews",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: path === "" ? 1 : 0.7,
  }));

  const deviceRoutes: MetadataRoute.Sitemap = (devices ?? []).map((d) => ({
    url: `${SITE_URL}/phones/${d.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const newsRoutes: MetadataRoute.Sitemap = (news ?? []).map((n) => ({
    url: `${SITE_URL}/news/${n.slug}`,
    lastModified: n.publishedAt ? new Date(n.publishedAt) : undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const reviewRoutes: MetadataRoute.Sitemap = (reviews ?? []).map((r) => ({
    url: `${SITE_URL}/reviews/${r.slug}`,
    lastModified: r.publishedAt ? new Date(r.publishedAt) : undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...deviceRoutes, ...newsRoutes, ...reviewRoutes];
}
