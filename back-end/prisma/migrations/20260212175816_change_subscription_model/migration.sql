/*
  Warnings:

  - You are about to drop the column `subscriptionId` on the `MonthlyCycle` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'PENDING';

-- DropForeignKey
ALTER TABLE "MonthlyCycle" DROP CONSTRAINT "MonthlyCycle_subscriptionId_fkey";

-- AlterTable
ALTER TABLE "MonthlyCycle" DROP COLUMN "subscriptionId";

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "gatewayCustomerId" TEXT,
ADD COLUMN     "gatewayPaymentId" TEXT,
ADD COLUMN     "gatewaySubscriptionId" TEXT,
ALTER COLUMN "startDate" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';
