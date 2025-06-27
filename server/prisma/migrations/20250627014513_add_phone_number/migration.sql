/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `owners` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phoneNumber]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "owners" ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phoneNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "owners_phoneNumber_key" ON "owners"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "users"("phoneNumber");
