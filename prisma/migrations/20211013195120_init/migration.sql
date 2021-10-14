/*
  Warnings:

  - You are about to drop the column `seats` on the `Project` table. All the data in the column will be lost.
  - Added the required column `description` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `need` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `note` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Made the column `leadId` on table `Project` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_leadId_fkey";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "seats",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "need" TEXT NOT NULL,
ADD COLUMN     "note" TEXT NOT NULL,
ALTER COLUMN "leadId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
