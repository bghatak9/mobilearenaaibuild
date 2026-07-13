#!/usr/bin/env node
/**
 * Deep-merge English message namespaces into every messagePack locale.
 * Preserves existing translations; fills missing keys from en.
 *
 * Usage: node scripts/sync-i18n-keys-from-en.cjs
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const config = require(path.join(root, "config/i18n/locales.json"));
const messagesDir = path.join(root, "messages");

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(base, override) {
  const out = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const prev = out[key];
    if (isPlainObject(prev) && isPlainObject(value)) {
      out[key] = deepMerge(prev, value);
    } else if (!(key in out)) {
      out[key] = value;
    } else if (isPlainObject(value) && !isPlainObject(prev)) {
      out[key] = value;
    }
    // Keep existing non-object translations as-is.
  }
  return out;
}

/** Ensure every EN key exists; prefer locale value when present. */
function fillFromEn(enTree, localeTree) {
  if (!isPlainObject(enTree)) return localeTree ?? enTree;
  const out = isPlainObject(localeTree) ? { ...localeTree } : {};
  for (const [key, enVal] of Object.entries(enTree)) {
    if (isPlainObject(enVal)) {
      out[key] = fillFromEn(enVal, out[key]);
    } else if (!(key in out)) {
      out[key] = enVal;
    }
  }
  return out;
}

const enDir = path.join(messagesDir, "en");
const enFiles = fs.readdirSync(enDir).filter((f) => f.endsWith(".json"));

let updated = 0;
for (const locale of config.messagePacks) {
  if (locale === "en") continue;
  const localeDir = path.join(messagesDir, locale);
  if (!fs.existsSync(localeDir)) {
    fs.mkdirSync(localeDir, { recursive: true });
  }

  for (const file of enFiles) {
    const enPath = path.join(enDir, file);
    const locPath = path.join(localeDir, file);
    const enJson = JSON.parse(fs.readFileSync(enPath, "utf8"));
    const locJson = fs.existsSync(locPath)
      ? JSON.parse(fs.readFileSync(locPath, "utf8"))
      : {};
    const merged = fillFromEn(enJson, locJson);
    fs.writeFileSync(locPath, `${JSON.stringify(merged, null, 2)}\n`);
    updated += 1;
  }
  console.log(`✓ synced ${locale}`);
}

console.log(`\nWrote ${updated} locale namespace files from English keys.`);
