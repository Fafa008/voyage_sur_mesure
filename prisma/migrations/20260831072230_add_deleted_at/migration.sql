/*
  Warnings:

  - The values [STRIPE,PAYPAL,MOBILE_MONEY] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('PAPI', 'BINANCE_PAY', 'BANK_TRANSFER');
ALTER TABLE "PaymentTransaction" ALTER COLUMN "method" TYPE "PaymentMethod_new" USING ("method"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Devis" DROP CONSTRAINT "Devis_circuitId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentLog" DROP CONSTRAINT "PaymentLog_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_devisId_fkey";

-- AlterTable
ALTER TABLE "Circuit" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Devis" ADD COLUMN     "conseillerId" TEXT,
ADD COLUMN     "dateDebutConfirmee" TIMESTAMP(3),
ADD COLUMN     "dateFinConfirmee" TIMESTAMP(3),
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "detailsCalcul" JSONB;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'MGA';

-- AlterTable
ALTER TABLE "PaymentTransaction" ADD COLUMN     "notificationToken" TEXT,
ADD COLUMN     "providerPaymentMethod" TEXT,
ALTER COLUMN "currency" SET DEFAULT 'MGA';

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "PaymentTransaction_reservationId_idx" ON "PaymentTransaction"("reservationId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_providerRef_idx" ON "PaymentTransaction"("providerRef");

-- CreateIndex
CREATE INDEX "PaymentTransaction_status_idx" ON "PaymentTransaction"("status");

-- CreateIndex
CREATE INDEX "PaymentTransaction_userId_idx" ON "PaymentTransaction"("userId");

-- AddForeignKey
ALTER TABLE "Devis" ADD CONSTRAINT "Devis_conseillerId_fkey" FOREIGN KEY ("conseillerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Devis" ADD CONSTRAINT "Devis_circuitId_fkey" FOREIGN KEY ("circuitId") REFERENCES "Circuit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_devisId_fkey" FOREIGN KEY ("devisId") REFERENCES "Devis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentLog" ADD CONSTRAINT "PaymentLog_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "PaymentTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
