/*
  Warnings:

  - A unique constraint covering the columns `[pipedriveId]` on the table `Contributor` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Contributor_pipedriveId_key" ON "Contributor"("pipedriveId");
