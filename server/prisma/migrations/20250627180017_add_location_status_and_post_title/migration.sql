-- CreateEnum
CREATE TYPE "LocationStatus" AS ENUM ('UNVERIFIED', 'VERIFIED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "locations" ADD COLUMN     "status" "LocationStatus" NOT NULL DEFAULT 'UNVERIFIED';

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "title" TEXT;
