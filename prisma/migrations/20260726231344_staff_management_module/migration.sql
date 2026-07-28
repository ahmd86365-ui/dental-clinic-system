-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StaffRole" ADD VALUE 'ASSISTANT';
ALTER TYPE "StaffRole" ADD VALUE 'HYGIENIST';
ALTER TYPE "StaffRole" ADD VALUE 'ACCOUNTANT';
ALTER TYPE "StaffRole" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "hireDate" TIMESTAMP(3),
ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "notes" TEXT;
