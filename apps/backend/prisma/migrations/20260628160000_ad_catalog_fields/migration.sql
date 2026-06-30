-- Ad catalog taxonomy fields
ALTER TABLE "PaidAdvertisement" ADD COLUMN "adType" TEXT NOT NULL DEFAULT 'display';
ALTER TABLE "PaidAdvertisement" ADD COLUMN "format" TEXT;
ALTER TABLE "PaidAdvertisement" ADD COLUMN "width" INTEGER;
ALTER TABLE "PaidAdvertisement" ADD COLUMN "height" INTEGER;
ALTER TABLE "PaidAdvertisement" ADD COLUMN "sponsored" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "PaidAdvertisement" ADD COLUMN "priority" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "PaidAdvertisement_adType_idx" ON "PaidAdvertisement"("adType");
CREATE INDEX "PaidAdvertisement_sponsored_idx" ON "PaidAdvertisement"("sponsored");
