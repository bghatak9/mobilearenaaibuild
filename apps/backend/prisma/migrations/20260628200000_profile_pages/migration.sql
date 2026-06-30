-- Profile pages: headline, settings, bookmarks, favorites, wishlist, notifications, polls
CREATE TYPE "BookmarkEntityType" AS ENUM ('DEVICE', 'NEWS', 'REVIEW');

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "headline" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notifyReplies" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notifyPriceAlerts" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notifyNewsletter" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "UserBookmark" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "entityType" "BookmarkEntityType" NOT NULL,
    "entityId" INTEGER NOT NULL,
    "title" TEXT,
    "slug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserBookmark_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "UserFavoriteDevice" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserFavoriteDevice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "UserWishlistItem" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "targetPrice" DOUBLE PRECISION,
    "alertEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserWishlistItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "UserNotification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserNotification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "UserPollVote" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "pollSlug" TEXT NOT NULL,
    "pollTitle" TEXT NOT NULL,
    "choice" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserPollVote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserBookmark_userId_entityType_entityId_key" ON "UserBookmark"("userId", "entityType", "entityId");
CREATE INDEX IF NOT EXISTS "UserBookmark_userId_idx" ON "UserBookmark"("userId");
CREATE INDEX IF NOT EXISTS "UserBookmark_entityType_idx" ON "UserBookmark"("entityType");

CREATE UNIQUE INDEX IF NOT EXISTS "UserFavoriteDevice_userId_deviceId_key" ON "UserFavoriteDevice"("userId", "deviceId");
CREATE INDEX IF NOT EXISTS "UserFavoriteDevice_userId_idx" ON "UserFavoriteDevice"("userId");
CREATE INDEX IF NOT EXISTS "UserFavoriteDevice_deviceId_idx" ON "UserFavoriteDevice"("deviceId");

CREATE UNIQUE INDEX IF NOT EXISTS "UserWishlistItem_userId_deviceId_key" ON "UserWishlistItem"("userId", "deviceId");
CREATE INDEX IF NOT EXISTS "UserWishlistItem_userId_idx" ON "UserWishlistItem"("userId");
CREATE INDEX IF NOT EXISTS "UserWishlistItem_deviceId_idx" ON "UserWishlistItem"("deviceId");

CREATE INDEX IF NOT EXISTS "UserNotification_userId_idx" ON "UserNotification"("userId");
CREATE INDEX IF NOT EXISTS "UserNotification_read_idx" ON "UserNotification"("read");
CREATE INDEX IF NOT EXISTS "UserNotification_createdAt_idx" ON "UserNotification"("createdAt");

CREATE UNIQUE INDEX IF NOT EXISTS "UserPollVote_userId_pollSlug_key" ON "UserPollVote"("userId", "pollSlug");
CREATE INDEX IF NOT EXISTS "UserPollVote_userId_idx" ON "UserPollVote"("userId");

DO $$ BEGIN
  ALTER TABLE "UserBookmark" ADD CONSTRAINT "UserBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "UserFavoriteDevice" ADD CONSTRAINT "UserFavoriteDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "UserFavoriteDevice" ADD CONSTRAINT "UserFavoriteDevice_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "UserWishlistItem" ADD CONSTRAINT "UserWishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "UserWishlistItem" ADD CONSTRAINT "UserWishlistItem_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "UserPollVote" ADD CONSTRAINT "UserPollVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
