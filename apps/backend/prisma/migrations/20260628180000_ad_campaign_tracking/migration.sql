-- Ad campaign management & tracking
CREATE TYPE "AdCampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED');
CREATE TYPE "AdEventType" AS ENUM ('IMPRESSION', 'CLICK');

CREATE TABLE "AdCampaign" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "advertiser" TEXT,
    "budget" DOUBLE PRECISION,
    "cpm" DOUBLE PRECISION,
    "cpc" DOUBLE PRECISION,
    "revenueGoal" DOUBLE PRECISION,
    "status" "AdCampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdCampaign_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdCampaign_slug_key" ON "AdCampaign"("slug");
CREATE INDEX "AdCampaign_status_idx" ON "AdCampaign"("status");
CREATE INDEX "AdCampaign_startsAt_idx" ON "AdCampaign"("startsAt");
CREATE INDEX "AdCampaign_endsAt_idx" ON "AdCampaign"("endsAt");
CREATE INDEX "AdCampaign_createdById_idx" ON "AdCampaign"("createdById");

ALTER TABLE "AdCampaign"
  ADD CONSTRAINT "AdCampaign_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PaidAdvertisement" ADD COLUMN "campaignId" INTEGER;
ALTER TABLE "PaidAdvertisement" ADD COLUMN "impressionCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "PaidAdvertisement" ADD COLUMN "clickCount" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "PaidAdvertisement_campaignId_idx" ON "PaidAdvertisement"("campaignId");

ALTER TABLE "PaidAdvertisement"
  ADD CONSTRAINT "PaidAdvertisement_campaignId_fkey"
  FOREIGN KEY ("campaignId") REFERENCES "AdCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "AdEvent" (
    "id" SERIAL NOT NULL,
    "eventType" "AdEventType" NOT NULL,
    "placement" TEXT,
    "path" TEXT,
    "visitorId" TEXT,
    "advertisementId" INTEGER NOT NULL,
    "campaignId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AdEvent_advertisementId_idx" ON "AdEvent"("advertisementId");
CREATE INDEX "AdEvent_campaignId_idx" ON "AdEvent"("campaignId");
CREATE INDEX "AdEvent_eventType_idx" ON "AdEvent"("eventType");
CREATE INDEX "AdEvent_createdAt_idx" ON "AdEvent"("createdAt");

ALTER TABLE "AdEvent"
  ADD CONSTRAINT "AdEvent_advertisementId_fkey"
  FOREIGN KEY ("advertisementId") REFERENCES "PaidAdvertisement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AdEvent"
  ADD CONSTRAINT "AdEvent_campaignId_fkey"
  FOREIGN KEY ("campaignId") REFERENCES "AdCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
