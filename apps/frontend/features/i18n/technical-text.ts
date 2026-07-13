import type { ResolvedSiteLanguage } from "./languages";
import { localizeFieldLabel } from "./field-labels";

const ZH_DIGITS = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"] as const;

/** Convert a non-negative integer (0–999999) to Chinese numerals. */
export function numberToChinese(value: number): string {
  if (!Number.isFinite(value) || value < 0) return String(value);
  if (value < 10) return ZH_DIGITS[value]!;
  if (value < 20) return value === 10 ? "十" : `十${ZH_DIGITS[value % 10]}`;
  if (value < 100) {
    const tens = Math.floor(value / 10);
    const ones = value % 10;
    return `${ZH_DIGITS[tens]}十${ones ? ZH_DIGITS[ones] : ""}`;
  }
  if (value < 1000) {
    const hundreds = Math.floor(value / 100);
    const rest = value % 100;
    if (rest === 0) return `${ZH_DIGITS[hundreds]}百`;
    if (rest < 10) return `${ZH_DIGITS[hundreds]}百零${ZH_DIGITS[rest]}`;
    return `${ZH_DIGITS[hundreds]}百${numberToChinese(rest)}`;
  }
  if (value < 10000) {
    const thousands = Math.floor(value / 1000);
    const rest = value % 1000;
    if (rest === 0) return `${ZH_DIGITS[thousands]}千`;
    if (rest < 100) return `${ZH_DIGITS[thousands]}千零${numberToChinese(rest)}`;
    return `${ZH_DIGITS[thousands]}千${numberToChinese(rest)}`;
  }
  if (value < 100000) {
    const wan = Math.floor(value / 10000);
    const rest = value % 10000;
    if (rest === 0) return `${numberToChinese(wan)}万`;
    if (rest < 1000) return `${numberToChinese(wan)}万零${numberToChinese(rest)}`;
    return `${numberToChinese(wan)}万${numberToChinese(rest)}`;
  }
  return String(value);
}

function decimalToChinese(raw: string): string {
  const [whole, frac] = raw.split(".");
  const head = numberToChinese(Number(whole));
  if (!frac) return head;
  return `${head}点${[...frac].map((d) => ZH_DIGITS[Number(d)] ?? d).join("")}`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type Pair = [string, string];

const OS_TOKENS: Partial<Record<ResolvedSiteLanguage, Pair[]>> = {
  zh: [
    ["HarmonyOS", "鸿蒙系统"],
    ["Android", "安卓"],
    ["iPadOS", "平板系统"],
    ["iOS", "苹果系统"],
    ["Windows", "视窗"],
    ["macOS", "苹果电脑系统"],
  ],
  hi: [
    ["Android", "एंड्रॉइड"],
    ["iOS", "आईओएस"],
    ["HarmonyOS", "हार्मनीओएस"],
  ],
  ar: [
    ["Android", "أندرويد"],
    ["iOS", "آي أو إس"],
  ],
  ja: [
    ["Android", "アンドロイド"],
    ["iOS", "アイオーエス"],
    ["HarmonyOS", "ハーモニーオーエス"],
  ],
  ko: [
    ["Android", "안드로이드"],
    ["iOS", "아이오에스"],
  ],
};

const UNIT_TOKENS: Partial<Record<ResolvedSiteLanguage, Pair[]>> = {
  zh: [
    ["mAh", "毫安时"],
    ["Mah", "毫安时"],
    ["kHz", "千赫兹"],
    ["Hz", "赫兹"],
    ["MP", "兆像素"],
    ["Mp", "兆像素"],
    ["TB", "太字节"],
    ["GB", "吉字节"],
    ["MB", "兆字节"],
    ["Wh", "瓦时"],
    ["mm", "毫米"],
    ["cm", "厘米"],
    ["W", "瓦"],
  ],
  hi: [
    ["mAh", "एमएएच"],
    ["Hz", "हर्ट्ज़"],
    ["MP", "एमपी"],
    ["GB", "जीबी"],
    ["MB", "एमबी"],
    ["W", "वाट"],
    ["mm", "मिमी"],
  ],
};

const PHRASE_TOKENS: Partial<Record<ResolvedSiteLanguage, Pair[]>> = {
  zh: [
    ["Sensors & Intelligence", "传感器与智能"],
    ["Device Intelligence", "设备情报"],
    ["Specification laboratory", "规格实验室"],
    ["Battery & Power Systems", "电池与电源"],
    ["Performance Architecture", "性能架构"],
    ["Display Engineering", "显示工程"],
    ["Camera Laboratory", "影像实验室"],
    ["Cellular Technology", "蜂窝技术"],
    ["Connectivity Matrix", "连接矩阵"],
    ["Audio Engineering", "音频工程"],
    ["Software Experience", "软件体验"],
    ["Rear Camera System", "后置影像系统"],
    ["Design & Build", "设计与机身"],
    ["Network Support", "网络支持"],
    ["Smartphone", "智能手机"],
    ["Owner satisfaction", "用户满意度"],
    ["Would buy again", "愿意再次购买"],
    ["Buy from partners", "合作伙伴购买"],
    ["Market price TBA", "市场价格待定"],
    ["Display data pending", "显示数据待更新"],
    ["Power data pending", "电源数据待更新"],
    ["Market price", "市场价格"],
    ["Chipset TBA", "芯片待定"],
    ["In compare", "已加入对比"],
    ["price TBA", "价格待定"],
    ["4K ready", "支持四开录像"],
    ["Multi-lens", "多镜头"],
    ["Octa-core", "八核"],
    ["Hexa-core", "六核"],
    ["Quad-core", "四核"],
    ["Dual-core", "双核"],
    ["Elite tier", "顶尖级别"],
    ["Flagship tier", "旗舰级别"],
    ["Strong tier", "强劲级别"],
    ["Balanced tier", "均衡级别"],
    ["Entry tier", "入门级别"],
    ["Share device", "分享设备"],
    ["Close", "关闭"],
    ["Voice search", "语音搜索"],
    ["Intelligence", "设备情报"],
    ["Discussions", "讨论"],
    ["Compare", "对比"],
    ["January", "一月"],
    ["February", "二月"],
    ["March", "三月"],
    ["April", "四月"],
    ["May", "五月"],
    ["June", "六月"],
    ["July", "七月"],
    ["August", "八月"],
    ["September", "九月"],
    ["October", "十月"],
    ["November", "十一月"],
    ["December", "十二月"],
    ["onboard", "机身存储"],
    ["wireless", "无线"],
    ["wired", "有线"],
    ["Launched", "发布于"],
    ["Announced ", "公布于 "],
    ["Market", "市场"],
    ["depth", "厚度"],
    ["tele", "长焦"],
    ["RAM", "内存"],
    ["Vision", "显示"],
    ["Optics", "影像"],
    ["Compute", "性能"],
    ["Endurance", "续航"],
    ["Standard", "标准"],
    ["Detailed", "详细"],
    ["Engineering", "工程"],
    ["General", "常规"],
    ["Community Intelligence", "社区情报"],
    ["Owner insights", "机主洞察"],
    ["Satisfaction", "满意度"],
    ["Would buy again", "愿意再次购买"],
    ["Buy again", "愿意再买"],
    ["Recommend", "推荐"],
    ["Most praised", "最受好评"],
    ["Room to improve", "有待提升"],
    ["Discussion topics", "讨论话题"],
    ["Community comments", "社区评论"],
    ["Share your take on", "分享你对"],
    ["Join the", "参与"],
    ["discussion about", "讨论 ·"],
    ["Topic:", "话题："],
    ["Loading comments…", "正在加载评论…"],
    ["No comments yet — be the first.", "暂无评论——来做第一个吧。"],
    ["Write a comment…", "写一条评论…"],
    ["Sign in to comment", "登录后评论"],
    ["Post comment", "发表评论"],
    ["Posting…", "发布中…"],
    ["Sign in", "登录"],
    ["Arena member", "社区成员"],
    ["Edit", "编辑"],
    ["Delete", "删除"],
    ["Deleting…", "删除中…"],
    ["Report", "举报"],
    ["Save", "保存"],
    ["Saving…", "保存中…"],
    ["Cancel", "取消"],
    ["(you)", "（我）"],
    ["Reviews", "评测"],
    ["rating", "条评分"],
    ["ratings", "条评分"],
    ["Battery life", "续航表现"],
    ["Charging speed", "充电速度"],
    ["Display quality", "屏幕素质"],
    ["Build quality", "做工质感"],
    ["Value proposition", "性价比"],
    ["Weight reduction", "机身减重"],
    ["Camera software", "影像算法"],
    ["More owner reviews", "更多机主评价"],
    ["Accessory availability", "配件供应"],
    ["Tips & Tricks", "技巧与窍门"],
    ["Performance", "性能"],
    ["Battery", "电池"],
    ["Camera", "相机"],
    ["Software", "软件"],
    ["Accessories", "配件"],
    ["Brand", "品牌"],
    ["Series", "系列"],
    ["Model Number", "型号"],
    ["Device Category", "设备类别"],
    ["Codename", "开发代号"],
    ["Launch Date", "发布日期"],
    ["Release Status", "发布状态"],
    ["Market Availability", "上市情况"],
    ["Operating System", "操作系统"],
    ["UI Version", "系统界面版本"],
    ["Guaranteed Updates", "系统更新承诺"],
    ["Security Support Period", "安全支持周期"],
    ["Price at Launch", "首发价格"],
    ["Current Market Price", "当前市价"],
    ["Country Variants", "地区版本"],
    ["Dimensions", "尺寸"],
    ["Weight", "重量"],
    ["Thickness", "厚度"],
    ["Frame Material", "中框材质"],
    ["Back Material", "后盖材质"],
    ["Front Protection", "屏幕保护"],
    ["Color Variants", "配色"],
    ["IP Rating", "防护等级"],
    ["Panel Technology", "屏幕技术"],
    ["Size", "尺寸"],
    ["Resolution", "分辨率"],
    ["Pixel Density", "像素密度"],
    ["Aspect Ratio", "屏幕比例"],
    ["Refresh Rate", "刷新率"],
    ["Peak Brightness", "峰值亮度"],
    ["Protection Glass", "保护玻璃"],
    ["Chipset", "芯片平台"],
    ["Foundry Process", "制程工艺"],
    ["CPU Architecture", "CPU架构"],
    ["RAM Capacity", "内存容量"],
    ["Storage Capacity", "存储容量"],
    ["Wired Charging", "有线充电"],
    ["Wireless Charging", "无线充电"],
    ["Capacity", "容量"],
    ["Released", "已发布"],
    ["Announced", "已公布"],
    ["verified data points across", "项已验证数据 · 覆盖"],
    ["unspecified fields hidden", "未填写字段已隐藏"],
    ["labs", "个实验室"],
  ],
  hi: [
    ["Sensors & Intelligence", "सेंसर और इंटेलिजेंस"],
    ["Device Intelligence", "डिवाइस इंटेलिजेंस"],
    ["Specification laboratory", "स्पेसिफिकेशन लैब"],
    ["Battery & Power Systems", "बैटरी और पावर"],
    ["Performance Architecture", "परफॉर्मेंस आर्किटेक्चर"],
    ["Display Engineering", "डिस्प्ले इंजीनियरिंग"],
    ["Camera Laboratory", "कैमरा लैब"],
    ["Cellular Technology", "सेलुलर टेक्नोलॉजी"],
    ["Connectivity Matrix", "कनेक्टिविटी मैट्रिक्स"],
    ["Audio Engineering", "ऑडियो इंजीनियरिंग"],
    ["Software Experience", "सॉफ़्टवेयर अनुभव"],
    ["Rear Camera System", "रियर कैमरा सिस्टम"],
    ["Design & Build", "डिज़ाइन और बिल्ड"],
    ["Network Support", "नेटवर्क सपोर्ट"],
    ["Benchmark Laboratory", "बेंचमार्क लैब"],
    ["Front Camera Studio", "फ्रंट कैमरा स्टूडियो"],
    ["AI Intelligence", "एआई इंटेलिजेंस"],
    ["Gaming Center", "गेमिंग सेंटर"],
    ["Repair & Sustainability", "रिपेयर और स्थिरता"],
    ["Ecosystem Integration", "इकोसिस्टम इंटीग्रेशन"],
    ["Owner satisfaction", "मालिक संतुष्टि"],
    ["Community Intelligence", "कम्युनिटी इंटेलिजेंस"],
    ["Owner insights", "मालिक इनसाइट्स"],
    ["Would buy again", "फिर खरीदेंगे"],
    ["Buy again", "फिर खरीदें"],
    ["Buy from partners", "पार्टनर से खरीदें"],
    ["Most praised", "सबसे सराहा गया"],
    ["Room to improve", "सुधार की गुंजाइश"],
    ["Discussion topics", "चर्चा विषय"],
    ["Community comments", "कम्युनिटी कमेंट्स"],
    ["Share your take on", "अपनी राय लिखें"],
    ["No comments yet — be the first.", "अभी कोई कमेंट नहीं — पहले लिखें।"],
    ["Write a comment…", "कमेंट लिखें…"],
    ["Sign in to comment", "कमेंट के लिए साइन इन करें"],
    ["Post comment", "कमेंट पोस्ट करें"],
    ["Posting…", "पोस्ट हो रहा है…"],
    ["Sign in", "साइन इन"],
    ["Loading comments…", "कमेंट लोड हो रहे हैं…"],
    ["Arena member", "एरीना सदस्य"],
    ["Edit", "संपादित करें"],
    ["Delete", "हटाएँ"],
    ["Deleting…", "हटाया जा रहा है…"],
    ["Report", "रिपोर्ट"],
    ["Save", "सेव"],
    ["Saving…", "सेव हो रहा है…"],
    ["Cancel", "रद्द"],
    ["(you)", "(आप)"],
    ["Battery life", "बैटरी लाइफ"],
    ["Charging speed", "चार्जिंग स्पीड"],
    ["Display quality", "डिस्प्ले क्वालिटी"],
    ["More owner reviews", "और मालिक रिव्यू"],
    ["Build quality", "बिल्ड क्वालिटी"],
    ["Value proposition", "वैल्यू"],
    ["Weight reduction", "वज़न कम करना"],
    ["Camera software", "कैमरा सॉफ़्टवेयर"],
    ["Accessory availability", "एक्सेसरी उपलब्धता"],
    ["Tips & Tricks", "टिप्स और ट्रिक्स"],
    ["Performance", "परफॉर्मेंस"],
    ["Battery", "बैटरी"],
    ["Camera", "कैमरा"],
    ["Software", "सॉफ़्टवेयर"],
    ["Accessories", "एक्सेसरीज़"],
    ["Share device", "डिवाइस शेयर करें"],
    ["Close", "बंद करें"],
    ["Voice search", "वॉइस सर्च"],
    ["Intelligence", "इंटेलिजेंस"],
    ["Discussions", "चर्चाएँ"],
    ["Compare", "तुलना"],
    ["In compare", "तुलना में"],
    ["Market price", "बाज़ार कीमत"],
    ["Market price TBA", "बाज़ार कीमत शीघ्र"],
    ["price TBA", "कीमत शीघ्र"],
    ["Market", "बाज़ार"],
    ["Launched", "लॉन्च"],
    ["Announced ", "घोषणा "],
    ["January", "जनवरी"],
    ["February", "फ़रवरी"],
    ["March", "मार्च"],
    ["April", "अप्रैल"],
    ["May", "मई"],
    ["June", "जून"],
    ["July", "जुलाई"],
    ["August", "अगस्त"],
    ["September", "सितंबर"],
    ["October", "अक्टूबर"],
    ["November", "नवंबर"],
    ["December", "दिसंबर"],
    ["verified data points across", "सत्यापित डेटा पॉइंट ·"],
    ["unspecified fields hidden", "खाली फ़ील्ड छिपी"],
    ["labs", "लैब्स"],
    ["onboard", "स्टोरेज"],
    ["wireless", "वायरलेस"],
    ["wired", "वायर्ड"],
    ["depth", "मोटाई"],
    ["tele", "टेली"],
    ["Octa-core", "ऑक्टा-कोर"],
    ["Hexa-core", "हेक्सा-कोर"],
    ["Quad-core", "क्वाड-कोर"],
    ["Dual-core", "ड्यूल-कोर"],
    ["Elite tier", "एलीट टियर"],
    ["Flagship tier", "फ्लैगशिप टियर"],
    ["Strong tier", "मज़बूत टियर"],
    ["Balanced tier", "संतुलित टियर"],
    ["Entry tier", "एंट्री टियर"],
    ["Chipset TBA", "चिपसेट शीघ्र"],
    ["Display data pending", "डिस्प्ले डेटा लंबित"],
    ["Power data pending", "पावर डेटा लंबित"],
    ["Multi-lens", "मल्टी-लेंस"],
    ["4K ready", "4K रेडी"],
    ["Smartphone", "स्मार्टफ़ोन"],
    ["RAM", "रैम"],
    ["Vision", "डिस्प्ले"],
    ["Optics", "कैमरा"],
    ["Compute", "प्रोसेसर"],
    ["Endurance", "बैटरी"],
    ["Brand", "ब्रांड"],
    ["Model Number", "मॉडल नंबर"],
    ["Operating System", "ऑपरेटिंग सिस्टम"],
    ["Launch Date", "लॉन्च तिथि"],
    ["Release Status", "रिलीज़ स्थिति"],
    ["Device Category", "डिवाइस श्रेणी"],
    ["Dimensions", "आयाम"],
    ["Weight", "वज़न"],
    ["Front Protection", "फ्रंट सुरक्षा"],
    ["IP Rating", "आईपी रेटिंग"],
    ["Panel Technology", "पैनल तकनीक"],
    ["Size", "साइज़"],
    ["Resolution", "रिज़ॉल्यूशन"],
    ["Refresh Rate", "रिफ़्रेश रेट"],
    ["Peak Brightness", "पीक ब्राइटनेस"],
    ["Protection Glass", "प्रोटेक्शन ग्लास"],
    ["Chipset", "चिपसेट"],
    ["Foundry Process", "प्रोसेस"],
    ["RAM Capacity", "रैम क्षमता"],
    ["Storage Capacity", "स्टोरेज क्षमता"],
    ["Capacity", "क्षमता"],
    ["Wired Charging", "वायर्ड चार्जिंग"],
    ["Wireless Charging", "वायरलेस चार्जिंग"],
    ["Released", "रिलीज़्ड"],
    ["Announced", "घोषित"],
    ["Satisfaction", "संतुष्टि"],
    ["Recommend", "सुझाव"],
    ["Standard", "मानक"],
    ["Detailed", "विस्तृत"],
    ["Engineering", "इंजीनियरिंग"],
    ["General", "सामान्य"],
    ["Reviews", "समीक्षाएँ"],
  ],
  es: [
    ["Sensors & Intelligence", "Sensores e inteligencia"],
    ["Device Intelligence", "Inteligencia del dispositivo"],
    ["Specification laboratory", "Laboratorio de especificaciones"],
    ["Battery & Power Systems", "Batería y energía"],
    ["Performance Architecture", "Arquitectura de rendimiento"],
    ["Display Engineering", "Ingeniería de pantalla"],
    ["Camera Laboratory", "Laboratorio de cámara"],
    ["Cellular Technology", "Tecnología celular"],
    ["Connectivity Matrix", "Matriz de conectividad"],
    ["Audio Engineering", "Ingeniería de audio"],
    ["Software Experience", "Experiencia de software"],
    ["Rear Camera System", "Sistema de cámara trasera"],
    ["Design & Build", "Diseño y construcción"],
    ["Network Support", "Soporte de red"],
    ["Owner satisfaction", "Satisfacción del dueño"],
    ["Community Intelligence", "Inteligencia de la comunidad"],
    ["Owner insights", "Opiniones de dueños"],
    ["Would buy again", "Lo compraría de nuevo"],
    ["Most praised", "Más elogiado"],
    ["Room to improve", "Por mejorar"],
    ["Discussion topics", "Temas de discusión"],
    ["Community comments", "Comentarios de la comunidad"],
    ["Share your take on", "Opina sobre"],
    ["Brand", "Marca"],
    ["Model Number", "Número de modelo"],
    ["Operating System", "Sistema operativo"],
    ["Launch Date", "Fecha de lanzamiento"],
    ["Release Status", "Estado de lanzamiento"],
    ["Dimensions", "Dimensiones"],
    ["Weight", "Peso"],
    ["Satisfaction", "Satisfacción"],
    ["Recommend", "Recomendar"],
    ["Standard", "Estándar"],
    ["Detailed", "Detallado"],
    ["Engineering", "Ingeniería"],
    ["General", "General"],
    ["Reviews", "Reseñas"],
  ],
  ar: [
    ["Sensors & Intelligence", "المستشعرات والذكاء"],
    ["Device Intelligence", "ذكاء الجهاز"],
    ["Specification laboratory", "مختبر المواصفات"],
    ["Battery & Power Systems", "البطارية والطاقة"],
    ["Performance Architecture", "بنية الأداء"],
    ["Display Engineering", "هندسة الشاشة"],
    ["Camera Laboratory", "مختبر الكاميرا"],
    ["Cellular Technology", "التقنية الخلوية"],
    ["Connectivity Matrix", "مصفوفة الاتصال"],
    ["Audio Engineering", "هندسة الصوت"],
    ["Software Experience", "تجربة البرمجيات"],
    ["Rear Camera System", "نظام الكاميرا الخلفية"],
    ["Design & Build", "التصميم والبناء"],
    ["Network Support", "دعم الشبكة"],
    ["Owner satisfaction", "رضا المالك"],
    ["Community Intelligence", "ذكاء المجتمع"],
    ["Owner insights", "آراء المالكين"],
    ["Would buy again", "سيشتري مرة أخرى"],
    ["Brand", "العلامة"],
    ["Model Number", "رقم الطراز"],
    ["Operating System", "نظام التشغيل"],
    ["Satisfaction", "الرضا"],
    ["Recommend", "يوصي"],
    ["Standard", "قياسي"],
    ["Detailed", "مفصّل"],
    ["Engineering", "هندسي"],
    ["General", "عام"],
    ["Reviews", "المراجعات"],
  ],
};

function applyPairs(text: string, pairs: Pair[] | undefined): string {
  if (!pairs?.length) return text;
  // Longer phrases first so "Community Intelligence" wins over "Intelligence".
  const sorted = [...pairs].sort((a, b) => b[0].length - a[0].length);
  let result = text;
  for (const [from, to] of sorted) {
    const useBoundary = from.length <= 2 || !/\s/.test(from);
    const pattern = useBoundary
      ? `(^|[^A-Za-z\\u00C0-\\u024F])${escapeRegExp(from)}(?=[^A-Za-z\\u00C0-\\u024F]|$)`
      : escapeRegExp(from);
    result = result.replace(new RegExp(pattern, "gi"), (match, lead?: string) =>
      useBoundary ? `${lead ?? ""}${to}` : to,
    );
  }
  return result;
}

/** Convert Arabic numerals (and decimals) in a string to Chinese numerals. */
export function localizeNumbersForZh(text: string): string {
  return text
    .replace(/\d+\.\d+/g, (n) => decimalToChinese(n))
    .replace(/\d+/g, (n) => numberToChinese(Number(n)));
}

/**
 * Localize technical device copy (OS, units, common phrases).
 * Keeps Arabic digits for readability (Android 16 → 安卓16, 6000mAh → 6000毫安时).
 * Full Chinese numerals for marketing titles live in localizeDeviceName.
 */
export function localizeTechnicalText(
  text: string,
  lang: ResolvedSiteLanguage,
): string {
  return resolveTechnicalText(text, lang).text;
}

export type TechnicalTextResolution = {
  text: string;
  /** True only when the string is fully curated — safe to lock from Google Translate. */
  curated: boolean;
};

/** Latin word leftovers mean a partial map — prefer English + GT over mixed output. */
function hasResidualLatinWords(text: string): boolean {
  return /[A-Za-z]{2,}/.test(text);
}

const LOCAL_SCRIPT_RE =
  /[\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0600-\u06FF\u0750-\u077F\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/;

/** English UI words that indicate a failed/partial label translation. */
const ENGLISH_UI_WORD_RE =
  /\b(?:Version|Cores?|System|Camera|Display|Battery|Support|Mode|Features?|Recording|Sensor|Resolution|Brightness|Frequency|Capacity|Technology|Laboratory|Engineering|Architecture|Availability|Configuration|Performance|Wireless|Charging|Protection|Material|Variants?|Status|Category|Number|Series|Brand|General|Standard|Detailed|Intelligence|Discussions|Compare|Market|price|TBA|Launched|Announced|depth|tele|onboard|wired|wireless)\b/i;

function hasUntranslatedEnglishUi(text: string): boolean {
  return ENGLISH_UI_WORD_RE.test(text);
}

/**
 * Resolve technical copy for the active language.
 * Exact field labels always curated; partial phrase hits fall back to English
 * so Google Translate can finish the string cleanly.
 */
export function resolveTechnicalText(
  text: string,
  lang: ResolvedSiteLanguage,
): TechnicalTextResolution {
  const raw = text.trim();
  if (!raw || lang === "en") return { text: raw, curated: lang === "en" };

  const exact = localizeFieldLabel(raw, lang);
  if (exact) return { text: exact, curated: true };

  let result = raw;
  result = applyPairs(result, OS_TOKENS[lang]);
  result = applyPairs(result, UNIT_TOKENS[lang]);
  result = applyPairs(result, PHRASE_TOKENS[lang]);

  if (lang === "zh") {
    result = result
      .replace(/(\d+(?:\.\d+)?)\s*"/g, "$1英寸")
      .replace(/(\d+(?:\.\d+)?)\s*''/g, "$1英寸")
      .replace(/(\d+(?:\.\d+)?)\s*g\b/gi, "$1克")
      .replace(/\s+/g, " ")
      .trim();
  }

  if (lang === "hi") {
    result = result
      .replace(/(\d+(?:\.\d+)?)\s*"/g, "$1 इंच")
      .replace(/(\d+(?:\.\d+)?)\s*g\b/gi, "$1 ग्राम")
      .replace(/\s+/g, " ")
      .trim();
  }

  if (result === raw) return { text: raw, curated: false };

  const hasLocalScript = LOCAL_SCRIPT_RE.test(result);

  // Pure Latin leftovers with no local script → leave for Google Translate.
  if (!hasLocalScript && hasResidualLatinWords(result)) {
    return { text: raw, curated: false };
  }

  // Local script mixed with untranslated English UI words (e.g. "安卓 Version")
  // → unlock whole English string for GT instead of locking a hybrid.
  if (hasLocalScript && hasUntranslatedEnglishUi(result)) {
    return { text: raw, curated: false };
  }

  return { text: result, curated: true };
}
