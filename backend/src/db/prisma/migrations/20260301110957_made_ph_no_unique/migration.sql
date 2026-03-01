/*
  Warnings:

  - A unique constraint covering the columns `[phNo]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Customer_phNo_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phNo_key" ON "Customer"("phNo");
