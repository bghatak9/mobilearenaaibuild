"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import {
  applyGooglePageLanguage,
  clearPageLanguageReloadParam,
  findGoogleTranslateSelect,
  googleTranslateCodeForSite,
  includedGoogleLanguages,
  PAGE_TRANSLATE_SOURCE,
  setPageTranslateCookie,
} from "@/features/i18n/page-translate";
import { useSiteLanguage } from "@/lib/site-language";

const SCRIPT_ID = "mobilearena-google-translate";
export const GOOGLE_TRANSLATE_HOST_ID = "mobilearena_google_translate";

const PROTECTED_NO_TRANSLATE = [
  "arena-site-language",
  "arena-site-language__panel",
  "arena-site-logo",
  "arena-page-translator",
  "arena-brand-name",
  "arena-device-name",
  "arena-tech-text",
  // next-intl chrome — already localized; GT must not re-translate / mangle
  "arena-intl-chrome",
  "arena-shell-header",
  "ma-footer",
];

/** Unlock page text for Google Translate except protected controls. */
export function unlockPageForTranslate(): void {
  document.body.setAttribute("translate", "yes");
  document.documentElement.setAttribute("translate", "yes");
  document.documentElement.classList.remove("notranslate");
  document.body.classList.remove("notranslate");

  document.querySelectorAll(".notranslate, [translate='no']").forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    if (
      node.id === GOOGLE_TRANSLATE_HOST_ID ||
      PROTECTED_NO_TRANSLATE.some(
        (cls) => node.classList.contains(cls) || Boolean(node.closest(`.${cls}`)),
      )
    ) {
      return;
    }
    node.classList.remove("notranslate");
    if (node.getAttribute("translate") === "no") {
      node.removeAttribute("translate");
    }
  });
}

function clearGoogleTranslateState(): void {
  setPageTranslateCookie(PAGE_TRANSLATE_SOURCE);
  document.documentElement.classList.remove(
    "ma-translated",
    "translated-ltr",
    "translated-rtl",
  );
  document.body.classList.remove("translated-ltr", "translated-rtl");
  document
    .querySelectorAll(".goog-te-banner-frame, .goog-te-menu-frame, #goog-gt-tt")
    .forEach((el) => el.remove());
  const host = document.getElementById(GOOGLE_TRANSLATE_HOST_ID);
  if (host) {
    host.innerHTML = "";
    delete host.dataset.mounted;
  }
}

function mountTranslateWidget(): void {
  if (!window.google?.translate?.TranslateElement) return;
  const host = document.getElementById(GOOGLE_TRANSLATE_HOST_ID);
  if (!host) return;
  if (host.dataset.mounted === "1" && host.childElementCount > 0) {
    return;
  }
  host.innerHTML = "";
  // eslint-disable-next-line no-new
  new window.google.translate.TranslateElement(
    {
      pageLanguage: PAGE_TRANSLATE_SOURCE,
      includedLanguages: includedGoogleLanguages(),
      autoDisplay: false,
      multilanguagePage: true,
    },
    GOOGLE_TRANSLATE_HOST_ID,
  );
  host.dataset.mounted = "1";
}

function waitForCombo(ms = 8000): Promise<HTMLSelectElement | null> {
  return new Promise((resolve) => {
    const found = findGoogleTranslateSelect();
    if (found && found.options.length > 1) {
      resolve(found);
      return;
    }
    const start = Date.now();
    const id = window.setInterval(() => {
      const el = findGoogleTranslateSelect();
      if (el && el.options.length > 1) {
        window.clearInterval(id);
        resolve(el);
        return;
      }
      if (Date.now() - start > ms) {
        window.clearInterval(id);
        resolve(el ?? null);
      }
    }, 150);
  });
}

/**
 * Google Translate for non-English locales — including next-intl message packs.
 * Packs cover chrome (nav/footer) well, but many body namespaces are still
 * English stubs; GT translates the rest of the page.
 * Protected nodes (picker, logo, brand/device names, intl chrome) stay original.
 */
export function SitePageTranslator() {
  const { language, ready } = useSiteLanguage();
  const pathname = usePathname();
  const observerRef = useRef<MutationObserver | null>(null);
  const appliedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!ready || typeof window === "undefined") return;

    clearPageLanguageReloadParam();

    const target = googleTranslateCodeForSite(language);

    // English (and en-* mapped to en): no overlay.
    if (target === PAGE_TRANSLATE_SOURCE) {
      clearGoogleTranslateState();
      appliedRef.current = null;
      return;
    }

    appliedRef.current = null;
    setPageTranslateCookie(target);
    unlockPageForTranslate();
    document.documentElement.classList.add("ma-translated");

    const syncLanguage = async (opts?: { force?: boolean }) => {
      unlockPageForTranslate();
      mountTranslateWidget();
      setPageTranslateCookie(target);
      const combo = await waitForCombo();
      if (!combo) {
        setPageTranslateCookie(target);
        return;
      }
      if (!opts?.force && combo.value === target && appliedRef.current === target) {
        return;
      }
      const ok = applyGooglePageLanguage(target, {
        force: Boolean(opts?.force) && target !== PAGE_TRANSLATE_SOURCE,
      });
      if (ok) appliedRef.current = target;
      unlockPageForTranslate();
    };

    window.googleTranslateElementInit = () => {
      void syncLanguage({ force: true });
    };

    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.async = true;
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);
    } else if (window.google?.translate?.TranslateElement) {
      void syncLanguage({ force: true });
    }

    let unlockTimer = 0;
    const scheduleUnlock = () => {
      window.clearTimeout(unlockTimer);
      unlockTimer = window.setTimeout(() => {
        unlockPageForTranslate();
        setPageTranslateCookie(target);
      }, 100);
    };

    const settle = window.setTimeout(() => {
      void syncLanguage({ force: appliedRef.current !== target });
    }, 2500);

    // Soft locale / route changes remount English body copy — re-apply GT.
    const settleSoft = window.setTimeout(() => {
      void syncLanguage({ force: true });
    }, 600);

    observerRef.current?.disconnect();
    const observer = new MutationObserver(scheduleUnlock);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "translate"],
    });
    observerRef.current = observer;

    return () => {
      window.clearTimeout(settle);
      window.clearTimeout(settleSoft);
      window.clearTimeout(unlockTimer);
      observer.disconnect();
      if (observerRef.current === observer) observerRef.current = null;
    };
  }, [language, ready, pathname]);

  return (
    <div
      id={GOOGLE_TRANSLATE_HOST_ID}
      className="arena-page-translator notranslate"
      aria-hidden
      translate="no"
    />
  );
}
