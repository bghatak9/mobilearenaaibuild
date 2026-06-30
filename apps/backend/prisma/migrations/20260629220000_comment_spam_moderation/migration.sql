-- Comment spam moderation fields
CREATE TYPE "CommentStatus" AS ENUM (
  'PUBLISHED',
  'PENDING_REVIEW',
  'SPAM',
  'REMOVED',
  'APPROVED',
  'HIDDEN'
);

ALTER TABLE "User" ADD COLUMN "commentRestrictedUntil" TIMESTAMP(3);

ALTER TABLE "Comment" ADD COLUMN "status" "CommentStatus" NOT NULL DEFAULT 'PUBLISHED';
ALTER TABLE "Comment" ADD COLUMN "spamScore" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Comment" ADD COLUMN "spamReason" TEXT;
ALTER TABLE "Comment" ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Comment" ADD COLUMN "moderatedById" INTEGER;
ALTER TABLE "Comment" ADD COLUMN "moderatedAt" TIMESTAMP(3);
ALTER TABLE "Comment" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Comment"
  ADD CONSTRAINT "Comment_moderatedById_fkey"
  FOREIGN KEY ("moderatedById") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Comment_status_idx" ON "Comment"("status");
CREATE INDEX "Comment_spamScore_idx" ON "Comment"("spamScore");
CREATE INDEX "Comment_createdAt_idx" ON "Comment"("createdAt");
