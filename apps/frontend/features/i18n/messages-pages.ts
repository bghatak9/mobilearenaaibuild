import type { ResolvedSiteLanguage } from "./languages";

/** Extra page chrome keys (home spotlight, compare, finder, contact, common). */
export type PageMessageKey =
  | "home.noFeatured"
  | "home.showLess"
  | "home.communityStream"
  | "home.communityStreamSubtitle"
  | "home.launchTimeline"
  | "home.launchTimelineSubtitle"
  | "home.reviewsPolls"
  | "home.spotlightSearched"
  | "home.spotlightReviews"
  | "home.spotlightLoved"
  | "home.spotlightRated"
  | "home.spotlightUpcoming"
  | "home.spotlightTrending"
  | "home.spotlightFeatured"
  | "home.matchScore"
  | "home.explore"
  | "home.contactEyebrow"
  | "home.contactTitle"
  | "home.contactBody"
  | "home.openContactForm"
  | "common.home"
  | "common.clear"
  | "common.reset"
  | "common.loading"
  | "compare.title"
  | "compare.subtitle"
  | "compare.hubBody"
  | "compare.currentSelection"
  | "compare.compareNow"
  | "compare.clear"
  | "compare.addMore"
  | "compare.labsTitle"
  | "compare.trendingTitle"
  | "compare.searchPlaceholder"
  | "compare.barNeedOne"
  | "finder.title"
  | "finder.filters.title"
  | "finder.filterTitle"
  | "finder.matchCount"
  | "finder.empty"
  | "finder.emptyHint"
  | "finder.resetAll"
  | "finder.moreTools"
  | "finder.tapFilters"
  | "finder.showCount"
  | "contact.eyebrow"
  | "contact.title"
  | "contact.name"
  | "contact.email"
  | "contact.subject"
  | "contact.message"
  | "contact.namePlaceholder"
  | "contact.subjectPlaceholder"
  | "contact.messagePlaceholder"
  | "contact.send"
  | "contact.fullPage"
  | "home.newsletterEyebrow"
  | "home.newsletterTitle"
  | "home.newsletterBody"
  | "home.subscribe"
  | "home.communityPoll"
  | "home.pollEmpty"
  | "home.pollVotes"
  | "home.signInToVote"
  | "home.readLatestReviews"
  | "home.featuredStories"
  | "home.latestStories"
  | "home.moreNews"
  | "home.arenaDesk";

export const EN_PAGE_MESSAGES: Record<PageMessageKey, string> = {
  "home.noFeatured": "No featured devices yet.",
  "home.showLess": "Show less",
  "home.communityStream": "Community Activity Stream",
  "home.communityStreamSubtitle": "Live participation across the Arena",
  "home.launchTimeline": "Upcoming Launch Timeline",
  "home.launchTimelineSubtitle": "The release calendar",
  "home.reviewsPolls": "User Reviews & Polls",
  "home.spotlightSearched": "Most Searched Device",
  "home.spotlightReviews": "Best Reviews Device",
  "home.spotlightLoved": "Most Loved Device",
  "home.spotlightRated": "Best Rated Device",
  "home.spotlightUpcoming": "Upcoming Device",
  "home.spotlightTrending": "Trending Device",
  "home.spotlightFeatured": "Featured Device",
  "home.matchScore": "Match score",
  "home.explore": "Explore",
  "home.contactEyebrow": "Contact Us",
  "home.contactTitle": "Get in touch",
  "home.contactBody":
    "Questions about devices, partnerships, or your account? Send us a message and the MobileArena team will respond within 1–2 business days.",
  "home.openContactForm": "Open contact form",
  "home.newsletterEyebrow": "Arena Newsletter",
  "home.newsletterTitle": "Stay ahead of every launch",
  "home.newsletterBody":
    "Weekly picks, deal alerts, and community highlights — no spam, unsubscribe anytime.",
  "home.subscribe": "Subscribe",
  "home.communityPoll": "Community poll",
  "home.pollEmpty": "Community polls appear here soon.",
  "home.pollVotes": "{count} votes",
  "home.signInToVote": "Sign in to vote on community polls.",
  "home.readLatestReviews": "Read latest reviews",
  "home.featuredStories": "Featured Stories",
  "home.latestStories": "Latest Stories",
  "home.moreNews": "More news",
  "home.arenaDesk": "Arena Desk",
  "common.home": "Home",
  "common.clear": "Clear",
  "common.reset": "Reset",
  "common.loading": "Loading…",
  "compare.title": "Comparison Tools",
  "compare.subtitle": "Smart Side-by-Side Comparison",
  "compare.hubBody":
    "Compare 2–{max} devices with difference highlighting, AI analysis, weighted scoring, camera & performance labs, and export tools.",
  "compare.currentSelection": "Current selection",
  "compare.compareNow": "Compare now",
  "compare.clear": "Clear",
  "compare.addMore": "Add {count} more device(s)",
  "compare.labsTitle": "Premium comparison labs",
  "compare.trendingTitle": "Trending comparisons",
  "compare.searchPlaceholder": "Search phones to compare…",
  "compare.barNeedOne": "+1",
  "finder.title": "Phone Finder",
  "finder.filters.title": "Filters",
  "finder.filterTitle": "Phone Finder filters",
  "finder.matchCount": "{filtered} of {total} phones match your filters",
  "finder.empty": "No phones match these filters",
  "finder.emptyHint": "Adjust filters in the sidebar or reset to start over.",
  "finder.resetAll": "Reset all filters",
  "finder.moreTools": "More discovery tools",
  "finder.tapFilters": "Tap Filters above to refine results.",
  "finder.showCount": "Show {count} phones",
  "contact.eyebrow": "Contact Us",
  "contact.title": "Contact MobileArena",
  "contact.name": "Name",
  "contact.email": "Email",
  "contact.subject": "Subject",
  "contact.message": "Message",
  "contact.namePlaceholder": "Your name",
  "contact.subjectPlaceholder": "How can we help?",
  "contact.messagePlaceholder": "Tell us what's on your mind…",
  "contact.send": "Send message",
  "contact.fullPage": "Full contact page",
};

const HI: Partial<Record<PageMessageKey, string>> = {
  "home.noFeatured": "अभी कोई विशेष उपकरण नहीं।",
  "home.showLess": "कम दिखाएँ",
  "home.communityStream": "समुदाय गतिविधि स्ट्रीम",
  "home.communityStreamSubtitle": "एरीना में लाइव भागीदारी",
  "home.launchTimeline": "आगामी लॉन्च टाइमलाइन",
  "home.launchTimelineSubtitle": "रिलीज़ कैलेंडर",
  "home.reviewsPolls": "उपयोगकर्ता समीक्षाएँ और पोल",
  "home.spotlightSearched": "सबसे अधिक खोजा गया",
  "home.spotlightReviews": "सर्वोत्तम समीक्षा वाला",
  "home.spotlightLoved": "सबसे पसंदीदा",
  "home.spotlightRated": "सर्वोत्तम रेटेड",
  "home.spotlightUpcoming": "आगामी डिवाइस",
  "home.spotlightTrending": "ट्रेंडिंग डिवाइस",
  "home.spotlightFeatured": "विशेष डिवाइस",
  "home.matchScore": "मैच स्कोर",
  "home.explore": "एक्सप्लोर",
  "home.contactEyebrow": "संपर्क करें",
  "home.contactTitle": "हमसे जुड़ें",
  "home.contactBody":
    "डिवाइस, साझेदारी या खाते के बारे में प्रश्न? हमें संदेश भेजें — टीम 1–2 कार्य दिवसों में जवाब देगी।",
  "home.openContactForm": "संपर्क फ़ॉर्म खोलें",
  "common.home": "होम",
  "common.clear": "साफ़ करें",
  "common.reset": "रीसेट",
  "common.loading": "लोड हो रहा है…",
  "compare.title": "तुलना उपकरण",
  "compare.subtitle": "स्मार्ट साइड-बाय-साइड तुलना",
  "compare.hubBody":
    "2–{max} डिवाइस की तुलना करें — अंतर हाइलाइट, एआई विश्लेषण, स्कोरिंग, कैमरा और परफ़ॉर्मेंस लैब, और एक्सपोर्ट।",
  "compare.currentSelection": "वर्तमान चयन",
  "compare.compareNow": "अभी तुलना करें",
  "compare.clear": "साफ़ करें",
  "compare.addMore": "और {count} डिवाइस जोड़ें",
  "compare.labsTitle": "प्रीमियम तुलना लैब्स",
  "compare.trendingTitle": "ट्रेंडिंग तुलनाएँ",
  "compare.searchPlaceholder": "तुलना के लिए फ़ोन खोजें…",
  "compare.barNeedOne": "+1",
  "finder.title": "फ़ोन खोजें",
  "finder.filters.title": "फ़िल्टर",
  "finder.filterTitle": "फ़ोन खोज फ़िल्टर",
  "finder.matchCount": "{filtered} में से {total} फ़ोन आपके फ़िल्टर से मेल खाते हैं",
  "finder.empty": "इन फ़िल्टर से कोई फ़ोन मेल नहीं खाता",
  "finder.emptyHint": "साइडबार में फ़िल्टर बदलें या रीसेट करें।",
  "finder.resetAll": "सभी फ़िल्टर रीसेट करें",
  "finder.moreTools": "और खोज उपकरण",
  "finder.tapFilters": "परिणाम सुधारने के लिए ऊपर फ़िल्टर टैप करें।",
  "finder.showCount": "{count} फ़ोन दिखाएँ",
  "contact.eyebrow": "संपर्क करें",
  "contact.title": "MobileArena से संपर्क करें",
  "contact.name": "नाम",
  "contact.email": "ईमेल",
  "contact.subject": "विषय",
  "contact.message": "संदेश",
  "contact.namePlaceholder": "आपका नाम",
  "contact.subjectPlaceholder": "हम कैसे मदद कर सकते हैं?",
  "contact.messagePlaceholder": "अपना संदेश लिखें…",
  "contact.send": "संदेश भेजें",
  "contact.fullPage": "पूरा संपर्क पृष्ठ",
  "home.newsletterEyebrow": "एरीना न्यूज़लेटर",
  "home.newsletterTitle": "हर लॉन्च से आगे रहें",
  "home.newsletterBody":
    "साप्ताहिक पicks, डील अलर्ट और समुदाय हाइलाइट्स — कोई स्पैम नहीं, कभी भी अनसब्सक्राइब करें।",
  "home.subscribe": "सब्सक्राइब",
  "home.communityPoll": "समुदाय पोल",
  "home.pollEmpty": "समुदाय पोल जल्द यहाँ दिखेंगे।",
  "home.pollVotes": "{count} वोट",
  "home.signInToVote": "समुदाय पोल पर वोट करने के लिए साइन इन करें।",
  "home.readLatestReviews": "नवीनतम समीक्षाएँ पढ़ें",
  "home.featuredStories": "विशेष कहानियाँ",
  "home.latestStories": "नवीनतम कहानियाँ",
  "home.moreNews": "और समाचार",
  "home.arenaDesk": "एरीना डेस्क",
};

const ZH: Partial<Record<PageMessageKey, string>> = {
  "home.noFeatured": "暂无精选设备。",
  "home.showLess": "收起",
  "home.communityStream": "社区动态",
  "home.communityStreamSubtitle": "Arena 实时互动",
  "home.launchTimeline": "即将发布时间线",
  "home.launchTimelineSubtitle": "发布日历",
  "home.reviewsPolls": "用户评测与投票",
  "home.spotlightSearched": "搜索最多",
  "home.spotlightReviews": "评测最佳",
  "home.spotlightLoved": "最受喜爱",
  "home.spotlightRated": "评分最高",
  "home.spotlightUpcoming": "即将上市",
  "home.spotlightTrending": "热门设备",
  "home.spotlightFeatured": "精选设备",
  "home.matchScore": "匹配分数",
  "home.explore": "探索",
  "home.contactEyebrow": "联系我们",
  "home.contactTitle": "取得联系",
  "home.contactBody": "关于设备、合作或账户的问题？留言后团队将在 1–2 个工作日内回复。",
  "home.openContactForm": "打开联系表单",
  "common.home": "首页",
  "common.clear": "清除",
  "common.reset": "重置",
  "common.loading": "加载中…",
  "compare.title": "对比工具",
  "compare.subtitle": "智能并排对比",
  "compare.hubBody":
    "对比 2–{max} 款设备：差异高亮、AI 分析、加权评分、影像与性能实验室，以及导出工具。",
  "compare.currentSelection": "当前选择",
  "compare.compareNow": "立即对比",
  "compare.clear": "清除",
  "compare.addMore": "再添加 {count} 款设备",
  "compare.labsTitle": "高级对比实验室",
  "compare.trendingTitle": "热门对比",
  "compare.searchPlaceholder": "搜索要对比的手机…",
  "finder.title": "手机查找",
  "finder.filters.title": "筛选",
  "finder.filterTitle": "手机查找筛选",
  "finder.matchCount": "{filtered} / {total} 款手机符合筛选",
  "finder.empty": "没有符合筛选的手机",
  "finder.emptyHint": "调整侧边栏筛选或重置后重试。",
  "finder.resetAll": "重置全部筛选",
  "finder.moreTools": "更多发现工具",
  "finder.tapFilters": "点按上方筛选以优化结果。",
  "finder.showCount": "显示 {count} 款手机",
  "contact.eyebrow": "联系我们",
  "contact.title": "联系 MobileArena",
  "contact.name": "姓名",
  "contact.email": "邮箱",
  "contact.subject": "主题",
  "contact.message": "留言",
  "contact.namePlaceholder": "您的姓名",
  "contact.subjectPlaceholder": "我们能帮您什么？",
  "contact.messagePlaceholder": "告诉我们您的想法…",
  "contact.send": "发送留言",
  "contact.fullPage": "完整联系页",
  "home.newsletterEyebrow": "Arena 通讯",
  "home.newsletterTitle": "不错过每一次发布",
  "home.newsletterBody": "每周精选、优惠提醒与社区亮点 — 无垃圾邮件，随时退订。",
  "home.subscribe": "订阅",
  "home.communityPoll": "社区投票",
  "home.pollEmpty": "社区投票即将上线。",
  "home.pollVotes": "{count} 票",
  "home.signInToVote": "登录后即可参与社区投票。",
  "home.readLatestReviews": "阅读最新评测",
  "home.featuredStories": "精选报道",
  "home.latestStories": "最新报道",
  "home.moreNews": "更多新闻",
  "home.arenaDesk": "Arena 编辑部",
};

const ES: Partial<Record<PageMessageKey, string>> = {
  "home.noFeatured": "Aún no hay dispositivos destacados.",
  "home.showLess": "Ver menos",
  "home.spotlightSearched": "Más buscado",
  "home.spotlightFeatured": "Dispositivo destacado",
  "home.contactTitle": "Contáctanos",
  "home.openContactForm": "Abrir formulario",
  "common.home": "Inicio",
  "common.clear": "Borrar",
  "compare.title": "Herramientas de comparación",
  "compare.subtitle": "Comparación inteligente",
  "compare.compareNow": "Comparar ahora",
  "compare.clear": "Borrar",
  "finder.title": "Buscador",
  "finder.filters.title": "Filtros",
  "finder.empty": "Ningún teléfono coincide",
  "finder.resetAll": "Restablecer filtros",
  "contact.send": "Enviar mensaje",
  "contact.name": "Nombre",
  "contact.email": "Correo",
  "contact.message": "Mensaje",
};

export const PAGE_PARTIALS: Partial<
  Record<ResolvedSiteLanguage, Partial<Record<PageMessageKey, string>>>
> = {
  hi: HI,
  zh: ZH,
  es: ES,
};

export function getPageExtra(
  lang: ResolvedSiteLanguage,
): Partial<Record<PageMessageKey, string>> {
  if (lang === "en") return EN_PAGE_MESSAGES;
  return { ...EN_PAGE_MESSAGES, ...(PAGE_PARTIALS[lang] ?? {}) };
}
