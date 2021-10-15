/*
  Warnings:

  - You are about to drop the column `isConfirmed` on the `ProjectsContributors` table. All the data in the column will be lost.
  - Added the required column `state` to the `ProjectsContributors` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProjectContributorState" AS ENUM ('ASSIGNED', 'CONTACTED', 'REFUSED', 'VALIDATED');

-- AlterTable
ALTER TABLE "ProjectsContributors" DROP COLUMN "isConfirmed",
ADD COLUMN     "state" "ProjectContributorState" NOT NULL;
