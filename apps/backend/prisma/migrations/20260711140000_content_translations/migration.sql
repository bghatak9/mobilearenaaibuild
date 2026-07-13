-- AlterTable
ALTER TABLE "News" ADD COLUMN IF NOT EXISTS "seoTitle" TEXT;
ALTER TABLE "News" ADD COLUMN IF NOT EXISTS "seoDescription" TEXT;
ALTER TABLE "News" ADD COLUMN IF NOT EXISTS "keywords" TEXT;

ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "seoTitle" TEXT;
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "seoDescription" TEXT;
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "keywords" TEXT;

ALTER TABLE "Device" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Device" ADD COLUMN IF NOT EXISTS "seoTitle" TEXT;
ALTER TABLE "Device" ADD COLUMN IF NOT EXISTS "seoDescription" TEXT;
ALTER TABLE "Device" ADD COLUMN IF NOT EXISTS "keywords" TEXT;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "ContentEntityType" AS ENUM ('NEWS', 'REVIEW', 'DEVICE', 'CATEGORY', 'MANUFACTURER', 'DISCUSSION', 'POLL', 'EV_VEHICLE', 'BADGE', 'ADVERTISEMENT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "ContentTranslation" (
    "id" SERIAL NOT NULL,
    "entityType" "ContentEntityType" NOT NULL,
    "entityId" INTEGER NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT,
    "slug" TEXT,
    "summary" TEXT,
    "content" TEXT,
    "description" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "keywords" TEXT,
    "pros" JSONB,
    "cons" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentTranslation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ContentTranslation_entityType_entityId_locale_key" ON "ContentTranslation"("entityType", "entityId", "locale");
CREATE UNIQUE INDEX IF NOT EXISTS "ContentTranslation_entityType_locale_slug_key" ON "ContentTranslation"("entityType", "locale", "slug");
CREATE INDEX IF NOT EXISTS "ContentTranslation_entityType_entityId_idx" ON "ContentTranslation"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "ContentTranslation_locale_idx" ON "ContentTranslation"("locale");
