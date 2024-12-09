/*
  Warnings:

  - The `status` column on the `Activity` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `image` on the `Category` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "status",
ADD COLUMN     "status" "ActivityStatus" NOT NULL DEFAULT 'upcoming';

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "image";

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");
