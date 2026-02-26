-- CreateEnum
CREATE TYPE "jobStatus" AS ENUM ('pending', 'in_progress', 'ready', 'delivered', 'cancelled');

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phNo" TEXT NOT NULL,
    "address" TEXT,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "camera_brand" TEXT NOT NULL,
    "camera_model" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "accessories" TEXT,
    "physical_condition" TEXT,
    "status" "jobStatus" NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
