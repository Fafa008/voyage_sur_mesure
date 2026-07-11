/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Circuit` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Circuit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Circuit" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Circuit_slug_key" ON "Circuit"("slug");
