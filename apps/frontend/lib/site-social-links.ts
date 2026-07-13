export type SiteSocialId = "facebook" | "youtube" | "x" | "instagram";

export type SiteSocialLink = {
  id: SiteSocialId;
  label: string;
  href: string;
};

function readSocialUrl(value: string | undefined, fallback: string): string {
  const next = (value ?? fallback).trim();
  return next;
}

/** Public social profiles — override via NEXT_PUBLIC_*_URL in .env.local */
export function getSiteSocialLinks(): SiteSocialLink[] {
  return [
    {
      id: "facebook",
      label: "Facebook",
      href: readSocialUrl(
        process.env.NEXT_PUBLIC_FACEBOOK_URL,
        "https://www.facebook.com/MobileArena",
      ),
    },
    {
      id: "youtube",
      label: "YouTube",
      href: readSocialUrl(
        process.env.NEXT_PUBLIC_YOUTUBE_URL,
        "https://www.youtube.com/@MobileArena",
      ),
    },
    {
      id: "x",
      label: "X",
      href: readSocialUrl(
        process.env.NEXT_PUBLIC_X_URL ?? process.env.NEXT_PUBLIC_TWITTER_URL,
        "https://x.com/MobileArena",
      ),
    },
    {
      id: "instagram",
      label: "Instagram",
      href: readSocialUrl(
        process.env.NEXT_PUBLIC_INSTAGRAM_URL,
        "https://www.instagram.com/mobilearena",
      ),
    },
  ];
}
