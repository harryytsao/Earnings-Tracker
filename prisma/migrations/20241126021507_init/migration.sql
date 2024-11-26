/*
  Warnings:

  - Added the required column `time` to the `Earnings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Earnings" ADD COLUMN     "fiscalQuarterEnding" TEXT,
ADD COLUMN     "lastYearEps" DOUBLE PRECISION,
ADD COLUMN     "lastYearReportDate" TIMESTAMP(3),
ADD COLUMN     "marketCap" DOUBLE PRECISION,
ADD COLUMN     "numberOfEstimates" INTEGER,
ADD COLUMN     "time" TEXT NOT NULL;
