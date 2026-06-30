ALTER TABLE "News" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "News" ADD COLUMN "importBatchId" INTEGER;

CREATE INDEX "News_deletedAt_idx" ON "News"("deletedAt");
CREATE INDEX "News_importBatchId_idx" ON "News"("importBatchId");

ALTER TABLE "News"
  ADD CONSTRAINT "News_importBatchId_fkey"
  FOREIGN KEY ("importBatchId") REFERENCES "ImportBatch"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ImportBatchItem" ADD COLUMN "newsId" INTEGER;

CREATE INDEX "ImportBatchItem_newsId_idx" ON "ImportBatchItem"("newsId");

ALTER TABLE "ImportBatchItem"
  ADD CONSTRAINT "ImportBatchItem_newsId_fkey"
  FOREIGN KEY ("newsId") REFERENCES "News"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
