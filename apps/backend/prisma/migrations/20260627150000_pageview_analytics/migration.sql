CREATE TABLE "PageView" (
  "id" SERIAL NOT NULL,
  "visitorId" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "referrer" TEXT,
  "country" TEXT,
  "city" TEXT,
  "device" TEXT,
  "os" TEXT,
  "browser" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");
CREATE INDEX "PageView_path_idx" ON "PageView"("path");
CREATE INDEX "PageView_country_idx" ON "PageView"("country");
CREATE INDEX "PageView_city_idx" ON "PageView"("city");
CREATE INDEX "PageView_visitorId_idx" ON "PageView"("visitorId");
