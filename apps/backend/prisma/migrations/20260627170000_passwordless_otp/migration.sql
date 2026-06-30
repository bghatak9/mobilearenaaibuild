-- Drop password columns — passwordless OTP auth only
ALTER TABLE "User" DROP COLUMN IF EXISTS "passwordHash";
ALTER TABLE "User" DROP COLUMN IF EXISTS "mustChangePassword";
