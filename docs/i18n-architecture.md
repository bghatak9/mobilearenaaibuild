# MobileArena Global Internationalization Architecture

Production guide for unlimited BCP-47 locales without schema changes per language.

## Design decision: polymorphic `ContentTranslation`

The blueprint’s `DeviceTranslation` / `BrandTranslation` / … tables are implemented as **one** polymorphic table:

| Blueprint name | Implementation |
|----------------|----------------|
| `DeviceTranslation` | `ContentTranslation` where `entityType = DEVICE` |
| `BrandTranslation` | `entityType = BRAND` |
| `NewsTranslation` | `entityType = NEWS` |
| `ReviewTranslation` | `entityType = REVIEW` |
| Guides, FAQ, Tags, … | Matching `ContentEntityType` enum values |

**Why:** Adding a language never requires a migration — only new rows with a `locale` string. Shared services (merge, fallback, search, coverage, admin upsert) stay DRY. Typed facades can wrap entity types later if desired.

Canonical English remains on parent rows (`Device.name`, `Brand.name`, …). Translations override display/SEO fields. **Numeric specs stay language-independent**; UI labels live in `messages/*/specs.json`.

### Workflow fields

- `status`: `DRAFT` → `MACHINE` → `HUMAN_REVIEWED` → `APPROVED` → `PUBLISHED`
- `shortName`, `headline`, `aliases` (native spellings for search)
- `source`: provenance (`seed`, `ai`, `editor`, …)

### Fallback

```
requested locale → English translation row → parent canonical fields
```

Never return empty marketing copy when English exists.

## Frontend routing

- All public pages: `app/[locale]/…`
- `localePrefix: "always"` → `/en/phones`, `/hi/phones`, …
- Cookie `mobilearena_lang` + Accept-Language on first visit
- Soft locale switch via next-intl (no full document reload)
- RTL: `dir` on `<html>` for `ar` / `fa` / `he` / `ur`

## UI strings

- Namespaced JSON: `messages/{locale}/*.json`
- Identical keys across packs — enforce with `scripts/check-i18n-key-parity.cjs`
- Fill missing keys from EN: `scripts/sync-i18n-keys-from-en.cjs`
- Spec labels: `messages/*/specs.json` (compare + device tables)

## API locale contract

Prefer query params (stable for mobile clients and caches):

```
GET /devices?locale=hi
GET /devices?lang=bn
GET /devices/slug/galaxy-s26?locale=ar
```

`LocaleInterceptor` also reads `Accept-Language` when query is absent and sets `req.locale`.

Redis keys are locale-scoped (`devices:list:…:hi:…`).

## Search

1. **Prisma** (always on): `ContentTranslation` title / keywords / **aliases** across all locales.
2. **Meilisearch** (optional): set `MEILI_HOST`. Indexes flatten all locale titles + aliases so `سامسونج` / `স্যামসাং` / `三星` hit the same brand/device.

```bash
# docker-compose includes meilisearch on :7700
POST /search/reindex   # admin JWT
GET  /search?q=سامسونج&locale=en
```

Brand seed: `npm run prisma:seed:brand-i18n` in `apps/backend`.

## Slugs

- Optional `ContentTranslation.slug` per locale
- Device detail permanently redirects EN slug → localized slug when present
- Canonical / hreflang use `localeSlugs` map from the API

## SEO

- Per-locale metadata via `generateMetadata`
- hreflang + Open Graph `locale` / `alternateLocale`
- Sitemap alternates; RSS `hreflang` links

## Fonts

`lib/site-fonts.ts` loads Inter + script fonts (`preload: false` for non-Latin). CSS activates by `html[data-site-lang=…]`.

## Admin

- `/admin/translations` — coverage (news, reviews, devices, **brands**)
- `PUT /content-translations/:entityType/:entityId/:locale` — upsert drafts

## Adding a language (no code required for CMS)

1. Add code to `config/i18n/locales.json` → `enabled` (and optionally `messagePacks`).
2. Run `sync-i18n-keys-from-en.cjs` if using a message pack.
3. Seed / import `ContentTranslation` rows for priority entities.
4. Reindex Meilisearch if enabled.

## Accessibility (WCAG AA)

- Skip link → `#main-content` (`SkipToContent`)
- Shared `<main id="main-content" tabIndex={-1}>` in `ArenaShellClient`
- Soft language change announced via polite `aria-live` (`LanguageStatusAnnouncer`)
- Language picker: listbox + combobox search, `aria-activedescendant`, focus restore on close
- Mobile drawer: `role="dialog"` + focus trap + Escape + RTL `inset-inline-start`
- Toasts use `inset-inline-end` (RTL-safe) and localized dismiss labels
- `html[lang]` / `dir` set on every request; logical CSS for RTL docking

## Content localization coverage (runtime)

| Entity | API locale | Nested relations | Sitemap / RSS |
|--------|------------|------------------|---------------|
| Device | yes | brand + category localized | yes |
| Brand | yes | categories in grouped list | yes |
| Category | yes (`GET /categories?locale=`) | — | via brand groups |
| News / Review | yes | — | yes / `rss.xml?locale=` |
| Guides | UI messages (static cards) | CMS `GUIDE` enum ready | static `/guides` |
| Compare select | next-intl | — | hub in sitemap |

Fallback chain: requested locale → English translation row → parent canonical fields.

## Still rolling out

- Human review queue for high-traffic locales
- Auto Meili sync on every translation upsert
- UGC on-demand AI translation
- Full compare-labs / community body string sweep
