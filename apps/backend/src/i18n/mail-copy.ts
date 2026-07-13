/**
 * Lightweight server-side copy for emails / in-app notifications.
 * Prefer message codes + frontend i18n for UI; use this for outbound mail/API copy.
 */

export type MailLocale = string;

type MailBag = {
  welcomeTitle: string;
  welcomeBody: string;
  compareTitle: string;
  compareBody: string;
  finderTitle: string;
  finderBody: string;
  communityTitle: string;
  communityBody: string;
  emailVerified: string;
  invalidVerification: string;
  resetSent: string;
};

const EN: MailBag = {
  welcomeTitle: 'Welcome to MobileArena',
  welcomeBody:
    'Browse phones, compare specs, and join the community — no account required.',
  compareTitle: 'Compare up to four phones',
  compareBody: 'Use Comparison Tools for side-by-side specification scoring.',
  finderTitle: 'Try Phone Finder',
  finderBody: 'Filter by camera, battery, budget, and more with smart presets.',
  communityTitle: 'Join the Arena community',
  communityBody: 'Vote in polls, read reviews, and share buying advice.',
  emailVerified: 'Email verified successfully.',
  invalidVerification: 'Invalid verification link.',
  resetSent: 'If an account exists, a verification code has been sent.',
};

const BN: Partial<MailBag> = {
  welcomeTitle: 'MobileArena-এ স্বাগতম',
  welcomeBody:
    'ফোন ব্রাউজ করুন, স্পেক তুলনা করুন এবং কমিউনিটিতে যোগ দিন — অ্যাকাউন্ট ছাড়াই।',
  compareTitle: 'চারটি পর্যন্ত ফোন তুলনা করুন',
  finderTitle: 'ফোন ফাইন্ডার ব্যবহার করুন',
  communityTitle: 'এরিনা কমিউনিটিতে যোগ দিন',
  emailVerified: 'ইমেইল সফলভাবে যাচাই হয়েছে।',
  resetSent: 'অ্যাকাউন্ট থাকলে একটি যাচাইকরণ কোড পাঠানো হয়েছে।',
};

const HI: Partial<MailBag> = {
  welcomeTitle: 'MobileArena में आपका स्वागत है',
  welcomeBody:
    'फ़ोन ब्राउज़ करें, स्पेक तुलना करें और समुदाय से जुड़ें — खाते की ज़रूरत नहीं।',
  compareTitle: 'चार फ़ोन तक तुलना करें',
  finderTitle: 'फ़ोन फ़ाइंडर आज़माएँ',
  communityTitle: 'एरीना समुदाय से जुड़ें',
  emailVerified: 'ईमेल सफलतापूर्वक सत्यापित।',
  resetSent: 'यदि खाता मौजूद है, तो सत्यापन कोड भेज दिया गया है।',
};

const BY_LOCALE: Record<string, Partial<MailBag>> = {
  en: EN,
  bn: BN,
  hi: HI,
  'zh-CN': {
    welcomeTitle: '欢迎来到 MobileArena',
    emailVerified: '邮箱验证成功。',
    resetSent: '如果账户存在，验证码已发送。',
  },
  es: {
    welcomeTitle: 'Bienvenido a MobileArena',
    emailVerified: 'Correo verificado correctamente.',
    resetSent: 'Si existe una cuenta, se ha enviado un código de verificación.',
  },
  fr: {
    welcomeTitle: 'Bienvenue sur MobileArena',
    emailVerified: 'E-mail vérifié avec succès.',
    resetSent: 'Si un compte existe, un code de vérification a été envoyé.',
  },
  ar: {
    welcomeTitle: 'مرحبًا بك في MobileArena',
    emailVerified: 'تم التحقق من البريد الإلكتروني بنجاح.',
    resetSent: 'إذا كان الحساب موجودًا، فقد تم إرسال رمز التحقق.',
  },
};

function normalize(locale?: string | null): string {
  if (!locale) return 'en';
  const raw = locale.trim().replace(/_/g, '-');
  if (BY_LOCALE[raw]) return raw;
  const primary = raw.split('-')[0] ?? 'en';
  if (BY_LOCALE[primary]) return primary;
  return 'en';
}

export function mailCopy(locale?: string | null): MailBag {
  const code = normalize(locale);
  return { ...EN, ...(BY_LOCALE[code] ?? {}) };
}
