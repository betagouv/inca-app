/*
  Warnings:

  - A unique constraint covering the columns `[pipedriveId]` on the table `Contributor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pipedriveId]` on the table `Lead` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pipedriveId]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Contributor_pipedriveId_key" ON "Contributor"("pipedriveId");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_pipedriveId_key" ON "Lead"("pipedriveId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_pipedriveId_key" ON "Organization"("pipedriveId");
