/**
 * Seed ContentTranslation rows for major brands so multilingual search works
 * (سامسونج, স্যামসাং, सैमसंग, 三星, 삼성, サムスン, Самсунг, …).
 *
 * Run: npx ts-node --transpile-only prisma/seeds/brand-translations.ts
 * Or from seed.ts via SEED_BRAND_TRANSLATIONS=true
 */
import { ContentEntityType, PrismaClient } from "@prisma/client";

type LocaleMap = Record<string, string>;

/** Display titles per locale. Keywords include romanizations + sibling spellings. */
const BRAND_TRANSLATIONS: Record<
  string,
  { titles: LocaleMap; keywords: string }
> = {
  samsung: {
    titles: {
      hi: "सैमसंग",
      bn: "স্যামসাং",
      ar: "سامسونج",
      "zh-CN": "三星",
      "zh-TW": "三星",
      ja: "サムスン",
      ko: "삼성",
      ru: "Самсунг",
      ur: "سام سنگ",
      tr: "Samsung",
      es: "Samsung",
      fr: "Samsung",
      de: "Samsung",
      "pt-BR": "Samsung",
    },
    keywords:
      "Samsung,سامسونج,স্যামসাং,सैमसंग,三星,三星電子,삼성,サムスン,Самсунг,سام سنگ",
  },
  apple: {
    titles: {
      hi: "एप्पल",
      bn: "অ্যাপল",
      ar: "أبل",
      "zh-CN": "苹果",
      "zh-TW": "蘋果",
      ja: "アップル",
      ko: "애플",
      ru: "Эппл",
      ur: "ایپل",
      tr: "Apple",
      es: "Apple",
      fr: "Apple",
      de: "Apple",
    },
    keywords: "Apple,أبل,এপল,एप्पल,苹果,蘋果,애플,アップル,Эппл,ایپل,iPhone",
  },
  xiaomi: {
    titles: {
      hi: "शाओमी",
      bn: "শাওমি",
      ar: "شاومي",
      "zh-CN": "小米",
      "zh-TW": "小米",
      ja: "シャオミ",
      ko: "샤오미",
      ru: "Сяоми",
      ur: "شاؤمی",
      tr: "Xiaomi",
    },
    keywords: "Xiaomi,Mi,شاومي,শাওমি,शाओमी,小米,샤오미,シャオミ,Сяоми",
  },
  google: {
    titles: {
      hi: "गूगल",
      bn: "গুগল",
      ar: "جوجل",
      "zh-CN": "谷歌",
      ja: "グーグル",
      ko: "구글",
      ru: "Гугл",
    },
    keywords: "Google,Pixel,جوجل,গুগল,गूगल,谷歌,구글,グーグル,Гугл",
  },
  oneplus: {
    titles: {
      hi: "वनप्लस",
      bn: "ওয়ানপ্লাস",
      ar: "ون بلس",
      "zh-CN": "一加",
      ja: "ワンプラス",
      ko: "원플러스",
      ru: "ВанПлюс",
    },
    keywords: "OnePlus,ون بلس,ওয়ানপ্লাস,वनप्लस,一加,원플러스,ワンプラス",
  },
  oppo: {
    titles: {
      hi: "ओप्पो",
      bn: "অপ্পো",
      ar: "أوبو",
      "zh-CN": "欧珀",
      ja: "オッポ",
      ko: "오포",
    },
    keywords: "OPPO,Oppo,أوبو,অপ্পো,ओप्पो,欧珀,오포,オッポ",
  },
  vivo: {
    titles: {
      hi: "विवो",
      bn: "ভিভো",
      ar: "فيفو",
      "zh-CN": "维沃",
      ja: "ビボ",
      ko: "비보",
    },
    keywords: "vivo,Vivo,فيفو,ভিভো,विवो,维沃,비보",
  },
  motorola: {
    titles: {
      hi: "मोटोरोला",
      bn: "মটোরোলা",
      ar: "موتورولا",
      "zh-CN": "摩托罗拉",
      ja: "モトローラ",
      ko: "모토로라",
      ru: "Моторола",
    },
    keywords: "Motorola,Moto,موتورولا,মটোরোলা,मोटोरोला,摩托罗拉,모토로라",
  },
  nothing: {
    titles: {
      hi: "नथिंग",
      bn: "নাথিং",
      ar: "ناثينغ",
      "zh-CN": "那物",
      ja: "ナッシング",
      ko: "낫싱",
    },
    keywords: "Nothing,ناثينغ,নাথিং,नथिंग,那物,낫싱,ナッシング",
  },
  sony: {
    titles: {
      hi: "सोनी",
      bn: "সনি",
      ar: "سوني",
      "zh-CN": "索尼",
      ja: "ソニー",
      ko: "소니",
      ru: "Сони",
    },
    keywords: "Sony,سوني,সনি,सोनी,索尼,소니,ソニー,Сони",
  },
  huawei: {
    titles: {
      hi: "हुवावे",
      bn: "হুয়াওয়ে",
      ar: "هواوي",
      "zh-CN": "华为",
      ja: "ファーウェイ",
      ko: "화웨이",
      ru: "Хуавэй",
    },
    keywords: "Huawei,هواوي,হুয়াওয়ে,हुवावे,华为,화웨이,ファーウェイ",
  },
  realme: {
    titles: {
      hi: "रियलमी",
      bn: "রিয়েলমি",
      ar: "ريلمي",
      "zh-CN": "真我",
      ja: "リアルミー",
      ko: "리얼미",
    },
    keywords: "realme,ريلمي,রিয়েলমি,रियलमी,真我,리얼미",
  },
  honor: {
    titles: {
      hi: "ऑनर",
      bn: "অনার",
      ar: "هونر",
      "zh-CN": "荣耀",
      ja: "オナー",
      ko: "아너",
    },
    keywords: "Honor,هونر,অনার,ऑनर,荣耀,아너",
  },
  asus: {
    titles: {
      hi: "एसस",
      bn: "এসাস",
      ar: "أسوس",
      "zh-CN": "华硕",
      ja: "エイスース",
      ko: "에이수스",
    },
    keywords: "ASUS,Asus,أسوس,এসাস,एसस,华硕,에이수스",
  },
  nokia: {
    titles: {
      hi: "नोकिया",
      bn: "নকিয়া",
      ar: "نوكيا",
      "zh-CN": "诺基亚",
      ja: "ノキア",
      ko: "노키아",
      ru: "Нокиа",
    },
    keywords: "Nokia,نوكيا,নকিয়া,नोकिया,诺基亚,노키아,ノキア",
  },
};

function brandKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export async function seedBrandTranslations(prisma: PrismaClient) {
  const brands = await prisma.brand.findMany({
    select: { id: true, name: true, slug: true },
  });

  let upserts = 0;
  for (const brand of brands) {
    const key = brandKey(brand.slug) || brandKey(brand.name);
    const pack = BRAND_TRANSLATIONS[key];
    if (!pack) continue;

    // English row: keep canonical name, store all aliases for cross-locale search.
    await prisma.contentTranslation.upsert({
      where: {
        entityType_entityId_locale: {
          entityType: ContentEntityType.BRAND,
          entityId: brand.id,
          locale: "en",
        },
      },
      create: {
        entityType: ContentEntityType.BRAND,
        entityId: brand.id,
        locale: "en",
        title: brand.name,
        keywords: pack.keywords,
        aliases: pack.keywords,
        status: "PUBLISHED",
        source: "seed",
      },
      update: {
        title: brand.name,
        keywords: pack.keywords,
        aliases: pack.keywords,
        status: "PUBLISHED",
        source: "seed",
      },
    });
    upserts += 1;

    for (const [locale, title] of Object.entries(pack.titles)) {
      await prisma.contentTranslation.upsert({
        where: {
          entityType_entityId_locale: {
            entityType: ContentEntityType.BRAND,
            entityId: brand.id,
            locale,
          },
        },
        create: {
          entityType: ContentEntityType.BRAND,
          entityId: brand.id,
          locale,
          title,
          keywords: pack.keywords,
          aliases: pack.keywords,
          status: "PUBLISHED",
          source: "seed",
        },
        update: {
          title,
          keywords: pack.keywords,
          aliases: pack.keywords,
          status: "PUBLISHED",
          source: "seed",
        },
      });
      upserts += 1;
    }
  }

  console.log(`✅ Brand translations upserted (${upserts} rows)`);
}
