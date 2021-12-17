-- AlterTable
ALTER TABLE "Contributor" ADD COLUMN     "contactCategoryId" TEXT;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "contactCategoryId" TEXT;

-- AddForeignKey
ALTER TABLE "Contributor" ADD CONSTRAINT "Contributor_contactCategoryId_fkey" FOREIGN KEY ("contactCategoryId") REFERENCES "ContactCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_contactCategoryId_fkey" FOREIGN KEY ("contactCategoryId") REFERENCES "ContactCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
