-- Paid advertisements for bulk import (CSV, XLSX, PDF)

CREATE TABLE "PaidAdvertisement" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "imageUrl" TEXT,
    "placement" TEXT NOT NULL DEFAULT 'homepage-banner',
    "advertiser" TEXT,
    "budget" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaidAdvertisement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PaidAdvertisement_slug_key" ON "PaidAdvertisement"("slug");
CREATE INDEX "PaidAdvertisement_active_idx" ON "PaidAdvertisement"("active");
CREATE INDEX "PaidAdvertisement_placement_idx" ON "PaidAdvertisement"("placement");
