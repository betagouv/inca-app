/*
  Warnings:

  - You are about to drop the `_ContributorToProject` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_ContributorToProject" DROP CONSTRAINT "_ContributorToProject_A_fkey";

-- DropForeignKey
ALTER TABLE "_ContributorToProject" DROP CONSTRAINT "_ContributorToProject_B_fkey";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_ContributorToProject";

-- CreateTable
CREATE TABLE "ProjectsContributors" (
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contributorId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProjectsContributors_pkey" PRIMARY KEY ("contributorId","projectId")
);

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectsContributors" ADD CONSTRAINT "ProjectsContributors_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "Contributor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectsContributors" ADD CONSTRAINT "ProjectsContributors_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
