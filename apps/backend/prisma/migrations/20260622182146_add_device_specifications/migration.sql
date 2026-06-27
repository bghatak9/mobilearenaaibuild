-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "battery" TEXT,
ADD COLUMN     "bluetooth" TEXT,
ADD COLUMN     "buildMaterial" TEXT,
ADD COLUMN     "charging" TEXT,
ADD COLUMN     "chipset" TEXT,
ADD COLUMN     "colors" TEXT,
ADD COLUMN     "cpu" TEXT,
ADD COLUMN     "currency" TEXT DEFAULT 'USD',
ADD COLUMN     "dimensions" TEXT,
ADD COLUMN     "displaySize" TEXT,
ADD COLUMN     "displayType" TEXT,
ADD COLUMN     "expandableStorage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "faceUnlock" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fingerprint" TEXT,
ADD COLUMN     "frontCamera" TEXT,
ADD COLUMN     "gps" TEXT,
ADD COLUMN     "gpu" TEXT,
ADD COLUMN     "headphoneJack" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "network" TEXT,
ADD COLUMN     "nfc" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "operatingSystem" TEXT,
ADD COLUMN     "price" DECIMAL(10,2),
ADD COLUMN     "protection" TEXT,
ADD COLUMN     "ram" TEXT,
ADD COLUMN     "rearCamera" TEXT,
ADD COLUMN     "refreshRate" INTEGER,
ADD COLUMN     "resolution" TEXT,
ADD COLUMN     "reverseCharging" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sim" TEXT,
ADD COLUMN     "speakers" TEXT,
ADD COLUMN     "storage" TEXT,
ADD COLUMN     "ui" TEXT,
ADD COLUMN     "usb" TEXT,
ADD COLUMN     "videoRecording" TEXT,
ADD COLUMN     "waterResistance" TEXT,
ADD COLUMN     "weight" TEXT,
ADD COLUMN     "wifi" TEXT,
ADD COLUMN     "wirelessCharging" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Device_brandId_idx" ON "Device"("brandId");

-- CreateIndex
CREATE INDEX "Device_categoryId_idx" ON "Device"("categoryId");

-- CreateIndex
CREATE INDEX "Device_manufacturerId_idx" ON "Device"("manufacturerId");

-- CreateIndex
CREATE INDEX "Device_name_idx" ON "Device"("name");

-- CreateIndex
CREATE INDEX "Device_status_idx" ON "Device"("status");
