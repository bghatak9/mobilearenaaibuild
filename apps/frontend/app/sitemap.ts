import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getBrands, getDevices, getNews, getReviews } from "@/lib/api";
import {
  ENABLED_LOCALES,
  getLocaleMeta,
  getMessagePackLocales,
} from "@/i18n/locales";

async function safe<T>(p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch {
    return null;
  }
}

function localizedEntry(
  path: string,
  extras: Omit<MetadataRoute.Sitemap[number], "url" | "alternates"> = {},
): MetadataRoute.Sitemap {
  const languages: Record<string, string> = {};
  for (const loc of ENABLED_LOCALES) {
    const suffix = path === "/" ? "" : path;
    languages[getLocaleMeta(loc).bcp47] = `${SITE_URL}/${loc}${suffix}`;
  }
  languages["x-default"] = `${SITE_URL}/en${path === "/" ? "" : path}`;

  return ENABLED_LOCALES.map((locale) => {
    const suffix = path === "/" ? "" : path;
    return {
      url: `${SITE_URL}/${locale}${suffix}`,
      alternates: { languages },
      ...extras,
    };
  });
}

/**
 * Build hreflang map for a content item. Prefer localized slug per locale when
 * the localized fetch returned a different slug; fall back to canonical EN slug.
 */
function contentLanguageMap(
  kind: "news" | "reviews" | "phones" | "brands",
  canonicalSlug: string,
  localizedSlugs: Record<string, string>,
): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const loc of ENABLED_LOCALES) {
    const slug = localizedSlugs[loc] ?? canonicalSlug;
    languages[getLocaleMeta(loc).bcp47] =
      `${SITE_URL}/${loc}/${kind}/${slug}`;
  }
  languages["x-default"] = `${SITE_URL}/en/${kind}/${canonicalSlug}`;
  return languages;
}

function contentRoutes(
  kind: "news" | "reviews" | "phones" | "brands",
  items: { id: number; slug: string; publishedAt?: string | null }[],
  slugByLocale: Record<number, Record<string, string>>,
  extras: {
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  },
): MetadataRoute.Sitemap {
  return items.flatMap((item) => {
    const localized = slugByLocale[item.id] ?? {};
    const languages = contentLanguageMap(kind, item.slug, localized);
    // Emit one URL per enabled locale; use localized slug when known, else EN.
    return ENABLED_LOCALES.map((locale) => {
      const slug = localized[locale] ?? item.slug;
      return {
        url: `${SITE_URL}/${locale}/${kind}/${slug}`,
        lastModified: item.publishedAt
          ? new Date(item.publishedAt)
          : undefined,
        changeFrequency: extras.changeFrequency,
        priority: extras.priority,
        alternates: { languages },
      };
    });
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch localized slugs only for message-pack locales (where CMS rows exist).
  // Sitemap URLs still cover every enabled locale with EN slug fallback.
  const indexLocales = getMessagePackLocales();

  const [devicesEn, newsEn, reviewsEn, brandsEn, ...localizedNewsBundles] =
    await Promise.all([
      safe(getDevices(undefined, "en")),
      safe(getNews({ locale: "en" })),
      safe(getReviews(undefined, "en")),
      safe(getBrands("en")),
      ...indexLocales.map((locale) =>
        Promise.all([
          safe(getNews({ locale })),
          safe(getReviews(undefined, locale)),
          safe(getDevices(undefined, locale)),
          safe(getBrands(locale)),
        ]),
      ),
    ]);

  const newsSlugByLocale: Record<number, Record<string, string>> = {};
  const reviewSlugByLocale: Record<number, Record<string, string>> = {};
  const deviceSlugByLocale: Record<number, Record<string, string>> = {};
  const brandSlugByLocale: Record<number, Record<string, string>> = {};

  indexLocales.forEach((locale, i) => {
    const [news, reviews, devices, brands] = localizedNewsBundles[i] ?? [
      null,
      null,
      null,
      null,
    ];
    for (const n of news ?? []) {
      (newsSlugByLocale[n.id] ??= {})[locale] = n.slug;
    }
    for (const r of reviews ?? []) {
      (reviewSlugByLocale[r.id] ??= {})[locale] = r.slug;
    }
    for (const d of devices ?? []) {
      (deviceSlugByLocale[d.id] ??= {})[locale] = d.slug;
    }
    for (const b of brands ?? []) {
      (brandSlugByLocale[b.id] ??= {})[locale] = b.slug;
    }
  });

  const staticPaths = [
    "/",
    "/phones",
    "/brands",
    "/phone-finder",
    "/community",
    "/compare",
    "/news",
    "/reviews",
    "/guides",
  ];

  const staticRoutes = staticPaths.flatMap((path) =>
    localizedEntry(path, {
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: path === "/" ? 1 : 0.7,
    }),
  );

  const deviceRoutes = contentRoutes(
    "phones",
    devicesEn ?? [],
    deviceSlugByLocale,
    { changeFrequency: "weekly", priority: 0.8 },
  );

  const newsRoutes = contentRoutes(
    "news",
    newsEn ?? [],
    newsSlugByLocale,
    { changeFrequency: "monthly", priority: 0.6 },
  );

  const reviewRoutes = contentRoutes(
    "reviews",
    reviewsEn ?? [],
    reviewSlugByLocale,
    { changeFrequency: "monthly", priority: 0.6 },
  );

  const brandRoutes = contentRoutes(
    "brands",
    brandsEn ?? [],
    brandSlugByLocale,
    { changeFrequency: "weekly", priority: 0.65 },
  );

  return [
    ...staticRoutes,
    ...deviceRoutes,
    ...newsRoutes,
    ...reviewRoutes,
    ...brandRoutes,
  ];
}
