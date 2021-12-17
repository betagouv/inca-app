-- DropIndex
DROP INDEX "Contributor_pipedriveId_key";

-- DropIndex
DROP INDEX "Lead_pipedriveId_key";

-- DropIndex
DROP INDEX "Organization_pipedriveId_key";

-- AlterTable
ALTER TABLE "Contributor" ALTER COLUMN "pipedriveId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Lead" ALTER COLUMN "pipedriveId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Organization" ALTER COLUMN "pipedriveId" DROP NOT NULL;
