/*
  Warnings:

  - A unique constraint covering the columns `[synchronizationId]` on the table `Contributor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Contributor" ADD COLUMN     "synchronizationId" TEXT;

-- AlterTable
ALTER TABLE "Synchronization" ADD COLUMN     "info" TEXT,
ADD COLUMN     "success" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Contributor_synchronizationId_key" ON "Contributor"("synchronizationId");
