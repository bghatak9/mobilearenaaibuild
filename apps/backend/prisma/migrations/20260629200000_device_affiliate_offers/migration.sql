CREATE TABLE "DeviceAffiliateOffer" (
    "id" SERIAL NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "partner" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "affiliateUrl" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceAffiliateOffer_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DeviceAffiliateOffer_deviceId_idx" ON "DeviceAffiliateOffer"("deviceId");
CREATE INDEX "DeviceAffiliateOffer_currency_idx" ON "DeviceAffiliateOffer"("currency");
CREATE INDEX "DeviceAffiliateOffer_active_idx" ON "DeviceAffiliateOffer"("active");

ALTER TABLE "DeviceAffiliateOffer" ADD CONSTRAINT "DeviceAffiliateOffer_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "DeviceAffiliateOffer" ("deviceId", "partner", "price", "currency", "affiliateUrl", "active", "priority", "updatedAt")
SELECT
    d."id",
    'Amazon',
    ROUND(COALESCE(d."price", 0) * 0.98),
    'USD',
    'https://www.amazon.com/s?k=' || REPLACE(LOWER(d."slug"), ' ', '+'),
    true,
    10,
    CURRENT_TIMESTAMP
FROM "Device" d
WHERE d."price" IS NOT NULL AND d."deletedAt" IS NULL;

INSERT INTO "DeviceAffiliateOffer" ("deviceId", "partner", "price", "currency", "affiliateUrl", "active", "priority", "updatedAt")
SELECT
    d."id",
    'Flipkart',
    COALESCE(ca."price", ROUND(d."price" * 83)),
    'INR',
    'https://www.flipkart.com/search?q=' || REPLACE(LOWER(d."name"), ' ', '+'),
    true,
    10,
    CURRENT_TIMESTAMP
FROM "Device" d
LEFT JOIN "DeviceCountryAvailability" ca ON ca."deviceId" = d."id" AND ca."countryCode" = 'IN'
WHERE d."price" IS NOT NULL AND d."deletedAt" IS NULL;

INSERT INTO "DeviceAffiliateOffer" ("deviceId", "partner", "price", "currency", "affiliateUrl", "active", "priority", "updatedAt")
SELECT
    d."id",
    'Amazon India',
    ROUND(COALESCE(ca."price", ROUND(d."price" * 83)) * 0.97),
    'INR',
    'https://www.amazon.in/s?k=' || REPLACE(LOWER(d."slug"), ' ', '+'),
    true,
    8,
    CURRENT_TIMESTAMP
FROM "Device" d
LEFT JOIN "DeviceCountryAvailability" ca ON ca."deviceId" = d."id" AND ca."countryCode" = 'IN'
WHERE d."price" IS NOT NULL AND d."deletedAt" IS NULL;
