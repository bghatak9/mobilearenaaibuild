/**
 * Namespaced message loader — loads ONLY the active locale (+ English fallback).
 * Message packs are discovered from `config/i18n/locales.json` → messages/{locale}/.
 */

import { getMessages } from "@/features/i18n/messages";
import type { ResolvedSiteLanguage } from "@/features/i18n/languages";

import {
  DEFAULT_LOCALE,
  hasMessagePack,
  isEnabledLocale,
  MESSAGE_NAMESPACES,
  type MessageNamespace,
} from "./locales";
import { nestFlatMessages } from "./config";

export { MESSAGE_NAMESPACES, type MessageNamespace } from "./locales";

type MessageTree = Record<string, unknown>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function deepMergeMessages(
  base: MessageTree,
  override: MessageTree,
): MessageTree {
  const out: MessageTree = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const prev = out[key];
    if (isPlainObject(prev) && isPlainObject(value)) {
      out[key] = deepMergeMessages(prev, value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

/**
 * Dynamic import constrained to messages/* — bundler includes only requested
 * locale chunks at request time (not every language in the client bundle).
 */
async function importNamespace(
  locale: string,
  ns: MessageNamespace,
): Promise<MessageTree | null> {
  try {
    const mod = (await import(
      /* webpackInclude: /messages\/[^/]+\/[^/]+\.json$/ */
      /* webpackMode: "lazy" */
      `../messages/${locale}/${ns}.json`
    )) as { default?: MessageTree } & MessageTree;
    return (mod.default ?? mod) as MessageTree;
  } catch {
    return null;
  }
}

async function loadLocaleNamespaces(locale: string): Promise<MessageTree> {
  const entries = await Promise.all(
    MESSAGE_NAMESPACES.map((ns) => importNamespace(locale, ns)),
  );

  let tree: MessageTree = {};
  for (const data of entries) {
    if (!data) continue;
    tree = deepMergeMessages(tree, data);
  }
  return tree;
}

/** Map request locale → closest TS catalog bridge during migration. */
function bridgeLocale(locale: string): string {
  if (locale === "zh-CN" || locale === "zh-TW" || locale === "zh") return "zh";
  if (locale === "hi" || locale === "es" || locale === "en") return locale;
  return DEFAULT_LOCALE;
}

function catalogBridge(locale: string): MessageTree {
  return nestFlatMessages(
    getMessages(bridgeLocale(locale) as ResolvedSiteLanguage) as unknown as Record<
      string,
      string
    >,
  );
}

/**
 * Fallback chain: locale JSON → English JSON → TS bridge → key (next-intl).
 */
export async function loadMessages(locale: string): Promise<MessageTree> {
  const safe = isEnabledLocale(locale) ? locale : DEFAULT_LOCALE;
  const packLocale = hasMessagePack(safe)
    ? safe
    : hasMessagePack(bridgeLocale(safe))
      ? bridgeLocale(safe) === "zh"
        ? hasMessagePack("zh-CN")
          ? "zh-CN"
          : null
        : bridgeLocale(safe)
      : null;

  // Prefer canonical pack folders (zh-CN over legacy zh).
  const jsonLocale =
    packLocale ??
    (safe === "zh" || safe === "zh-CN"
      ? hasMessagePack("zh-CN")
        ? "zh-CN"
        : null
      : null);

  const [enJson, localeJson] = await Promise.all([
    loadLocaleNamespaces(DEFAULT_LOCALE),
    jsonLocale && jsonLocale !== DEFAULT_LOCALE
      ? loadLocaleNamespaces(jsonLocale)
      : Promise.resolve({} as MessageTree),
  ]);

  const bridge = catalogBridge(safe);
  let merged = deepMergeMessages(bridge, enJson);
  if (jsonLocale && jsonLocale !== DEFAULT_LOCALE) {
    merged = deepMergeMessages(merged, localeJson);
  }

  return merged;
}
