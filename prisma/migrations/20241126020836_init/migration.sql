-- CreateTable
CREATE TABLE "Earnings" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL,
    "estimatedEps" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Earnings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Earnings_reportDate_idx" ON "Earnings"("reportDate");
