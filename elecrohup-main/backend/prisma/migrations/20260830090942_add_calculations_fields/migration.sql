/*
  Warnings:

  - Added the required column `designation` to the `facture_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "facture_items" ADD COLUMN     "designation" TEXT NOT NULL,
ADD COLUMN     "montantHT" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "montantTTC" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "montantTVA" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "tauxTVA" DOUBLE PRECISION NOT NULL DEFAULT 20;

-- AlterTable
ALTER TABLE "factures" ADD COLUMN     "montantHT" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "montantTVA" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "montantTTC" SET DEFAULT 0;
