/**
 * Shared UI copy beyond nav — phones, cards, filters, common actions.
 * Merged into catalogs via getUiExtra(); missing langs fall back to English.
 */
import type { ResolvedSiteLanguage } from "./languages";
import type { MessageKey } from "./messages";

export type UiMessageKey = Extract<
  MessageKey,
  | "home.arenaPicks"
  | "home.featuredDevices"
  | "home.trendingArena"
  | "home.trendingSubtitle"
  | "home.editorsChoices"
  | "home.editorsSubtitle"
  | "home.upcomingDevices"
  | "home.upcomingSubtitle"
  | "home.aiRecommendations"
  | "home.aiSubtitle"
  | "home.aiSignInHint"
  | "home.brandUniverse"
  | "home.brandUniverseSubtitle"
  | "home.editorsArena"
  | "home.editorsArenaSubtitle"
  | "home.viewAll"
  | "home.scrollMore"
  | "footer.promise"
  | "footer.arena"
  | "footer.workWithUs"
  | "footer.discover"
  | "footer.support"
  | "footer.aboutUs"
  | "footer.contact"
  | "footer.guidelines"
  | "footer.discussions"
  | "footer.createAccount"
  | "footer.advertise"
  | "footer.partnerships"
  | "footer.press"
  | "footer.home"
  | "footer.news"
  | "footer.phones"
  | "footer.brands"
  | "footer.reviews"
  | "footer.compare"
  | "footer.phoneFinder"
  | "footer.guides"
  | "footer.community"
  | "footer.evHub"
  | "footer.terms"
  | "footer.privacy"
  | "footer.help"
  | "footer.copyright"
  | "action.voiceSearch"
  | "action.closeMenu"
  | "action.menu"
  | "phones.sortBy"
  | "phones.brands"
  | "phones.allBrands"
  | "phones.newest"
  | "phones.priceLowHigh"
  | "phones.priceHighLow"
  | "phones.bestRated"
  | "phones.search"
  | "phones.filters"
  | "phones.filterTitle"
  | "phones.showCount"
  | "phones.empty"
  | "phones.title"
  | "phones.favoritesTitle"
  | "phones.upcomingTitle"
  | "phones.trendingTitle"
  | "card.compare"
  | "card.added"
  | "card.wishlist"
  | "card.saved"
  | "card.view"
  | "card.addCompare"
  | "card.addedCompare"
  | "card.addWishlist"
  | "card.savedWishlist"
  | "card.viewDevice"
  | "card.community"
>;

const EN: Record<UiMessageKey, string> = {
  "home.arenaPicks": "Arena picks",
  "home.featuredDevices": "Featured devices",
  "home.trendingArena": "Trending Arena",
  "home.trendingSubtitle": "What the community is exploring right now",
  "home.editorsChoices": "Editor's Choices",
  "home.editorsSubtitle": "Hand-picked by the MobileArena editorial team",
  "home.upcomingDevices": "Upcoming Devices",
  "home.upcomingSubtitle": "Bulk-uploaded launches from Admin → Bulk Upload",
  "home.aiRecommendations": "AI Device Recommendations",
  "home.aiSubtitle": "Arena Labs — personalized picks based on trends",
  "home.aiSignInHint": "Sign in and browse devices to unlock AI recommendations.",
  "home.brandUniverse": "Interactive Brand Universe",
  "home.brandUniverseSubtitle":
    "Every leading smartphone brand in one place",
  "home.editorsArena": "Editor's Arena",
  "home.editorsArenaSubtitle": "Curated by the MobileArena team",
  "home.viewAll": "View all",
  "home.scrollMore": "Scroll down for more",
  "footer.promise": "Discover. Compare. Decide. Together.",
  "footer.arena": "Arena",
  "footer.workWithUs": "Work with us",
  "footer.discover": "Discover",
  "footer.support": "Support",
  "footer.aboutUs": "About Us",
  "footer.contact": "Contact",
  "footer.guidelines": "Community Guidelines",
  "footer.discussions": "Discussions",
  "footer.createAccount": "Create account",
  "footer.advertise": "Advertise",
  "footer.partnerships": "Partnerships",
  "footer.press": "Press",
  "footer.home": "Home",
  "footer.news": "News",
  "footer.phones": "Phones",
  "footer.brands": "Brands",
  "footer.reviews": "Reviews",
  "footer.compare": "Compare",
  "footer.phoneFinder": "Phone Finder",
  "footer.guides": "Guides",
  "footer.community": "Community",
  "footer.evHub": "EV Hub",
  "footer.terms": "Terms",
  "footer.privacy": "Privacy",
  "footer.help": "Help",
  "footer.copyright": "© {year} MobileArena. All rights reserved.",
  "action.voiceSearch": "Voice search",
  "action.closeMenu": "Close menu",
  "action.menu": "Menu",
  "phones.sortBy": "Sort by",
  "phones.brands": "Brands",
  "phones.allBrands": "All brands",
  "phones.newest": "Newest",
  "phones.priceLowHigh": "Price: Low to High",
  "phones.priceHighLow": "Price: High to Low",
  "phones.bestRated": "Best rated",
  "phones.search": "Search phones...",
  "phones.filters": "Filters",
  "phones.filterTitle": "Filter phones",
  "phones.showCount": "Show {count} phones",
  "phones.empty": "No phones match your filters.",
  "phones.title": "Phones",
  "phones.favoritesTitle": "Favorite Phones",
  "phones.upcomingTitle": "Upcoming Devices",
  "phones.trendingTitle": "Trending Arena",
  "card.compare": "Compare",
  "card.added": "Added",
  "card.wishlist": "Wishlist",
  "card.saved": "Saved",
  "card.view": "View",
  "card.addCompare": "Add to compare",
  "card.addedCompare": "Added to compare",
  "card.addWishlist": "Add to wishlist",
  "card.savedWishlist": "Saved to wishlist",
  "card.viewDevice": "View device",
  "card.community": "Community",
};

const HI: Partial<Record<UiMessageKey, string>> = {
  "home.arenaPicks": "एरीना पिक्स",
  "home.featuredDevices": "विशेष उपकरण",
  "home.trendingArena": "ट्रेंडिंग एरीना",
  "home.trendingSubtitle": "समुदाय अभी क्या देख रहा है",
  "home.editorsChoices": "एडिटर की पसंद",
  "home.editorsSubtitle": "मोबाइलएरीना संपादकीय टीम द्वारा चुने गए",
  "home.upcomingDevices": "आगामी डिवाइस",
  "home.upcomingSubtitle": "एडमिन → बल्क अपलोड से लॉन्च",
  "home.aiRecommendations": "एआई डिवाइस सुझाव",
  "home.aiSubtitle": "एरीना लैब्स — ट्रेंड आधारित पicks",
  "home.aiSignInHint": "एआई सुझाव के लिए साइन इन करें और डिवाइस देखें।",
  "home.brandUniverse": "इंटरैक्टिव ब्रांड यूनिवर्स",
  "home.brandUniverseSubtitle": "सभी प्रमुख स्मार्टफ़ोन ब्रांड एक जगह",
  "home.editorsArena": "एडिटर का एरीना",
  "home.editorsArenaSubtitle": "मोबाइलएरीना टीम द्वारा चुना गया",
  "home.viewAll": "सभी देखें",
  "home.scrollMore": "और देखने के लिए नीचे स्क्रॉल करें",
  "footer.promise": "खोजें। तुलना करें। तय करें। साथ में।",
  "footer.arena": "एरीना",
  "footer.workWithUs": "हमारे साथ काम करें",
  "footer.discover": "खोजें",
  "footer.support": "सहायता",
  "footer.aboutUs": "हमारे बारे में",
  "footer.contact": "संपर्क",
  "footer.guidelines": "समुदाय दिशानिर्देश",
  "footer.discussions": "चर्चाएँ",
  "footer.createAccount": "खाता बनाएँ",
  "footer.advertise": "विज्ञापन",
  "footer.partnerships": "साझेदारी",
  "footer.press": "प्रेस",
  "footer.home": "होम",
  "footer.news": "समाचार",
  "footer.phones": "फ़ोन",
  "footer.brands": "ब्रांड",
  "footer.reviews": "समीक्षाएँ",
  "footer.compare": "तुलना",
  "footer.phoneFinder": "फ़ोन खोजें",
  "footer.guides": "गाइड",
  "footer.community": "समुदाय",
  "footer.evHub": "ईवी हब",
  "footer.terms": "नियम",
  "footer.privacy": "गोपनीयता",
  "footer.help": "मदद",
  "footer.copyright": "© {year} MobileArena. सर्वाधिकार सुरक्षित।",
  "action.voiceSearch": "वॉइस खोज",
  "action.closeMenu": "मेनू बंद करें",
  "action.menu": "मेनू",
  "phones.sortBy": "इसके अनुसार क्रमबद्ध करें",
  "phones.brands": "ब्रांड्स",
  "phones.allBrands": "सभी ब्रांड",
  "phones.newest": "नवीनतम",
  "phones.priceLowHigh": "कीमत: कम से अधिक",
  "phones.priceHighLow": "कीमत: अधिक से कम",
  "phones.bestRated": "सर्वोत्तम रेटेड",
  "phones.search": "फ़ोन खोजें...",
  "phones.filters": "फ़िल्टर",
  "phones.filterTitle": "फ़ोन फ़िल्टर करें",
  "phones.showCount": "{count} फ़ोन दिखाएँ",
  "phones.empty": "आपके फ़िल्टर से कोई फ़ोन मेल नहीं खाता।",
  "phones.title": "फ़ोन",
  "phones.favoritesTitle": "पसंदीदा फ़ोन",
  "phones.upcomingTitle": "आगामी डिवाइस",
  "phones.trendingTitle": "ट्रेंडिंग एरीना",
  "card.compare": "तुलना",
  "card.added": "जोड़ा गया",
  "card.wishlist": "इच्छा-सूची",
  "card.saved": "सहेजा गया",
  "card.view": "देखें",
  "card.addCompare": "तुलना में जोड़ें",
  "card.addedCompare": "तुलना में जोड़ा गया",
  "card.addWishlist": "इच्छा-सूची में जोड़ें",
  "card.savedWishlist": "इच्छा-सूची में सहेजा गया",
  "card.viewDevice": "डिवाइस देखें",
  "card.community": "समुदाय",
};

const ZH: Partial<Record<UiMessageKey, string>> = {
  "home.arenaPicks": "Arena 精选",
  "home.featuredDevices": "精选设备",
  "home.trendingArena": "热门 Arena",
  "home.trendingSubtitle": "社区正在关注的内容",
  "home.editorsChoices": "编辑精选",
  "home.editorsSubtitle": "由 MobileArena 编辑团队挑选",
  "home.upcomingDevices": "即将上市",
  "home.upcomingSubtitle": "来自后台批量上传的新品",
  "home.aiRecommendations": "AI 设备推荐",
  "home.aiSubtitle": "Arena Labs — 基于趋势的个性化推荐",
  "home.aiSignInHint": "登录并浏览设备以解锁 AI 推荐。",
  "home.brandUniverse": "互动品牌宇宙",
  "home.brandUniverseSubtitle": "主流智能手机品牌一站汇聚",
  "home.editorsArena": "编辑 Arena",
  "home.editorsArenaSubtitle": "由 MobileArena 团队策划",
  "home.viewAll": "查看全部",
  "home.scrollMore": "向下滚动查看更多",
  "footer.promise": "发现。对比。决定。一起。",
  "footer.arena": "Arena",
  "footer.workWithUs": "与我们合作",
  "footer.discover": "发现",
  "footer.support": "支持",
  "footer.aboutUs": "关于我们",
  "footer.contact": "联系",
  "footer.guidelines": "社区准则",
  "footer.discussions": "讨论",
  "footer.createAccount": "创建账户",
  "footer.advertise": "广告合作",
  "footer.partnerships": "合作伙伴",
  "footer.press": "媒体",
  "footer.home": "首页",
  "footer.news": "新闻",
  "footer.phones": "手机",
  "footer.brands": "品牌",
  "footer.reviews": "评测",
  "footer.compare": "对比",
  "footer.phoneFinder": "手机查找",
  "footer.guides": "指南",
  "footer.community": "社区",
  "footer.evHub": "电动车中心",
  "footer.terms": "条款",
  "footer.privacy": "隐私",
  "footer.help": "帮助",
  "footer.copyright": "© {year} MobileArena. 保留所有权利。",
  "action.voiceSearch": "语音搜索",
  "action.closeMenu": "关闭菜单",
  "action.menu": "菜单",
  "phones.sortBy": "排序方式",
  "phones.brands": "品牌",
  "phones.allBrands": "全部品牌",
  "phones.newest": "最新",
  "phones.priceLowHigh": "价格：从低到高",
  "phones.priceHighLow": "价格：从高到低",
  "phones.bestRated": "评分最高",
  "phones.search": "搜索手机...",
  "phones.filters": "筛选",
  "phones.filterTitle": "筛选手机",
  "phones.showCount": "显示 {count} 款手机",
  "phones.empty": "没有符合筛选条件的手机。",
  "phones.title": "手机",
  "phones.favoritesTitle": "收藏的手机",
  "phones.upcomingTitle": "即将上市",
  "phones.trendingTitle": "热门 Arena",
  "card.compare": "对比",
  "card.added": "已添加",
  "card.wishlist": "心愿单",
  "card.saved": "已保存",
  "card.view": "查看",
  "card.addCompare": "加入对比",
  "card.addedCompare": "已加入对比",
  "card.addWishlist": "加入心愿单",
  "card.savedWishlist": "已加入心愿单",
  "card.viewDevice": "查看设备",
  "card.community": "社区",
};

const ES: Partial<Record<UiMessageKey, string>> = {
  "phones.sortBy": "Ordenar por",
  "phones.brands": "Marcas",
  "phones.allBrands": "Todas las marcas",
  "phones.newest": "Más recientes",
  "phones.priceLowHigh": "Precio: menor a mayor",
  "phones.priceHighLow": "Precio: mayor a menor",
  "phones.bestRated": "Mejor valorados",
  "phones.search": "Buscar teléfonos...",
  "phones.filters": "Filtros",
  "phones.filterTitle": "Filtrar teléfonos",
  "phones.showCount": "Mostrar {count} teléfonos",
  "phones.empty": "Ningún teléfono coincide con tus filtros.",
  "phones.title": "Teléfonos",
  "phones.favoritesTitle": "Teléfonos favoritos",
  "phones.upcomingTitle": "Próximos dispositivos",
  "phones.trendingTitle": "Arena en tendencia",
  "card.compare": "Comparar",
  "card.added": "Añadido",
  "card.wishlist": "Lista",
  "card.saved": "Guardado",
  "card.view": "Ver",
  "card.addCompare": "Añadir a comparar",
  "card.addedCompare": "Añadido a comparar",
  "card.addWishlist": "Añadir a la lista",
  "card.savedWishlist": "Guardado en la lista",
  "card.viewDevice": "Ver dispositivo",
  "card.community": "Comunidad",
  "home.viewAll": "Ver todo",
  "footer.home": "Inicio",
  "footer.phones": "Teléfonos",
  "footer.compare": "Comparar",
  "footer.news": "Noticias",
  "footer.reviews": "Reseñas",
  "footer.community": "Comunidad",
  "footer.help": "Ayuda",
  "footer.aboutUs": "Sobre nosotros",
  "footer.contact": "Contacto",
  "footer.copyright": "© {year} MobileArena. Todos los derechos reservados.",
};

const BY_LANG: Partial<Record<ResolvedSiteLanguage, Partial<Record<UiMessageKey, string>>>> = {
  hi: HI,
  zh: ZH,
  es: ES,
};

/** @deprecated kept for type export compatibility with older imports */
export const EN_UI_EXTRA = EN;

export function getUiExtra(lang: ResolvedSiteLanguage): Partial<Record<MessageKey, string>> {
  if (lang === "en") return EN;
  const localized = BY_LANG[lang];
  return { ...EN, ...(localized ?? {}) };
}
