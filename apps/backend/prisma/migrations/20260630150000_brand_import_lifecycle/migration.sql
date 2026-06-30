-- AlterTable
ALTER TABLE "Brand" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Brand_deletedAt_idx" ON "Brand"("deletedAt");

-- AlterTable
ALTER TABLE "ImportBatchItem" ADD COLUMN "brandId" INTEGER;

-- CreateIndex
CREATE INDEX "ImportBatchItem_brandId_idx" ON "ImportBatchItem"("brandId");

-- AddForeignKey
ALTER TABLE "ImportBatchItem" ADD CONSTRAINT "ImportBatchItem_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill brandId for existing brand upload items
UPDATE "ImportBatchItem"
SET "brandId" = "entityId"
WHERE "entityType" = 'brand' AND "brandId" IS NULL;
