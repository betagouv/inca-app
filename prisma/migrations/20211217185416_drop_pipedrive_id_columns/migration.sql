/*
  Warnings:

  - You are about to drop the column `pipedriveId` on the `Contributor` table. All the data in the column will be lost.
  - You are about to drop the column `pipedriveId` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `pipedriveId` on the `Organization` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contributor" DROP COLUMN "pipedriveId";

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "pipedriveId";

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "pipedriveId";
