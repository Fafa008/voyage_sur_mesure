/*
  Warnings:

  - You are about to drop the column `utilisateurId` on the `Avis` table. All the data in the column will be lost.
  - You are about to drop the column `utilisateurId` on the `Devis` table. All the data in the column will be lost.
  - You are about to drop the column `utilisateurId` on the `Favori` table. All the data in the column will be lost.
  - You are about to drop the column `utilisateurId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `utilisateurId` on the `Paiement` table. All the data in the column will be lost.
  - You are about to drop the `Utilisateur` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,circuitId]` on the table `Favori` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[telephone]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Avis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Devis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Favori` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Paiement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Avis" DROP CONSTRAINT "Avis_utilisateurId_fkey";

-- DropForeignKey
ALTER TABLE "Devis" DROP CONSTRAINT "Devis_utilisateurId_fkey";

-- DropForeignKey
ALTER TABLE "Favori" DROP CONSTRAINT "Favori_utilisateurId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_utilisateurId_fkey";

-- DropForeignKey
ALTER TABLE "Paiement" DROP CONSTRAINT "Paiement_utilisateurId_fkey";

-- DropForeignKey
ALTER TABLE "Utilisateur" DROP CONSTRAINT "Utilisateur_roleId_fkey";

-- DropIndex
DROP INDEX "Favori_utilisateurId_circuitId_key";

-- AlterTable
ALTER TABLE "Avis" DROP COLUMN "utilisateurId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Devis" DROP COLUMN "utilisateurId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Favori" DROP COLUMN "utilisateurId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "utilisateurId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Paiement" DROP COLUMN "utilisateurId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "dateInscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "prenom" TEXT,
ADD COLUMN     "roleId" INTEGER NOT NULL,
ADD COLUMN     "telephone" TEXT;

-- DropTable
DROP TABLE "Utilisateur";

-- CreateIndex
CREATE UNIQUE INDEX "Favori_userId_circuitId_key" ON "Favori"("userId", "circuitId");

-- CreateIndex
CREATE UNIQUE INDEX "user_telephone_key" ON "user"("telephone");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Devis" ADD CONSTRAINT "Devis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avis" ADD CONSTRAINT "Avis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favori" ADD CONSTRAINT "Favori_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
