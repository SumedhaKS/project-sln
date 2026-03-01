/*
  Warnings:

  - The values [in_progress] on the enum `jobStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `camera_brand` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `camera_model` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `customer_id` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `physical_condition` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `serial_number` on the `Job` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[jobID]` on the table `Job` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cameraBrand` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cameraModel` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobID` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serialNumber` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "jobStatus_new" AS ENUM ('pending', 'inProgress', 'ready', 'delivered', 'cancelled');
ALTER TABLE "Job" ALTER COLUMN "status" TYPE "jobStatus_new" USING ("status"::text::"jobStatus_new");
ALTER TYPE "jobStatus" RENAME TO "jobStatus_old";
ALTER TYPE "jobStatus_new" RENAME TO "jobStatus";
DROP TYPE "public"."jobStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_customer_id_fkey";

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "camera_brand",
DROP COLUMN "camera_model",
DROP COLUMN "customer_id",
DROP COLUMN "physical_condition",
DROP COLUMN "serial_number",
ADD COLUMN     "cameraBrand" TEXT NOT NULL,
ADD COLUMN     "cameraModel" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "customerId" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "jobID" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "physicalCondition" TEXT,
ADD COLUMN     "serialNumber" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Customer_name_idx" ON "Customer"("name");

-- CreateIndex
CREATE INDEX "Customer_phNo_idx" ON "Customer"("phNo");

-- CreateIndex
CREATE UNIQUE INDEX "Job_jobID_key" ON "Job"("jobID");

-- CreateIndex
CREATE INDEX "Job_customerId_idx" ON "Job"("customerId");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
