-- CreateTable
CREATE TABLE "DeviceIntelligence" (
    "id" SERIAL NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceIntelligence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceIntelligence_deviceId_key" ON "DeviceIntelligence"("deviceId");

-- AddForeignKey
ALTER TABLE "DeviceIntelligence" ADD CONSTRAINT "DeviceIntelligence_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
