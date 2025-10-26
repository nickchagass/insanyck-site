-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippedAt" TIMESTAMP(3),
ADD COLUMN     "trackingCode" VARCHAR(64);
