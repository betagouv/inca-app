-- CreateTable
CREATE TABLE "Synchronization" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Synchronization_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Synchronization" ADD CONSTRAINT "Synchronization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
