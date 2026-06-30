-- Phase 3/4: email verification, polls, reports, discussions, pricing, availability

CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'REVIEWED', 'DISMISSED');
CREATE TYPE "ReportEntityType" AS ENUM ('COMMENT', 'REVIEW', 'USER', 'DISCUSSION');

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "profilePublic" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS "EmailVerificationToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Poll" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "choices" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Poll_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ContentReport" (
    "id" SERIAL NOT NULL,
    "reporterId" INTEGER NOT NULL,
    "entityType" "ReportEntityType" NOT NULL,
    "entityId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ContentReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Discussion" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "deviceId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Discussion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "DevicePriceHistory" (
    "id" SERIAL NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DevicePriceHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "DeviceCountryAvailability" (
    "id" SERIAL NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "countryCode" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "price" DOUBLE PRECISION,
    "currency" TEXT,
    CONSTRAINT "DeviceCountryAvailability_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "EmailVerificationToken_userId_key" ON "EmailVerificationToken"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "EmailVerificationToken_token_key" ON "EmailVerificationToken"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "Poll_slug_key" ON "Poll"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "Discussion_slug_key" ON "Discussion"("slug");
CREATE INDEX IF NOT EXISTS "ContentReport_status_idx" ON "ContentReport"("status");
CREATE INDEX IF NOT EXISTS "ContentReport_entityType_entityId_idx" ON "ContentReport"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "ContentReport_reporterId_idx" ON "ContentReport"("reporterId");
CREATE INDEX IF NOT EXISTS "Discussion_deviceId_idx" ON "Discussion"("deviceId");
CREATE INDEX IF NOT EXISTS "Discussion_userId_idx" ON "Discussion"("userId");
CREATE INDEX IF NOT EXISTS "DevicePriceHistory_deviceId_recordedAt_idx" ON "DevicePriceHistory"("deviceId", "recordedAt");
CREATE UNIQUE INDEX IF NOT EXISTS "DeviceCountryAvailability_deviceId_countryCode_key" ON "DeviceCountryAvailability"("deviceId", "countryCode");
CREATE INDEX IF NOT EXISTS "DeviceCountryAvailability_deviceId_idx" ON "DeviceCountryAvailability"("deviceId");

ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentReport" ADD CONSTRAINT "ContentReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DevicePriceHistory" ADD CONSTRAINT "DevicePriceHistory_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DeviceCountryAvailability" ADD CONSTRAINT "DeviceCountryAvailability_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "Poll" ("slug", "question", "choices", "active", "updatedAt")
VALUES (
  'camera-king-2026',
  'Which camera king wins in 2026?',
  '[{"id":"pixel-x","label":"Pixel X"},{"id":"galaxy-ultra","label":"Galaxy Ultra"},{"id":"iphone-pro","label":"iPhone Pro"}]'::jsonb,
  true,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO NOTHING;
