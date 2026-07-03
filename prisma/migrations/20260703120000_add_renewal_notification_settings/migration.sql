-- CreateEnum
CREATE TYPE "NotifyLeadDays" AS ENUM ('THREE_DAYS', 'FIVE_DAYS', 'SEVEN_DAYS');

-- CreateEnum
CREATE TYPE "NotifyChannel" AS ENUM ('EMAIL', 'SMS');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "avatarId" INTEGER,
ADD COLUMN     "notifyLeadDays" "NotifyLeadDays" NOT NULL DEFAULT 'FIVE_DAYS',
ADD COLUMN     "notifyChannel" "NotifyChannel" NOT NULL DEFAULT 'EMAIL',
ADD COLUMN     "notifyDeliveryPaused" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "RenewalNotificationLog" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "renewalDate" DATE NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RenewalNotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RenewalNotificationLog_subscriptionId_idx" ON "RenewalNotificationLog"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "RenewalNotificationLog_subscriptionId_renewalDate_key" ON "RenewalNotificationLog"("subscriptionId", "renewalDate");

-- AddForeignKey
ALTER TABLE "RenewalNotificationLog" ADD CONSTRAINT "RenewalNotificationLog_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
