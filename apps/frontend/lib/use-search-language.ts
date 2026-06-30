"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getStoredSearchLanguage,
  setStoredSearchLanguage,
  type SearchLanguageCode,
} from "@/features/phone-finder/search-locale";

export function useSearchLanguage() {
  const [language, setLanguage] = useState<SearchLanguageCode>("auto");

  useEffect(() => {
    setLanguage(getStoredSearchLanguage());

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<SearchLanguageCode>).detail;
      if (detail) setLanguage(detail);
      else setLanguage(getStoredSearchLanguage());
    };

    window.addEventListener("search-language-change", onChange);
    return () => window.removeEventListener("search-language-change", onChange);
  }, []);

  const updateLanguage = useCallback((code: SearchLanguageCode) => {
    setStoredSearchLanguage(code);
    setLanguage(code);
  }, []);

  return { language, setLanguage: updateLanguage };
}
