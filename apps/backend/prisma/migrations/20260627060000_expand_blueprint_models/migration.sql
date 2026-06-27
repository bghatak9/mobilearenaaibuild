-- Expand schema to the MobileArena blueprint data model.
-- This migration is data-preserving: new required columns (slug, passwordHash,
-- updatedAt) are added nullable / with a temporary default, backfilled from
-- existing data, and only then made NOT NULL.

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'EDITOR', 'WRITER', 'USER');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED');

-- DropIndex
DROP INDEX "Device_name_key";

-- Helper: slugify expression used for backfills below
--   lower-case, non-alphanumerics -> '-', trimmed of leading/trailing '-'.

-- AlterTable: Brand (add slug as nullable, backfill, enforce)
ALTER TABLE "Brand" ADD COLUMN "logo" TEXT,
                    ADD COLUMN "slug" TEXT;
UPDATE "Brand" SET "slug" = trim(BOTH '-' FROM regexp_replace(lower("name"), '[^a-z0-9]+', '-', 'g'));
ALTER TABLE "Brand" ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable: Category
ALTER TABLE "Category" ADD COLUMN "description" TEXT,
                       ADD COLUMN "slug" TEXT;
UPDATE "Category" SET "slug" = trim(BOTH '-' FROM regexp_replace(lower("name"), '[^a-z0-9]+', '-', 'g'));
ALTER TABLE "Category" ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable: Manufacturer
ALTER TABLE "Manufacturer" ADD COLUMN "country" TEXT,
                           ADD COLUMN "description" TEXT,
                           ADD COLUMN "logo" TEXT,
                           ADD COLUMN "website" TEXT,
                           ADD COLUMN "slug" TEXT;
UPDATE "Manufacturer" SET "slug" = trim(BOTH '-' FROM regexp_replace(lower("name"), '[^a-z0-9]+', '-', 'g'));
ALTER TABLE "Manufacturer" ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable: Device (spec fields + slug + timestamps)
ALTER TABLE "Device" ADD COLUMN "announcedDate" TIMESTAMP(3),
                     ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                     ADD COLUMN "dimensions" TEXT,
                     ADD COLUMN "fingerprint" TEXT,
                     ADD COLUMN "fiveG" BOOLEAN,
                     ADD COLUMN "infrared" BOOLEAN,
                     ADD COLUMN "nfc" BOOLEAN,
                     ADD COLUMN "os" TEXT,
                     ADD COLUMN "rating" DOUBLE PRECISION,
                     ADD COLUMN "releasedDate" TIMESTAMP(3),
                     ADD COLUMN "waterproof" BOOLEAN,
                     ADD COLUMN "weight" DOUBLE PRECISION,
                     ADD COLUMN "slug" TEXT,
                     ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE "Device" SET "slug" = trim(BOTH '-' FROM regexp_replace(lower("name"), '[^a-z0-9]+', '-', 'g'));
ALTER TABLE "Device" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "Device" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable: User (password -> passwordHash, role -> enum, updatedAt)
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;
UPDATE "User" SET "passwordHash" = "password";
ALTER TABLE "User" ALTER COLUMN "passwordHash" SET NOT NULL;
ALTER TABLE "User" DROP COLUMN "password";

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING (upper("role")::"UserRole");
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';

ALTER TABLE "User" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Display" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "resolution" TEXT NOT NULL,
    "refreshRate" INTEGER NOT NULL,
    "brightness" INTEGER NOT NULL,
    "protection" TEXT,
    "deviceId" INTEGER NOT NULL,
    CONSTRAINT "Display_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Battery" (
    "id" SERIAL NOT NULL,
    "capacity" INTEGER NOT NULL,
    "charging" TEXT NOT NULL,
    "wireless" BOOLEAN NOT NULL DEFAULT false,
    "reverse" BOOLEAN NOT NULL DEFAULT false,
    "deviceId" INTEGER NOT NULL,
    CONSTRAINT "Battery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chipset" (
    "id" SERIAL NOT NULL,
    "cpu" TEXT NOT NULL,
    "gpu" TEXT NOT NULL,
    "fabrication" TEXT NOT NULL,
    "benchmark" INTEGER,
    "deviceId" INTEGER NOT NULL,
    CONSTRAINT "Chipset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Camera" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "megapixel" INTEGER NOT NULL,
    "aperture" TEXT,
    "opticalZoom" TEXT,
    "stabilization" BOOLEAN NOT NULL DEFAULT false,
    "deviceId" INTEGER NOT NULL,
    CONSTRAINT "Camera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail" TEXT,
    "type" TEXT NOT NULL,
    "deviceId" INTEGER NOT NULL,
    CONSTRAINT "DeviceImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "pros" JSONB NOT NULL,
    "cons" JSONB NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "News" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "thumbnail" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" SERIAL NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "userId" INTEGER NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "body" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Display_deviceId_key" ON "Display"("deviceId");
CREATE UNIQUE INDEX "Battery_deviceId_key" ON "Battery"("deviceId");
CREATE UNIQUE INDEX "Chipset_deviceId_key" ON "Chipset"("deviceId");
CREATE INDEX "Camera_deviceId_idx" ON "Camera"("deviceId");
CREATE INDEX "DeviceImage_deviceId_idx" ON "DeviceImage"("deviceId");
CREATE UNIQUE INDEX "Review_slug_key" ON "Review"("slug");
CREATE INDEX "Review_deviceId_idx" ON "Review"("deviceId");
CREATE UNIQUE INDEX "News_slug_key" ON "News"("slug");
CREATE INDEX "News_status_idx" ON "News"("status");
CREATE INDEX "News_featured_idx" ON "News"("featured");
CREATE INDEX "Rating_deviceId_idx" ON "Rating"("deviceId");
CREATE UNIQUE INDEX "Rating_userId_deviceId_key" ON "Rating"("userId", "deviceId");
CREATE INDEX "Comment_deviceId_idx" ON "Comment"("deviceId");
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE UNIQUE INDEX "Device_slug_key" ON "Device"("slug");
CREATE INDEX "Device_brandId_idx" ON "Device"("brandId");
CREATE INDEX "Device_categoryId_idx" ON "Device"("categoryId");
CREATE INDEX "Device_manufacturerId_idx" ON "Device"("manufacturerId");
CREATE UNIQUE INDEX "Manufacturer_slug_key" ON "Manufacturer"("slug");

-- AddForeignKey
ALTER TABLE "Display" ADD CONSTRAINT "Display_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Battery" ADD CONSTRAINT "Battery_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Chipset" ADD CONSTRAINT "Chipset_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Camera" ADD CONSTRAINT "Camera_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DeviceImage" ADD CONSTRAINT "DeviceImage_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
