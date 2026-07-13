/**
 * Direct next-intl access for components that prefer namespaces
 * (e.g. useAppTranslations('nav')).
 * Existing chrome can keep using useSiteLanguage().t('nav.brands').
 */
"use client";

import { useTranslations, useLocale } from "next-intl";

export function useAppTranslations(namespace?: string) {
  return useTranslations(namespace);
}

export function useAppLocale() {
  return useLocale();
}
