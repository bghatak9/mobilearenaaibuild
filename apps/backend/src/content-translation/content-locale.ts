import { ContentEntityType, Prisma } from '@prisma/client';

/** English-canonical fields that translations may override. */
export type TranslatableContent = {
  title?: string | null;
  /** Device/brand display name (canonical Latin lives on parent row). */
  name?: string | null;
  slug?: string | null;
  summary?: string | null;
  excerpt?: string | null;
  content?: string | null;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  keywords?: string | null;
  pros?: unknown;
  cons?: unknown;
};

export type LocalizedContentMeta = {
  locale: string;
  localeFallback: 'exact' | 'en' | 'canonical';
};

export type LocalizedContent<T extends TranslatableContent> = Omit<
  T,
  keyof LocalizedContentMeta
> &
  LocalizedContentMeta;

const DEFAULT_LOCALE = 'en';

function pickString(
  preferred: string | null | undefined,
  fallback: string | null | undefined,
  canonical: string | null | undefined,
): string | null | undefined {
  if (preferred != null && preferred !== '') return preferred;
  if (fallback != null && fallback !== '') return fallback;
  return canonical;
}

function pickJson(
  preferred: unknown,
  fallback: unknown,
  canonical: unknown,
): unknown {
  if (preferred != null) return preferred;
  if (fallback != null) return fallback;
  return canonical;
}

/**
 * Merge parent (canonical EN) with locale + English translation rows.
 * For DEVICE/BRAND, ContentTranslation.title maps onto display `name`
 * (English/Latin canonical remains on the parent row as fallback).
 * Never mutate chipset / SKU / numeric identity fields here.
 */
export function mergeLocalizedContent<T extends TranslatableContent>(
  canonical: T,
  locale: string | null | undefined,
  localeRow: TranslatableContent | null | undefined,
  enRow: TranslatableContent | null | undefined,
): LocalizedContent<T> {
  const requested = (locale ?? DEFAULT_LOCALE).trim() || DEFAULT_LOCALE;
  const isEn = requested.toLowerCase() === DEFAULT_LOCALE || requested.toLowerCase().startsWith('en');

  const primary = isEn ? enRow ?? localeRow : localeRow;
  const secondary = isEn ? null : enRow;

  const hasProse = (row: TranslatableContent | null | undefined) =>
    Boolean(
      row &&
        (row.title ||
          row.name ||
          row.content ||
          row.summary ||
          row.excerpt ||
          row.description ||
          row.seoTitle ||
          row.seoDescription),
    );

  let localeFallback: LocalizedContentMeta['localeFallback'] = 'canonical';
  if (hasProse(primary)) {
    localeFallback = 'exact';
  } else if (hasProse(secondary)) {
    localeFallback = 'en';
  }

  const title = pickString(primary?.title, secondary?.title, canonical.title);
  // Prefer explicit translation title/name for display name (device & brand).
  const name = pickString(
    primary?.title ?? primary?.name,
    secondary?.title ?? secondary?.name,
    canonical.name ?? canonical.title,
  );
  const summary = pickString(
    primary?.summary ?? primary?.excerpt,
    secondary?.summary ?? secondary?.excerpt,
    canonical.summary ?? canonical.excerpt,
  );
  const content = pickString(primary?.content, secondary?.content, canonical.content);
  const description = pickString(
    primary?.description,
    secondary?.description,
    canonical.description,
  );
  const seoTitle = pickString(primary?.seoTitle, secondary?.seoTitle, canonical.seoTitle);
  const seoDescription = pickString(
    primary?.seoDescription,
    secondary?.seoDescription,
    canonical.seoDescription,
  );
  const keywords = pickString(primary?.keywords, secondary?.keywords, canonical.keywords);
  const slug = pickString(primary?.slug, secondary?.slug, canonical.slug);
  const pros = pickJson(primary?.pros, secondary?.pros, canonical.pros);
  const cons = pickJson(primary?.cons, secondary?.cons, canonical.cons);

  return {
    ...canonical,
    ...(canonical.name !== undefined || name
      ? { name: name ?? canonical.name }
      : {}),
    title: title ?? canonical.title,
    slug: slug ?? canonical.slug,
    summary: summary ?? undefined,
    excerpt: summary ?? canonical.excerpt,
    content: content ?? canonical.content,
    description: description ?? canonical.description,
    seoTitle: seoTitle ?? canonical.seoTitle,
    seoDescription: seoDescription ?? canonical.seoDescription,
    keywords: keywords ?? canonical.keywords,
    pros: pros ?? canonical.pros,
    cons: cons ?? canonical.cons,
    locale: requested,
    localeFallback,
  };
}

export type { ContentEntityType };
export { DEFAULT_LOCALE };

export function normalizeLocaleParam(locale?: string | null): string {
  if (!locale || !locale.trim()) return DEFAULT_LOCALE;
  return locale.trim().replace(/_/g, '-');
}

export type TranslationUpsertInput = {
  title?: string | null;
  shortName?: string | null;
  headline?: string | null;
  slug?: string | null;
  summary?: string | null;
  content?: string | null;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  keywords?: string | null;
  aliases?: string | null;
  status?: string | null;
  source?: string | null;
  pros?: Prisma.InputJsonValue | null;
  cons?: Prisma.InputJsonValue | null;
};
