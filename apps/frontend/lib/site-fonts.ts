/**
 * Script-aware font loading for MobileArena.
 * Latin/Inter loads always; CJK / Arabic / Indic families use preload:false
 * and activate via [data-site-lang] CSS so only needed glyphs are requested.
 */

import {
  Inter,
  JetBrains_Mono,
  Noto_Sans,
  Noto_Sans_Arabic,
  Noto_Sans_Bengali,
  Noto_Sans_Devanagari,
  Noto_Sans_JP,
  Noto_Sans_KR,
  Noto_Sans_SC,
  Noto_Sans_TC,
  Space_Grotesk,
} from "next/font/google";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
});

export const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  display: "swap",
  preload: false,
});

export const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari"],
  display: "swap",
  preload: false,
});

export const notoBengali = Noto_Sans_Bengali({
  variable: "--font-noto-bengali",
  subsets: ["bengali"],
  display: "swap",
  preload: false,
});

export const notoSC = Noto_Sans_SC({
  variable: "--font-noto-sc",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

export const notoTC = Noto_Sans_TC({
  variable: "--font-noto-tc",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

export const notoJP = Noto_Sans_JP({
  variable: "--font-noto-jp",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

export const notoKR = Noto_Sans_KR({
  variable: "--font-noto-kr",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

/** Generic Noto for Vietnamese and extended Latin. */
export const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
  preload: false,
});

export const siteFontVariables = [
  inter.variable,
  spaceGrotesk.variable,
  jetbrainsMono.variable,
  notoArabic.variable,
  notoDevanagari.variable,
  notoBengali.variable,
  notoSC.variable,
  notoTC.variable,
  notoJP.variable,
  notoKR.variable,
  notoSans.variable,
].join(" ");
