-- CreateEnum
CREATE TYPE "OrderPaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- AlterTable
ALTER TABLE "marketplace_orders" ADD COLUMN "payment_status" "OrderPaymentStatus" NOT NULL DEFAULT 'PENDING';
