/*
  Warnings:

  - You are about to drop the column `clientId` on the `factures` table. All the data in the column will be lost.
  - You are about to drop the column `fournisseurId` on the `factures` table. All the data in the column will be lost.
  - You are about to drop the `clients` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `fournisseurs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "factures" DROP CONSTRAINT "factures_clientId_fkey";

-- DropForeignKey
ALTER TABLE "factures" DROP CONSTRAINT "factures_fournisseurId_fkey";

-- AlterTable
ALTER TABLE "factures" DROP COLUMN "clientId",
DROP COLUMN "fournisseurId",
ADD COLUMN     "clientNom" TEXT,
ADD COLUMN     "fournisseurNom" TEXT;

-- DropTable
DROP TABLE "clients";

-- DropTable
DROP TABLE "fournisseurs";
