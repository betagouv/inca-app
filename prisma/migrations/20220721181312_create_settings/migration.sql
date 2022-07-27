-- CreateEnum
CREATE TYPE "SettingKey" AS ENUM ('TELL_ME_CONTRIBUTOR_SURVEY_ID', 'TELL_ME_LEAD_SURVEY_ID', 'TELL_ME_PAT', 'TELL_ME_URL');

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "key" "SettingKey" NOT NULL,
    "description" TEXT,
    "value" TEXT NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");
