-- CreateEnum
CREATE TYPE "PollType" AS ENUM ('DEVICE', 'WEEKLY', 'COMPARISON');

-- AlterTable
ALTER TABLE "Poll" ADD COLUMN IF NOT EXISTS "pollType" "PollType" NOT NULL DEFAULT 'DEVICE';

CREATE INDEX IF NOT EXISTS "Poll_pollType_idx" ON "Poll"("pollType");
CREATE INDEX IF NOT EXISTS "Poll_active_idx" ON "Poll"("active");

-- CreateTable
CREATE TABLE IF NOT EXISTS "CommunityReview" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "overallStars" INTEGER NOT NULL,
    "categoryScores" JSONB NOT NULL,
    "body" TEXT NOT NULL,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "verifiedOwner" BOOLEAN NOT NULL DEFAULT false,
    "photoUrls" JSONB NOT NULL DEFAULT '[]',
    "videoUrls" JSONB NOT NULL DEFAULT '[]',
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityReview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CommunityReviewHelpful" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "reviewId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityReviewHelpful_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CommunityReview_deviceId_idx" ON "CommunityReview"("deviceId");
CREATE INDEX IF NOT EXISTS "CommunityReview_userId_idx" ON "CommunityReview"("userId");
CREATE INDEX IF NOT EXISTS "CommunityReview_helpfulCount_idx" ON "CommunityReview"("helpfulCount");
CREATE INDEX IF NOT EXISTS "CommunityReview_parentId_idx" ON "CommunityReview"("parentId");

CREATE UNIQUE INDEX IF NOT EXISTS "CommunityReviewHelpful_userId_reviewId_key" ON "CommunityReviewHelpful"("userId", "reviewId");
CREATE INDEX IF NOT EXISTS "CommunityReviewHelpful_reviewId_idx" ON "CommunityReviewHelpful"("reviewId");

ALTER TABLE "CommunityReview" ADD CONSTRAINT "CommunityReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityReview" ADD CONSTRAINT "CommunityReview_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityReview" ADD CONSTRAINT "CommunityReview_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CommunityReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CommunityReviewHelpful" ADD CONSTRAINT "CommunityReviewHelpful_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityReviewHelpful" ADD CONSTRAINT "CommunityReviewHelpful_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "CommunityReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
