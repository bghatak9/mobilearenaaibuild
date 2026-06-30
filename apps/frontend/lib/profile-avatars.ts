/** MobileArena-generated avatar presets (no third-party image APIs). */

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function hue(seed: string, offset = 0): number {
  return (hashSeed(seed) + offset) % 360;
}

function svgDataUrl(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function buildAuroraAvatar(seed: string): string {
  const h1 = hue(seed, 0);
  const h2 = hue(seed, 97);
  const h3 = hue(seed, 193);
  const initial = (seed.trim()[0] ?? "A").toUpperCase();
  return svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="hsl(${h1} 82% 52%)"/>
        <stop offset="100%" stop-color="hsl(${h2} 78% 46%)"/>
      </linearGradient>
    </defs>
    <rect width="96" height="96" rx="24" fill="url(#g)"/>
    <circle cx="72" cy="24" r="18" fill="hsl(${h3} 70% 58% / 0.45)"/>
    <text x="48" y="58" text-anchor="middle" font-size="34" font-family="system-ui,sans-serif" font-weight="700" fill="#fff">${initial}</text>
  </svg>`);
}

function buildRingsAvatar(seed: string): string {
  const h = hue(seed, 40);
  return svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <rect width="96" height="96" rx="48" fill="hsl(${h} 24% 14%)"/>
    <circle cx="48" cy="48" r="30" fill="none" stroke="hsl(${h} 85% 58%)" stroke-width="5"/>
    <circle cx="48" cy="48" r="18" fill="none" stroke="hsl(${(h + 60) % 360} 80% 62%)" stroke-width="4"/>
    <circle cx="48" cy="48" r="8" fill="hsl(${(h + 120) % 360} 78% 60%)"/>
  </svg>`);
}

function buildMosaicAvatar(seed: string): string {
  const base = hue(seed, 12);
  const tiles = Array.from({ length: 9 }, (_, i) => {
    const shade = 28 + (hashSeed(`${seed}:${i}`) % 28);
    return `<rect x="${(i % 3) * 32}" y="${Math.floor(i / 3) * 32}" width="32" height="32" fill="hsl(${(base + i * 27) % 360} 68% ${shade}%)"/>`;
  }).join("");
  return svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">${tiles}</svg>`);
}

function buildOrbitAvatar(seed: string): string {
  const h = hue(seed, 220);
  return svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <rect width="96" height="96" rx="20" fill="hsl(${h} 30% 12%)"/>
    <ellipse cx="48" cy="50" rx="30" ry="12" fill="none" stroke="hsl(${h} 82% 58%)" stroke-width="4"/>
    <circle cx="72" cy="38" r="7" fill="hsl(${(h + 90) % 360} 85% 62%)"/>
    <circle cx="24" cy="58" r="5" fill="hsl(${(h + 180) % 360} 80% 60%)"/>
  </svg>`);
}

function buildWaveAvatar(seed: string): string {
  const h = hue(seed, 55);
  return svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <defs>
      <linearGradient id="w" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="hsl(${h} 78% 56%)"/>
        <stop offset="100%" stop-color="hsl(${(h + 45) % 360} 72% 38%)"/>
      </linearGradient>
    </defs>
    <rect width="96" height="96" rx="24" fill="url(#w)"/>
    <path d="M0 58 C16 42 32 72 48 56 S80 40 96 58 V96 H0Z" fill="rgba(255,255,255,0.18)"/>
  </svg>`);
}

function buildPrismAvatar(seed: string): string {
  const h = hue(seed, 140);
  return svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <rect width="96" height="96" rx="24" fill="hsl(${h} 22% 16%)"/>
    <polygon points="48,18 78,72 18,72" fill="hsl(${h} 78% 58%)"/>
    <polygon points="48,30 66,68 30,68" fill="hsl(${(h + 70) % 360} 82% 64%)"/>
  </svg>`);
}

export const AVATAR_PRESETS = [
  { id: "aurora", label: "Aurora", build: buildAuroraAvatar },
  { id: "rings", label: "Rings", build: buildRingsAvatar },
  { id: "mosaic", label: "Mosaic", build: buildMosaicAvatar },
  { id: "orbit", label: "Orbit", build: buildOrbitAvatar },
  { id: "wave", label: "Wave", build: buildWaveAvatar },
  { id: "prism", label: "Prism", build: buildPrismAvatar },
] as const;

export function defaultAvatarUrl(email: string): string {
  return AVATAR_PRESETS[0].build(email);
}

export function resolveAvatarUrl(
  avatar: string | null | undefined,
  email: string,
): string {
  if (avatar?.trim()) return avatar.trim();
  return defaultAvatarUrl(email);
}
