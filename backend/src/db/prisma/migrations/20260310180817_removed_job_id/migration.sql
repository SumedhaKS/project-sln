/*
  Warnings:

  - You are about to drop the column `jobID` on the `Job` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Job_jobID_key";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "jobID";
