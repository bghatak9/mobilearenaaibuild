const VISITOR_GEO_KEY = "ma_visitor_geo";

export type VisitorGeo = {
  countryCode: string;
  city?: string;
};

/** Map common IANA time zones to ISO country codes (fallback only). */
const TIMEZONE_COUNTRY: Record<string, string> = {
  "Asia/Kolkata": "IN",
  "Asia/Calcutta": "IN",
  "Asia/Karachi": "PK",
  "Asia/Dubai": "AE",
  "Asia/Singapore": "SG",
  "Asia/Tokyo": "JP",
  "Asia/Shanghai": "CN",
  "Asia/Bangkok": "TH",
  "Europe/London": "GB",
  "Europe/Paris": "FR",
  "Europe/Berlin": "DE",
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",
  "America/Toronto": "CA",
  "Australia/Sydney": "AU",
};

function readCached(): VisitorGeo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(VISITOR_GEO_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VisitorGeo;
    if (parsed?.countryCode?.length === 2) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

function cacheGeo(geo: VisitorGeo) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(VISITOR_GEO_KEY, JSON.stringify(geo));
  } catch {
    /* ignore */
  }
}

function timezoneFallback(): VisitorGeo | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const code = TIMEZONE_COUNTRY[tz];
    if (code) return { countryCode: code };
  } catch {
    /* ignore */
  }
  return null;
}

export function getCachedVisitorCountryCode(): string | undefined {
  return readCached()?.countryCode;
}

/** Resolve visitor country/city for analytics when the API sees a local IP. */
export async function resolveVisitorGeo(): Promise<VisitorGeo | null> {
  const cached = readCached();
  if (cached) return cached;

  try {
    const res = await fetch("https://ipwho.is/", {
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = (await res.json()) as {
        success?: boolean;
        country_code?: string;
        city?: string;
      };
      const code = data.country_code?.trim().toUpperCase();
      if (code && /^[A-Z]{2}$/.test(code)) {
        const geo: VisitorGeo = {
          countryCode: code,
          city: data.city?.trim() || undefined,
        };
        cacheGeo(geo);
        return geo;
      }
    }
  } catch {
    /* fall through */
  }

  const fallback = timezoneFallback();
  if (fallback) {
    cacheGeo(fallback);
    return fallback;
  }

  return null;
}
