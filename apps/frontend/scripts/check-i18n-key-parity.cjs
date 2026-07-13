#!/usr/bin/env node
/**
 * Ensures every message-pack locale has the same JSON keys as English.
 * Usage: node scripts/check-i18n-key-parity.mjs
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "messages");
const config = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "..", "config/i18n/locales.json"),
    "utf8",
  ),
);

function flatten(obj, prefix = "") {
  const out = [];
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return out;
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out.push(...flatten(v, key));
    } else {
      out.push(key);
    }
  }
  return out;
}

const enDir = path.join(root, "en");
const namespaces = fs.readdirSync(enDir).filter((f) => f.endsWith(".json"));
const enKeys = new Set();
for (const ns of namespaces) {
  const tree = JSON.parse(fs.readFileSync(path.join(enDir, ns), "utf8"));
  for (const k of flatten(tree)) enKeys.add(`${ns.replace(/\.json$/, "")}:${k}`);
}

let failed = 0;
for (const locale of config.messagePacks) {
  if (locale === "en") continue;
  const missing = [];
  for (const ns of namespaces) {
    const file = path.join(root, locale, ns);
    if (!fs.existsSync(file)) {
      missing.push(`(missing file) ${ns}`);
      continue;
    }
    const tree = JSON.parse(fs.readFileSync(file, "utf8"));
    const keys = new Set(
      flatten(tree).map((k) => `${ns.replace(/\.json$/, "")}:${k}`),
    );
    for (const ek of enKeys) {
      if (ek.startsWith(`${ns.replace(/\.json$/, "")}:`) && !keys.has(ek)) {
        missing.push(ek);
      }
    }
  }
  if (missing.length) {
    failed++;
    console.error(`✖ ${locale}: ${missing.length} missing keys`);
    console.error(missing.slice(0, 12).join("\n"));
  } else {
    console.log(`✓ ${locale}`);
  }
}

if (failed) {
  console.error(`\n${failed} locale(s) missing keys vs English.`);
  process.exit(1);
}
console.log(`\nAll ${config.messagePacks.length - 1} packs match English key set.`);
