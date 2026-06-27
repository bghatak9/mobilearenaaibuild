-- Expand role hierarchy (SUPER_ADMIN > ADMIN > EDITOR > AUTHOR > MODERATOR > USER)
-- and add user administration + audit logging fields.

CREATE TYPE "UserRole_new" AS ENUM (
  'SUPER_ADMIN',
  'ADMIN',
  'EDITOR',
  'AUTHOR',
  'MODERATOR',
  'USER'
);

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING (
  CASE "role"::text
    WHEN 'WRITER' THEN 'AUTHOR'::"UserRole_new"
    ELSE "role"::text::"UserRole_new"
  END
);
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';

DROP TYPE "UserRole";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";

ALTER TABLE "User" ADD COLUMN "name" TEXT;
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "isBlocked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "avatar" TEXT;
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "User" ADD COLUMN "lastLogin" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "createdById" INTEGER;

CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_isBlocked_idx" ON "User"("isBlocked");

ALTER TABLE "User"
  ADD CONSTRAINT "User_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "AuditLog" (
  "id" SERIAL NOT NULL,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

ALTER TABLE "AuditLog"
  ADD CONSTRAINT "AuditLog_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
