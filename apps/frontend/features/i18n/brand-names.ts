import type { ResolvedSiteLanguage } from "./languages";
import { displayBrandName } from "@/lib/brand-visuals";

/** Curated brand labels — avoids machine-translation mangling (e.g. Realme → “read me”). */
const BRAND_I18N: Record<string, Partial<Record<ResolvedSiteLanguage, string>>> = {
  apple: {
    hi: "एप्पल",
    zh: "苹果",
    es: "Apple",
    ar: "أبل",
    ja: "アップル",
    ko: "애플",
    fr: "Apple",
    de: "Apple",
    pt: "Apple",
    ru: "Эппл",
    bn: "অ্যাপল",
    ur: "ایپل",
    mr: "ऍपल",
    te: "యాపిల్",
    ta: "ஆப்பிள்",
    gu: "એપલ",
    kn: "ಆಪಲ್",
    ml: "ആപ്പിൾ",
  },
  appleiphone: {
    hi: "एप्पल (आईफ़ोन)",
    zh: "苹果",
    es: "Apple (iPhone)",
    ar: "أبل (آيفون)",
    bn: "অ্যাপল (আইফোন)",
    ur: "ایپل (آئی فون)",
    mr: "ऍपल (आयफोन)",
    te: "యాపిల్ (ఐఫోన్)",
    ta: "ஆப்பிள் (ஐபோன்)",
  },
  iphone: {
    hi: "आईफ़ोन",
    zh: "苹果",
    ar: "آيفون",
    bn: "আইফোন",
  },
  samsung: {
    hi: "सैमसंग",
    zh: "三星",
    es: "Samsung",
    ar: "سامسونج",
    ja: "サムスン",
    ko: "삼성",
    bn: "স্যামসাং",
    ur: "سام سنگ",
    mr: "सॅमसंग",
    te: "శామ్‌సంగ్",
    ta: "சாம்சங்",
    fr: "Samsung",
    de: "Samsung",
    ru: "Самсунг",
  },
  google: {
    hi: "गूगल",
    zh: "谷歌",
    ar: "جوجل",
    bn: "গুগল",
    ja: "グーグル",
    ko: "구글",
  },
  googlepixel: {
    hi: "गूगल पिक्सेल",
    zh: "谷歌像素",
    ar: "جوجل بيكسل",
    bn: "গুগল পিক্সেল",
    ur: "گوگل پکسل",
    es: "Google Pixel",
    fr: "Google Pixel",
  },
  pixel: {
    hi: "पिक्सेल",
    zh: "像素",
    ar: "بيكسل",
  },
  oppo: {
    hi: "ओप्पो",
    zh: "欧珀",
    ar: "أوبو",
    bn: "অপ্পো",
    ur: "اوپو",
    es: "OPPO",
  },
  realme: {
    hi: "रियलमी",
    zh: "真我",
    ar: "ريلمي",
    bn: "রিয়েলমি",
    es: "realme",
    ur: "ریلمی",
    mr: "रिअलमी",
  },
  vivo: {
    hi: "विवो",
    zh: "维沃",
    ar: "فيفو",
    bn: "ভিভো",
    ur: "ویوو",
  },
  xiaomi: {
    hi: "शाओमी",
    zh: "小米",
    ar: "شاومي",
    bn: "শাওমি",
    ja: "シャオミ",
    ko: "샤오미",
    ur: "شاؤمی",
    mr: "शाओमी",
  },
  redmi: {
    hi: "रेडमी",
    zh: "红米",
    ar: "ريدمي",
    bn: "রেডমি",
    ur: "ریڈمی",
  },
  poco: {
    hi: "पोको",
    zh: "小米青春",
    ar: "بوكو",
    bn: "পোকো",
    ur: "پوکو",
  },
  oneplus: {
    hi: "वनप्लस",
    zh: "一加",
    ar: "ون بلس",
    bn: "ওয়ানপ্লাস",
    ur: "ون پلس",
  },
  motorola: {
    hi: "मोटोरोला",
    zh: "摩托罗拉",
    ar: "موتورولا",
    bn: "মটোরোলা",
    es: "Motorola",
    ur: "موٹورولا",
  },
  honor: {
    hi: "ऑनर",
    zh: "荣耀",
    ar: "هونر",
    bn: "অনার",
    ur: "آنر",
  },
  nothing: {
    hi: "नथिंग",
    zh: "那物",
    ar: "ناثينغ",
    bn: "নাথিং",
    ur: "ناتھنگ",
  },
  nokia: {
    hi: "नोकिया",
    zh: "诺基亚",
    ar: "نوكيا",
    bn: "নকিয়া",
    ur: "نوکیا",
  },
  tecno: {
    hi: "टेक्नो",
    zh: "传音",
    ar: "تكنو",
    bn: "টেকনো",
    ur: "ٹیکنو",
  },
  infinix: {
    hi: "इनफिनिक्स",
    zh: "因菲尼克斯",
    ar: "إنفينيكس",
    bn: "ইনফিনিক্স",
    ur: "انفنکس",
  },
  iqoo: {
    hi: "आईक्यूओओ",
    zh: "爱酷",
    ar: "آيكو",
    bn: "আইকিউওও",
    ur: "آئی کیو او او",
  },
  ai: {
    hi: "एआई प्लस",
    zh: "智能加",
    ar: "اي بلس",
    bn: "এআই প্লাস",
    ur: "اے آئی پلس",
    es: "Ai+",
  },
  asus: {
    hi: "एसस",
    zh: "华硕",
    ar: "أسوس",
    bn: "এসাস",
    ur: "ایسوس",
  },
  asusrog: {
    hi: "एसस आरओजी",
    zh: "华硕玩家国度",
    ar: "أسوس روج",
    bn: "এসাস আরওজি",
    ur: "ایسوس آر او جی",
  },
  huawei: {
    hi: "हुवावे",
    zh: "华为",
    ar: "هواوي",
    bn: "হুয়াওয়ে",
    ja: "ファーウェイ",
    ko: "화웨이",
  },
  sony: {
    hi: "सोनी",
    zh: "索尼",
    ar: "سوني",
    bn: "সনি",
    ja: "ソニー",
  },
  lg: {
    hi: "एलजी",
    zh: "乐金",
    ar: "إل جي",
  },
  cmf: {
    hi: "सीएमएफ",
    zh: "那物配件",
    ar: "سي ام اف",
    bn: "সিএমএফ",
  },
  hmd: {
    hi: "एचएमडी",
    zh: "赫姆德",
    ar: "اتش ام دي",
    bn: "এইচএমডি",
  },
  jiophone: {
    hi: "जियोफ़ोन",
    zh: "吉奥手机",
    ar: "جيو فون",
    bn: "জিওফোন",
    ur: "جیو فون",
  },
  lava: {
    hi: "लावा",
    zh: "拉瓦",
    bn: "লাভা",
    ar: "لافا",
    ur: "لاوا",
  },
  micromax: {
    hi: "माइक्रोमैक्स",
    zh: "麦克罗马克斯",
    bn: "মাইক্রোম্যাক্স",
    ar: "مايكروماكس",
    ur: "مائیکرو میکس",
  },
  nubia: {
    hi: "नुबिया",
    zh: "努比亚",
    ar: "نوبيا",
    bn: "নুবিয়া",
  },
  redmagic: {
    hi: "रेडमैजिक",
    zh: "红魔",
    ar: "ريد ماجيك",
    bn: "রেডম্যাজিক",
  },
  tcl: {
    hi: "टीसीएल",
    zh: "王牌",
    ar: "تي سي ال",
  },
  htc: {
    hi: "एचटीसी",
    zh: "宏达电",
    ar: "اتش تي سي",
  },
};

function brandKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function lookupBrand(
  name: string,
  lang: ResolvedSiteLanguage,
): string | undefined {
  const key = brandKey(name);
  const mapped = BRAND_I18N[key]?.[lang];
  if (mapped) return mapped;
  const base = brandKey(name.split("(")[0] ?? name);
  return BRAND_I18N[base]?.[lang];
}

/** Strip leftover Latin from zh brand labels (Ai+, HMD, …). */
function finalizeBrandLabel(
  label: string,
  lang: ResolvedSiteLanguage,
): string {
  if (lang !== "zh" || !/[A-Za-z]/.test(label)) return label;

  const result = label
    .replace(/\bAi\+/gi, "智能加")
    .replace(/\bAI\+/gi, "智能加")
    .replace(/\bJioPhone\b/gi, "吉奥手机")
    .replace(/\bJio\b/gi, "吉奥")
    .replace(/\bHMD\b/gi, "赫姆德")
    .replace(/\bLG\b/gi, "乐金")
    .replace(/\bHTC\b/gi, "宏达电")
    .replace(/\bTCL\b/gi, "王牌")
    .replace(/\bROG\b/gi, "玩家国度")
    .replace(/\bCMF\b/gi, "配件")
    .replace(/\bPOCO\b/gi, "青春")
    .replace(/\bPixel\b/gi, "像素")
    .replace(/\biPhone\b/gi, "苹果")
    .replace(/\bPhone\b/gi, "手机")
    .replace(/[A-Za-z]+/g, "")
    .replace(/[+＋]+/g, "")
    .replace(/\s+/g, "")
    .trim();

  return result || label;
}

export type BrandLabelResolution = {
  label: string;
  /** True when we have a curated label — lock against Google Translate. */
  curated: boolean;
};

/** Localized brand label for the active site language. Falls back to English display name. */
export function localizeBrandName(
  name: string,
  lang: ResolvedSiteLanguage,
): string {
  return resolveBrandLabel(name, lang).label;
}

export function resolveBrandLabel(
  name: string,
  lang: ResolvedSiteLanguage,
): BrandLabelResolution {
  const english = displayBrandName(name);
  if (lang === "en") return { label: english, curated: true };
  const mapped = lookupBrand(name, lang);
  if (mapped) {
    return { label: finalizeBrandLabel(mapped, lang), curated: true };
  }
  // No curated map — leave English unlocked so Google Translate can handle it.
  return { label: english, curated: false };
}

export function isCuratedBrandTranslation(
  name: string,
  lang: ResolvedSiteLanguage,
): boolean {
  return resolveBrandLabel(name, lang).curated;
}
