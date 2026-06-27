/*
  Warnings:

  - The primary key for the `Brand` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `logo` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Brand` table. All the data in the column will be lost.
  - The `id` column on the `Brand` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Category` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Category` table. All the data in the column will be lost.
  - The `id` column on the `Category` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Device` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `battery` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `bluetooth` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `buildMaterial` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `charging` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `chipset` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `colors` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `cpu` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `dimensions` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `displaySize` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `displayType` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `expandableStorage` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `faceUnlock` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `fingerprint` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `frontCamera` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `gps` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `gpu` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `headphoneJack` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `modelNumber` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `network` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `nfc` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `operatingSystem` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `protection` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `ram` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `rearCamera` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `refreshRate` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `releaseDate` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `resolution` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `reverseCharging` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `sim` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `speakers` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `storage` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `ui` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `usb` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `videoRecording` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `waterResistance` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `wifi` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `wirelessCharging` on the `Device` table. All the data in the column will be lost.
  - The `id` column on the `Device` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `price` on the `Device` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - The primary key for the `Manufacturer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `country` on the `Manufacturer` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Manufacturer` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Manufacturer` table. All the data in the column will be lost.
  - You are about to drop the column `logo` on the `Manufacturer` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Manufacturer` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Manufacturer` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `Manufacturer` table. All the data in the column will be lost.
  - The `id` column on the `Manufacturer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[name]` on the table `Device` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `manufacturerId` on the `Device` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `brandId` on the `Device` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `categoryId` on the `Device` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Device" DROP CONSTRAINT "Device_brandId_fkey";

-- DropForeignKey
ALTER TABLE "Device" DROP CONSTRAINT "Device_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Device" DROP CONSTRAINT "Device_manufacturerId_fkey";

-- DropIndex
DROP INDEX "Brand_name_key";

-- DropIndex
DROP INDEX "Brand_slug_key";

-- DropIndex
DROP INDEX "Category_name_key";

-- DropIndex
DROP INDEX "Category_slug_key";

-- DropIndex
DROP INDEX "Device_brandId_idx";

-- DropIndex
DROP INDEX "Device_categoryId_idx";

-- DropIndex
DROP INDEX "Device_manufacturerId_idx";

-- DropIndex
DROP INDEX "Device_name_idx";

-- DropIndex
DROP INDEX "Device_slug_key";

-- DropIndex
DROP INDEX "Device_status_idx";

-- DropIndex
DROP INDEX "Manufacturer_name_key";

-- DropIndex
DROP INDEX "Manufacturer_slug_key";

-- AlterTable
ALTER TABLE "Brand" DROP CONSTRAINT "Brand_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "logo",
DROP COLUMN "slug",
DROP COLUMN "updatedAt",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Brand_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Category" DROP CONSTRAINT "Category_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "slug",
DROP COLUMN "updatedAt",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Category_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Device" DROP CONSTRAINT "Device_pkey",
DROP COLUMN "battery",
DROP COLUMN "bluetooth",
DROP COLUMN "buildMaterial",
DROP COLUMN "charging",
DROP COLUMN "chipset",
DROP COLUMN "colors",
DROP COLUMN "cpu",
DROP COLUMN "createdAt",
DROP COLUMN "currency",
DROP COLUMN "dimensions",
DROP COLUMN "displaySize",
DROP COLUMN "displayType",
DROP COLUMN "expandableStorage",
DROP COLUMN "faceUnlock",
DROP COLUMN "fingerprint",
DROP COLUMN "frontCamera",
DROP COLUMN "gps",
DROP COLUMN "gpu",
DROP COLUMN "headphoneJack",
DROP COLUMN "image",
DROP COLUMN "modelNumber",
DROP COLUMN "network",
DROP COLUMN "nfc",
DROP COLUMN "operatingSystem",
DROP COLUMN "protection",
DROP COLUMN "ram",
DROP COLUMN "rearCamera",
DROP COLUMN "refreshRate",
DROP COLUMN "releaseDate",
DROP COLUMN "resolution",
DROP COLUMN "reverseCharging",
DROP COLUMN "sim",
DROP COLUMN "slug",
DROP COLUMN "speakers",
DROP COLUMN "status",
DROP COLUMN "storage",
DROP COLUMN "ui",
DROP COLUMN "updatedAt",
DROP COLUMN "usb",
DROP COLUMN "videoRecording",
DROP COLUMN "waterResistance",
DROP COLUMN "weight",
DROP COLUMN "wifi",
DROP COLUMN "wirelessCharging",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "manufacturerId",
ADD COLUMN     "manufacturerId" INTEGER NOT NULL,
DROP COLUMN "brandId",
ADD COLUMN     "brandId" INTEGER NOT NULL,
DROP COLUMN "categoryId",
ADD COLUMN     "categoryId" INTEGER NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION,
ADD CONSTRAINT "Device_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Manufacturer" DROP CONSTRAINT "Manufacturer_pkey",
DROP COLUMN "country",
DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "logo",
DROP COLUMN "slug",
DROP COLUMN "updatedAt",
DROP COLUMN "website",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Manufacturer_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Device_name_key" ON "Device"("name");

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
