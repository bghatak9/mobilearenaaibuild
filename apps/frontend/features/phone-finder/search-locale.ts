export type SearchLanguageCode =
  | "auto"
  | "en"
  | "hi"
  | "es"
  | "fr"
  | "de"
  | "pt"
  | "ja"
  | "ko"
  | "zh"
  | "ar"
  | "id";

export type ResolvedSearchLanguage = Exclude<SearchLanguageCode, "auto">;

export const SEARCH_LANGUAGES: {
  code: SearchLanguageCode;
  label: string;
  nativeLabel: string;
  speechTag: string;
}[] = [
  { code: "auto", label: "Auto", nativeLabel: "Auto", speechTag: "" },
  { code: "en", label: "English", nativeLabel: "English", speechTag: "en-US" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", speechTag: "hi-IN" },
  { code: "es", label: "Spanish", nativeLabel: "Español", speechTag: "es-ES" },
  { code: "fr", label: "French", nativeLabel: "Français", speechTag: "fr-FR" },
  { code: "de", label: "German", nativeLabel: "Deutsch", speechTag: "de-DE" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português", speechTag: "pt-BR" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語", speechTag: "ja-JP" },
  { code: "ko", label: "Korean", nativeLabel: "한국어", speechTag: "ko-KR" },
  { code: "zh", label: "Chinese", nativeLabel: "中文", speechTag: "zh-CN" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", speechTag: "ar-SA" },
  { code: "id", label: "Indonesian", nativeLabel: "Bahasa Indonesia", speechTag: "id-ID" },
];

const STORAGE_KEY = "mobilearena:search-language";

const EN_STOPWORDS = [
  "best",
  "phone",
  "phones",
  "mobile",
  "smartphone",
  "smartphones",
  "with",
  "the",
  "a",
  "an",
  "for",
  "under",
  "below",
  "over",
  "above",
  "good",
  "great",
  "top",
  "new",
  "latest",
  "device",
  "devices",
  "buy",
  "cheap",
  "show",
  "find",
  "search",
];

const STOPWORDS_BY_LANG: Record<ResolvedSearchLanguage, string[]> = {
  en: EN_STOPWORDS,
  hi: [
    ...EN_STOPWORDS,
    "फोन",
    "मोबाइल",
    "स्मार्टफोन",
    "के",
    "तहत",
    "से",
    "कम",
    "में",
    "का",
    "की",
    "को",
    "और",
    "सबसे",
    "अच्छा",
    "नया",
    "खोजें",
    "दिखाएं",
  ],
  es: [
    ...EN_STOPWORDS,
    "teléfono",
    "teléfonos",
    "móvil",
    "móviles",
    "con",
    "el",
    "la",
    "los",
    "las",
    "para",
    "bajo",
    "menos",
    "mejor",
    "nuevo",
    "buscar",
    "mostrar",
    "encuentra",
  ],
  fr: [
    ...EN_STOPWORDS,
    "téléphone",
    "téléphones",
    "mobile",
    "mobiles",
    "avec",
    "le",
    "la",
    "les",
    "pour",
    "sous",
    "moins",
    "meilleur",
    "nouveau",
    "chercher",
    "trouver",
    "afficher",
  ],
  de: [
    ...EN_STOPWORDS,
    "handy",
    "handys",
    "telefon",
    "telefone",
    "mit",
    "der",
    "die",
    "das",
    "für",
    "unter",
    "weniger",
    "beste",
    "neu",
    "suchen",
    "finden",
    "zeigen",
  ],
  pt: [
    ...EN_STOPWORDS,
    "telefone",
    "telefones",
    "celular",
    "celulares",
    "com",
    "o",
    "a",
    "os",
    "as",
    "para",
    "abaixo",
    "menos",
    "melhor",
    "novo",
    "buscar",
    "encontrar",
    "mostrar",
  ],
  ja: [
    ...EN_STOPWORDS,
    "スマホ",
    "スマートフォン",
    "携帯",
    "電話",
    "の",
    "を",
    "に",
    "で",
    "と",
    "以下",
    "未満",
    "検索",
    "探す",
    "表示",
  ],
  ko: [
    ...EN_STOPWORDS,
    "폰",
    "스마트폰",
    "휴대폰",
    "의",
    "을",
    "를",
    "이",
    "가",
    "에서",
    "미만",
    "이하",
    "검색",
    "찾기",
    "보기",
  ],
  zh: [
    ...EN_STOPWORDS,
    "手机",
    "智能手机",
    "的",
    "在",
    "和",
    "与",
    "以下",
    "低于",
    "搜索",
    "查找",
    "显示",
  ],
  ar: [
    ...EN_STOPWORDS,
    "هاتف",
    "هواتف",
    "جوال",
    "مع",
    "في",
    "و",
    "أقل",
    "تحت",
    "بحث",
    "اعثر",
    "عرض",
  ],
  id: [
    ...EN_STOPWORDS,
    "ponsel",
    "hp",
    "telepon",
    "dengan",
    "di",
    "dan",
    "untuk",
    "di bawah",
    "kurang",
    "terbaik",
    "baru",
    "cari",
    "tampilkan",
    "temukan",
  ],
};

const PRICE_UNDER_PATTERNS: Record<ResolvedSearchLanguage, RegExp> = {
  en: /\b(?:under|below|less than|max|budget)\b/i,
  hi: /\b(?:के\s*तहत|से\s*कम|अंदर|कम\s*से\s*कम)\b/i,
  es: /\b(?:bajo|menos de|por debajo de|máximo)\b/i,
  fr: /\b(?:sous|moins de|en dessous de|max)\b/i,
  de: /\b(?:unter|weniger als|maximal|budget)\b/i,
  pt: /\b(?:abaixo de|menos de|máximo|orçamento)\b/i,
  ja: /\b(?:以下|未満|まで)\b/i,
  ko: /\b(?:미만|이하|이내)\b/i,
  zh: /\b(?:以下|低于|以内|不超过)\b/i,
  ar: /\b(?:أقل من|تحت|بحد أقصى)\b/i,
  id: /\b(?:di bawah|kurang dari|maksimum)\b/i,
};

const COMPARE_PATTERNS: Record<ResolvedSearchLanguage, RegExp> = {
  en: /compare\s+(.+?)\s+(?:and|vs\.?|versus)\s+(.+)/i,
  hi: /(?:तुलना|compare)\s+(.+?)\s+(?:और|vs|बनाम)\s+(.+)/i,
  es: /(?:comparar|compare)\s+(.+?)\s+(?:y|vs|contra)\s+(.+)/i,
  fr: /(?:comparer|compare)\s+(.+?)\s+(?:et|vs|contre)\s+(.+)/i,
  de: /(?:vergleiche|compare)\s+(.+?)\s+(?:und|vs|gegen)\s+(.+)/i,
  pt: /(?:comparar|compare)\s+(.+?)\s+(?:e|vs|com)\s+(.+)/i,
  ja: /(?:比較|compare)\s*(.+?)\s*(?:と|vs|対)\s*(.+)/i,
  ko: /(?:비교|compare)\s+(.+?)\s+(?:와|과|vs)\s+(.+)/i,
  zh: /(?:比较|compare)\s*(.+?)\s*(?:和|与|vs|对比)\s*(.+)/i,
  ar: /(?:قارن|compare)\s+(.+?)\s+(?:و|vs|مع)\s+(.+)/i,
  id: /(?:bandingkan|compare)\s+(.+?)\s+(?:dan|vs|dengan)\s+(.+)/i,
};

const VOICE_PREFIX_PATTERNS: Record<ResolvedSearchLanguage, RegExp> = {
  en: /^(show|find|search)\s+/i,
  hi: /^(दिखाएं|खोजें|ढूंढें|search)\s+/i,
  es: /^(mostrar|buscar|encuentra|search)\s+/i,
  fr: /^(afficher|trouver|chercher|search)\s+/i,
  de: /^(zeigen|finden|suchen|search)\s+/i,
  pt: /^(mostrar|buscar|encontrar|search)\s+/i,
  ja: /^(表示|検索|探す|search)\s*/i,
  ko: /^(보기|검색|찾기|search)\s+/i,
  zh: /^(显示|搜索|查找|search)\s*/i,
  ar: /^(عرض|بحث|اعثر|search)\s+/i,
  id: /^(tampilkan|cari|temukan|search)\s+/i,
};

const GAMING_PATTERNS: Record<ResolvedSearchLanguage, RegExp> = {
  en: /gaming|esports|performance/i,
  hi: /गेमिंग|खेल/i,
  es: /gaming|juegos|videojuegos/i,
  fr: /gaming|jeux/i,
  de: /gaming|spiele/i,
  pt: /gaming|jogos/i,
  ja: /ゲーム|ゲーミング/i,
  ko: /게임|게이밍/i,
  zh: /游戏|电竞|gaming/i,
  ar: /ألعاب|gaming/i,
  id: /gaming|game|permainan/i,
};

const CAMERA_PATTERNS: Record<ResolvedSearchLanguage, RegExp> = {
  en: /best camera|great camera|camera phone|photography|selfie/i,
  hi: /सबसे\s*अच्छा\s*कैमरा|कैमरा\s*फोन|फोटोग्राफी/i,
  es: /mejor cámara|cámara|fotografía|selfie/i,
  fr: /meilleur appareil photo|caméra|photo|selfie/i,
  de: /beste kamera|kamera|fotografie|selfie/i,
  pt: /melhor câmera|câmera|fotografia|selfie/i,
  ja: /最高のカメラ|カメラ|写真|自撮り/i,
  ko: /최고의 카메라|카메라|사진|셀카/i,
  zh: /最佳相机|相机|拍照|自拍/i,
  ar: /أفضل كاميرا|كاميرا|تصوير|سيلفي/i,
  id: /kamera terbaik|kamera|fotografi|selfie/i,
};

export function getStoredSearchLanguage(): SearchLanguageCode {
  if (typeof window === "undefined") return "auto";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && SEARCH_LANGUAGES.some((l) => l.code === raw)) {
      return raw as SearchLanguageCode;
    }
  } catch {
    /* ignore */
  }
  return "auto";
}

export function setStoredSearchLanguage(code: SearchLanguageCode): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, code);
    window.dispatchEvent(new CustomEvent("search-language-change", { detail: code }));
  } catch {
    /* ignore */
  }
}

export function detectBrowserSearchLanguage(): ResolvedSearchLanguage {
  if (typeof navigator === "undefined") return "en";
  const lang = (navigator.language || "en").toLowerCase();
  if (lang.startsWith("hi")) return "hi";
  if (lang.startsWith("es")) return "es";
  if (lang.startsWith("fr")) return "fr";
  if (lang.startsWith("de")) return "de";
  if (lang.startsWith("pt")) return "pt";
  if (lang.startsWith("ja")) return "ja";
  if (lang.startsWith("ko")) return "ko";
  if (lang.startsWith("zh")) return "zh";
  if (lang.startsWith("ar")) return "ar";
  if (lang.startsWith("id")) return "id";
  return "en";
}

export function resolveSearchLanguage(
  code: SearchLanguageCode = getStoredSearchLanguage(),
): ResolvedSearchLanguage {
  if (code === "auto") return detectBrowserSearchLanguage();
  return code;
}

export function speechTagForLanguage(code: SearchLanguageCode): string {
  if (code === "auto") {
    if (typeof navigator === "undefined") return "en-US";
    const browser = navigator.language;
    if (browser) return browser;
    return speechTagForLanguage(detectBrowserSearchLanguage());
  }
  return SEARCH_LANGUAGES.find((l) => l.code === code)?.speechTag ?? "en-US";
}

export function stopwordsForLanguage(
  code: SearchLanguageCode = getStoredSearchLanguage(),
): Set<string> {
  const resolved = resolveSearchLanguage(code);
  return new Set(STOPWORDS_BY_LANG[resolved] ?? EN_STOPWORDS);
}

export function priceUnderPattern(
  code: SearchLanguageCode = getStoredSearchLanguage(),
): RegExp {
  const resolved = resolveSearchLanguage(code);
  return PRICE_UNDER_PATTERNS[resolved];
}

export function comparePattern(
  code: SearchLanguageCode = getStoredSearchLanguage(),
): RegExp {
  const resolved = resolveSearchLanguage(code);
  return COMPARE_PATTERNS[resolved];
}

export function voicePrefixPattern(
  code: SearchLanguageCode = getStoredSearchLanguage(),
): RegExp {
  const resolved = resolveSearchLanguage(code);
  return VOICE_PREFIX_PATTERNS[resolved];
}

export function gamingPattern(
  code: SearchLanguageCode = getStoredSearchLanguage(),
): RegExp {
  const resolved = resolveSearchLanguage(code);
  return GAMING_PATTERNS[resolved];
}

export function cameraPattern(
  code: SearchLanguageCode = getStoredSearchLanguage(),
): RegExp {
  const resolved = resolveSearchLanguage(code);
  return CAMERA_PATTERNS[resolved];
}

export function languageLabel(code: SearchLanguageCode): string {
  const entry = SEARCH_LANGUAGES.find((l) => l.code === code);
  if (!entry) return "English";
  if (code === "auto") {
    const detected = detectBrowserSearchLanguage();
    const detectedEntry = SEARCH_LANGUAGES.find((l) => l.code === detected);
    return `Auto (${detectedEntry?.nativeLabel ?? "English"})`;
  }
  return entry.nativeLabel;
}

/** BCP-47 / Google Translate language code for API calls. */
export function googleTranslateCode(
  code: SearchLanguageCode = getStoredSearchLanguage(),
): string {
  if (code === "auto") {
    return googleTranslateCode(detectBrowserSearchLanguage());
  }
  return code;
}

export function shouldTranslateVoiceTranscript(
  text: string,
  lang: SearchLanguageCode = getStoredSearchLanguage(),
): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  const resolved = resolveSearchLanguage(lang);
  if (resolved !== "en") return true;
  return /[^\x00-\x7F]/.test(trimmed);
}
