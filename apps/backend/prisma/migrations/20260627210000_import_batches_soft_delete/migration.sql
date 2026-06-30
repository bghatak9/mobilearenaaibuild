-- Import batch tracking, soft-delete for devices, enterprise delete safety.

CREATE TYPE "ImportBatchStatus" AS ENUM ('COMPLETED', 'PARTIALLY_DELETED', 'FULLY_DELETED', 'PURGED');

CREATE TABLE "ImportBatch" (
  "id" SERIAL NOT NULL,
  "kind" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "jobId" TEXT,
  "status" "ImportBatchStatus" NOT NULL DEFAULT 'COMPLETED',
  "totalRows" INTEGER NOT NULL DEFAULT 0,
  "inserted" INTEGER NOT NULL DEFAULT 0,
  "skipped" INTEGER NOT NULL DEFAULT 0,
  "importedById" INTEGER NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "purgedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ImportBatch_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ImportBatch_jobId_key" ON "ImportBatch"("jobId");
CREATE INDEX "ImportBatch_kind_idx" ON "ImportBatch"("kind");
CREATE INDEX "ImportBatch_status_idx" ON "ImportBatch"("status");
CREATE INDEX "ImportBatch_createdAt_idx" ON "ImportBatch"("createdAt");
CREATE INDEX "ImportBatch_deletedAt_idx" ON "ImportBatch"("deletedAt");

ALTER TABLE "ImportBatch"
  ADD CONSTRAINT "ImportBatch_importedById_fkey"
  FOREIGN KEY ("importedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "ImportBatchItem" (
  "id" SERIAL NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" INTEGER NOT NULL,
  "entitySlug" TEXT,
  "entityName" TEXT,
  "batchId" INTEGER NOT NULL,
  "deviceId" INTEGER,
  "deletedAt" TIMESTAMP(3),

  CONSTRAINT "ImportBatchItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ImportBatchItem_batchId_entityType_entityId_key"
  ON "ImportBatchItem"("batchId", "entityType", "entityId");
CREATE INDEX "ImportBatchItem_batchId_idx" ON "ImportBatchItem"("batchId");
CREATE INDEX "ImportBatchItem_deviceId_idx" ON "ImportBatchItem"("deviceId");
CREATE INDEX "ImportBatchItem_deletedAt_idx" ON "ImportBatchItem"("deletedAt");

ALTER TABLE "ImportBatchItem"
  ADD CONSTRAINT "ImportBatchItem_batchId_fkey"
  FOREIGN KEY ("batchId") REFERENCES "ImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Device" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Device" ADD COLUMN "importBatchId" INTEGER;

CREATE INDEX "Device_deletedAt_idx" ON "Device"("deletedAt");
CREATE INDEX "Device_importBatchId_idx" ON "Device"("importBatchId");

ALTER TABLE "Device"
  ADD CONSTRAINT "Device_importBatchId_fkey"
  FOREIGN KEY ("importBatchId") REFERENCES "ImportBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ImportBatchItem"
  ADD CONSTRAINT "ImportBatchItem_deviceId_fkey"
  FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;
