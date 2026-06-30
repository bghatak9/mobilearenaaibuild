ALTER TABLE "AdEvent" ADD COLUMN IF NOT EXISTS "countryCode" TEXT;

CREATE INDEX IF NOT EXISTS "AdEvent_countryCode_idx" ON "AdEvent"("countryCode");
