-- Paid advertisement import lifecycle (soft delete, batch tracking)

ALTER TABLE "PaidAdvertisement" ADD COLUMN "importBatchId" INTEGER;
ALTER TABLE "PaidAdvertisement" ADD COLUMN "deletedAt" TIMESTAMP(3);

ALTER TABLE "ImportBatchItem" ADD COLUMN "advertisementId" INTEGER;

ALTER TABLE "PaidAdvertisement"
  ADD CONSTRAINT "PaidAdvertisement_importBatchId_fkey"
  FOREIGN KEY ("importBatchId") REFERENCES "ImportBatch"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ImportBatchItem"
  ADD CONSTRAINT "ImportBatchItem_advertisementId_fkey"
  FOREIGN KEY ("advertisementId") REFERENCES "PaidAdvertisement"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "PaidAdvertisement_deletedAt_idx" ON "PaidAdvertisement"("deletedAt");
CREATE INDEX "PaidAdvertisement_importBatchId_idx" ON "PaidAdvertisement"("importBatchId");
CREATE INDEX "ImportBatchItem_advertisementId_idx" ON "ImportBatchItem"("advertisementId");
