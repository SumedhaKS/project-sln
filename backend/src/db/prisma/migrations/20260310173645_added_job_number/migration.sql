/*
  Warnings:

  - A unique constraint covering the columns `[jobNumber]` on the table `Job` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "jobNumber" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Job_jobNumber_key" ON "Job"("jobNumber");
