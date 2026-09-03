-- Sync production schema with Prisma schema
-- Add missing columns to sync with current codebase

-- Add montantTotal column to factures table if it doesn't exist
ALTER TABLE factures ADD COLUMN IF NOT EXISTS "montantTotal" FLOAT DEFAULT 0;

-- Add montantTotal column to facture_items table if it doesn't exist
ALTER TABLE facture_items ADD COLUMN IF NOT EXISTS "montantTotal" FLOAT DEFAULT 0;

-- Add userId column to produits table if it doesn't exist
ALTER TABLE produits ADD COLUMN IF NOT EXISTS "userId" INTEGER;

-- Add stockActuel column to produits table if it doesn't exist
ALTER TABLE produits ADD COLUMN IF NOT EXISTS "stockActuel" INTEGER DEFAULT 0;

-- Update existing products to have userId (assign to user 1 as default)
UPDATE produits SET "userId" = 1 WHERE "userId" IS NULL;

-- Update existing products to have stockActuel (default to 0)
UPDATE produits SET "stockActuel" = 0 WHERE "stockActuel" IS NULL;

-- Update existing factures to have montantTotal (default to 0)
UPDATE factures SET "montantTotal" = 0 WHERE "montantTotal" IS NULL;

-- Update existing facture_items to have montantTotal (default to 0)
UPDATE facture_items SET "montantTotal" = 0 WHERE "montantTotal" IS NULL;