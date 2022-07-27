/*
  Warnings:

  - You are about to drop the column `info` on the `Synchronization` table. All the data in the column will be lost.
  - You are about to drop the column `success` on the `Synchronization` table. All the data in the column will be lost.
  - Added the required column `isSuccessful` to the `Synchronization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastContributorSurveyEntryId` to the `Synchronization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastLeadSurveyEntryId` to the `Synchronization` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Synchronization" DROP COLUMN "info",
DROP COLUMN "success",
ADD COLUMN     "isSuccessful" BOOLEAN NOT NULL,
ADD COLUMN     "lastContributorSurveyEntryId" TEXT NOT NULL,
ADD COLUMN     "lastLeadSurveyEntryId" TEXT NOT NULL,
ADD COLUMN     "logs" TEXT[];
