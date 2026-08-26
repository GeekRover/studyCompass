-- CreateEnum
CREATE TYPE "VisaCategory" AS ENUM ('REQUIRED_DOCUMENTS', 'FINANCIAL_PROOF', 'EMBASSY_INFO', 'PROCESSING_TIMELINE', 'VISA_FEES', 'COMMON_MISTAKES');

-- CreateTable
CREATE TABLE "VisaGuide" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "category" "VisaCategory" NOT NULL,
    "headline" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "costUsd" DOUBLE PRECISION,
    "sourceLabel" TEXT,
    "sourceUrl" TEXT,
    "severity" INTEGER NOT NULL DEFAULT 3,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisaGuide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisaGuide_countryId_category_idx" ON "VisaGuide"("countryId", "category");

-- CreateIndex
CREATE INDEX "VisaGuide_isPublished_idx" ON "VisaGuide"("isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "VisaGuide_countryId_category_headline_key" ON "VisaGuide"("countryId", "category", "headline");

-- AddForeignKey
ALTER TABLE "VisaGuide" ADD CONSTRAINT "VisaGuide_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;
