/*
  Warnings:

  - You are about to drop the column `gatewayCustomerId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `gatewayPaymentId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `gatewaySubscriptionId` on the `Subscription` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Subscription_userId_idx";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "gatewayCustomerId",
DROP COLUMN "gatewayPaymentId",
DROP COLUMN "gatewaySubscriptionId";

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "gatewayPaymentId" TEXT NOT NULL,
    "amountInCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "pixCode" TEXT,
    "pixQrCodeBase64" TEXT,
    "expiresAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "subscriptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
