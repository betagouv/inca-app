/*
  Warnings:

  - You are about to drop the `ProjectsContributors` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProjectsContributors" DROP CONSTRAINT "ProjectsContributors_contributorId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectsContributors" DROP CONSTRAINT "ProjectsContributors_projectId_fkey";

-- DropTable
DROP TABLE "ProjectsContributors";

-- CreateTable
CREATE TABLE "ContributorsOnProjects" (
    "state" "ProjectContributorState" NOT NULL DEFAULT E'ASSIGNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contributorId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ContributorsOnProjects_pkey" PRIMARY KEY ("contributorId","projectId")
);

-- AddForeignKey
ALTER TABLE "ContributorsOnProjects" ADD CONSTRAINT "ContributorsOnProjects_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "Contributor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributorsOnProjects" ADD CONSTRAINT "ContributorsOnProjects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
