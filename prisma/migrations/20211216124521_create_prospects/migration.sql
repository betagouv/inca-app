-- CreateEnum
CREATE TYPE "ProspectState" AS ENUM ('ADDED', 'CONTACTED', 'REFUSED', 'REGISTERED');

-- CreateTable
CREATE TABLE "ContactCategory" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prospect" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "position" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "note" TEXT,
    "state" "ProspectState" NOT NULL DEFAULT E'ADDED',
    "organisation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contactCategoryId" TEXT NOT NULL,

    CONSTRAINT "Prospect_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContactCategory_label_key" ON "ContactCategory"("label");

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_contactCategoryId_fkey" FOREIGN KEY ("contactCategoryId") REFERENCES "ContactCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
