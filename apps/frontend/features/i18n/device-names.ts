import { displayBrandName } from "@/lib/brand-visuals";

import type { ResolvedSiteLanguage } from "./languages";
import { localizeBrandName } from "./brand-names";
import { numberToChinese } from "./technical-text";

function brandKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** English aliases that may appear inside a device marketing name. */
function brandAliases(brand: string): string[] {
  const en = displayBrandName(brand);
  const key = brandKey(brand);
  const extras: Record<string, string[]> = {
    xiaomi: ["Xiaomi", "Mi"],
    samsung: ["Samsung"],
    google: ["Google"],
    googlepixel: ["Google Pixel", "Google", "Pixel"],
    pixel: ["Pixel"],
    apple: ["Apple"],
    appleiphone: ["Apple", "iPhone"],
    iphone: ["iPhone"],
    oneplus: ["OnePlus", "One Plus"],
    realme: ["realme", "Realme"],
    nothing: ["Nothing"],
    motorola: ["Motorola", "Moto"],
    asus: ["ASUS", "Asus"],
    asusrog: ["ASUS ROG", "ASUS", "ROG"],
    redmi: ["Redmi"],
    poco: ["POCO", "Poco"],
    iqoo: ["iQOO", "IQOO"],
    honor: ["Honor", "HONOR"],
    huawei: ["Huawei", "HUAWEI"],
    sony: ["Sony"],
    nokia: ["Nokia"],
    tecno: ["TECNO", "Tecno"],
    infinix: ["Infinix"],
    nubia: ["nubia", "Nubia"],
    redmagic: ["RedMagic", "REDMAGIC", "Red Magic"],
    cmf: ["CMF"],
    hmd: ["HMD"],
    jiophone: ["JioPhone", "Jio Phone"],
    micromax: ["Micromax"],
    lava: ["Lava"],
    oppo: ["OPPO", "Oppo"],
    vivo: ["vivo", "Vivo", "VIVO"],
  };

  const list = [en, brand, ...(extras[key] ?? [])];
  return [...new Set(list.map((s) => s.trim()).filter(Boolean))].sort(
    (a, b) => b.length - a.length,
  );
}

/**
 * Marketing / series tokens → fully localized labels (longest keys first).
 * Keeps model codes (16, S25, F8) intact.
 */
const MARKETING_TOKENS: Partial<
  Record<ResolvedSiteLanguage, Array<[string, string]>>
> = {
  zh: [
    ["Red Magic", "红魔"],
    ["RedMagic", "红魔"],
    ["Galaxy", "盖乐世"],
    ["Pixel", "像素"],
    ["iPhone", "苹果手机"],
    ["Phone", "手机"],
    ["Ultra", "至尊版"],
    ["Plus", "增强版"],
    ["Pro", "专业版"],
    ["Max", "最大版"],
    ["Lite", "轻量版"],
    ["Mini", "迷你版"],
    ["Edge", "锐界"],
    ["Note", "笔记"],
    ["Fold", "折叠屏"],
    ["Flip", "小折叠"],
    ["Neo", "新锐"],
    ["Air", "轻薄版"],
    ["FE", "粉丝版"],
    ["SE", "特别版"],
    ["GT", "竞速"],
    ["POCO", "青春"],
    ["Poco", "青春"],
    ["ROG", "玩家国度"],
    ["Edition", "版"],
    ["Series", "系列"],
  ],
  hi: [
    ["Red Magic", "रेडमैजिक"],
    ["RedMagic", "रेडमैजिक"],
    ["Galaxy", "गैलेक्सी"],
    ["Pixel", "पिक्सेल"],
    ["iPhone", "आईफ़ोन"],
    ["Phone", "फ़ोन"],
    ["Ultra", "अल्ट्रा"],
    ["Plus", "प्लस"],
    ["Pro", "प्रो"],
    ["Max", "मैक्स"],
    ["Lite", "लाइट"],
    ["Mini", "मिनी"],
    ["Edge", "एज"],
    ["Note", "नोट"],
    ["Fold", "फोल्ड"],
    ["Flip", "फ्लिप"],
    ["Neo", "नियो"],
    ["GT", "जीटी"],
    ["POCO", "पोको"],
    ["ROG", "आरओजी"],
  ],
  ar: [
    ["Galaxy", "جالاكسي"],
    ["Pixel", "بيكسل"],
    ["Phone", "هاتف"],
    ["Ultra", "ألترا"],
    ["Plus", "بلس"],
    ["Pro", "برو"],
    ["Max", "ماكس"],
    ["Edge", "إيدج"],
    ["Note", "نوت"],
    ["Fold", "فولد"],
    ["Flip", "فليب"],
  ],
  bn: [
    ["Galaxy", "গ্যালাক্সি"],
    ["Pixel", "পিক্সেল"],
    ["Phone", "ফোন"],
    ["Ultra", "আল্ট্রা"],
    ["Plus", "প্লাস"],
    ["Pro", "প্রো"],
    ["Max", "ম্যাক্স"],
    ["Edge", "এজ"],
  ],
  ur: [
    ["Galaxy", "گیلیکسی"],
    ["Pixel", "پکسل"],
    ["Phone", "فون"],
    ["Ultra", "الٹرا"],
    ["Plus", "پلس"],
    ["Pro", "پرو"],
    ["Max", "میکس"],
    ["Edge", "ایج"],
  ],
  ja: [
    ["Galaxy", "ギャラクシー"],
    ["Pixel", "ピクセル"],
    ["Phone", "フォン"],
    ["Ultra", "ウルトラ"],
    ["Plus", "プラス"],
    ["Pro", "プロ"],
    ["Max", "マックス"],
    ["Edge", "エッジ"],
    ["Fold", "フォルド"],
    ["Flip", "フリップ"],
  ],
  ko: [
    ["Galaxy", "갤럭시"],
    ["Pixel", "픽셀"],
    ["Phone", "폰"],
    ["Ultra", "울트라"],
    ["Plus", "플러스"],
    ["Pro", "프로"],
    ["Max", "맥스"],
    ["Edge", "엣지"],
    ["Fold", "폴드"],
    ["Flip", "플립"],
  ],
};

function applyMarketingTokens(
  name: string,
  lang: ResolvedSiteLanguage,
): string {
  const tokens = MARKETING_TOKENS[lang];
  if (!tokens?.length) return name;

  let result = name;
  for (const [from, to] of tokens) {
    const re = new RegExp(`(^|[\\s(-])${escapeRegExp(from)}(?=[\\s)\\-]|$)`, "gi");
    result = result.replace(re, `$1${to}`);
  }
  return result;
}

/**
 * Strip leftover Latin model letters and convert digits → Chinese numerals
 * so titles are fully Chinese (小米十六专业版, not 小米 16 专业版).
 */
function finalizeFullyChinese(name: string): string {
  return name
    .replace(/\b[A-Za-z]+(\d+)\b/g, (_, digits: string) =>
      numberToChinese(Number(digits)),
    )
    .replace(/\d+/g, (digits) => numberToChinese(Number(digits)))
    .replace(/[A-Za-z]+/g, "")
    .replace(/\s+/g, "")
    .replace(/[·.•]+/g, "")
    .trim();
}

/**
 * Localize a device marketing name for the active site language.
 * Brand + marketing tokens + (zh) Chinese numerals so titles are fully local
 * (e.g. Xiaomi 16 Pro → 小米十六专业版).
 */
export function localizeDeviceName(
  name: string,
  brand: string | null | undefined,
  lang: ResolvedSiteLanguage,
): string {
  const raw = name.trim();
  if (!raw || lang === "en") return raw;

  let result = raw;
  const brandLocal = brand ? localizeBrandName(brand, lang) : "";
  const brandEn = brand ? displayBrandName(brand) : "";

  if (brand && brandLocal) {
    let replaced = false;
    for (const alias of brandAliases(brand)) {
      if (alias === brandLocal) continue;
      const re = new RegExp(
        "(^|[\\s(-])(" +
          escapeRegExp(alias) +
          ")(?=[\\s)\\-]|" +
          "$" +
          "|\\d)",
        "i",
      );
      if (re.test(result)) {
        result = result.replace(re, `$1${brandLocal}`);
        replaced = true;
        break;
      }
      const startRe = new RegExp("^" + escapeRegExp(alias) + "(?=\\s|$|\\d)", "i");
      if (startRe.test(result)) {
        result = result.replace(startRe, brandLocal);
        replaced = true;
        break;
      }
    }

    if (!replaced && brandLocal !== brandEn) {
      const already =
        result === brandLocal ||
        result.startsWith(`${brandLocal} `) ||
        result.startsWith(brandLocal);
      if (!already) {
        result = `${brandLocal} ${result}`;
      }
    }
  }

  result = applyMarketingTokens(result, lang);

  if (lang === "zh") {
    result = result
      .replace(/\bPOCO\b/gi, "青春")
      .replace(/\bROG\b/g, "玩家国度")
      .replace(/\bCMF\b/g, "")
      .replace(/\bGT\b/g, "竞速");
    return finalizeFullyChinese(result);
  }

  return result.replace(/\s+/g, " ").trim();
}
