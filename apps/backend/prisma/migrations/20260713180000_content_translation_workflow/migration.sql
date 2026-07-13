-- Expand ContentTranslation for production multilingual CMS workflow.
-- New languages still require NO schema change (locale is a string column).

CREATE TYPE "TranslationStatus" AS ENUM (
  'DRAFT',
  'MACHINE',
  'HUMAN_REVIEWED',
  'APPROVED',
  'PUBLISHED'
);

ALTER TYPE "ContentEntityType" ADD VALUE IF NOT EXISTS 'CHIPSET';
ALTER TYPE "ContentEntityType" ADD VALUE IF NOT EXISTS 'GPU';
ALTER TYPE "ContentEntityType" ADD VALUE IF NOT EXISTS 'OPERATING_SYSTEM';
ALTER TYPE "ContentEntityType" ADD VALUE IF NOT EXISTS 'SPECIFICATION_TYPE';
ALTER TYPE "ContentEntityType" ADD VALUE IF NOT EXISTS 'GUIDE';
ALTER TYPE "ContentEntityType" ADD VALUE IF NOT EXISTS 'FAQ';
ALTER TYPE "ContentEntityType" ADD VALUE IF NOT EXISTS 'CMS_PAGE';
ALTER TYPE "ContentEntityType" ADD VALUE IF NOT EXISTS 'COMPARISON';
ALTER TYPE "ContentEntityType" ADD VALUE IF NOT EXISTS 'TAG';

ALTER TABLE "ContentTranslation"
  ADD COLUMN IF NOT EXISTS "shortName" TEXT,
  ADD COLUMN IF NOT EXISTS "headline" TEXT,
  ADD COLUMN IF NOT EXISTS "aliases" TEXT,
  ADD COLUMN IF NOT EXISTS "status" "TranslationStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS "source" TEXT,
  ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "ContentTranslation_status_idx" ON "ContentTranslation"("status");
