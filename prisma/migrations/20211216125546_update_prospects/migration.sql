/*
  Warnings:

  - You are about to drop the column `organisation` on the `Prospect` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Prospect" DROP COLUMN "organisation",
ADD COLUMN     "organization" TEXT;
