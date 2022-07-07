/*
  Warnings:

  - A unique constraint covering the columns `[synchronizationId]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "synchronizationId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Project_synchronizationId_key" ON "Project"("synchronizationId");
