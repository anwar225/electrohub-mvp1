-- Sync production schema with Prisma schema
-- Add missing columns to sync with current codebase

-- Add montantTotal column to factures table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'factures' AND column_name = 'montantTotal'
    ) THEN
        ALTER TABLE factures ADD COLUMN "montantTotal" FLOAT DEFAULT 0;
    END IF;
END $$;

-- Add montantTotal column to facture_items table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'facture_items' AND column_name = 'montantTotal'
    ) THEN
        ALTER TABLE facture_items ADD COLUMN "montantTotal" FLOAT DEFAULT 0;
    END IF;
END $$;

-- Add userId column to produits table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'produits' AND column_name = 'userId'
    ) THEN
        ALTER TABLE produits ADD COLUMN "userId" INTEGER;
    END IF;
END $$;

-- Add stockActuel column to produits table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'produits' AND column_name = 'stockActuel'
    ) THEN
        ALTER TABLE produits ADD COLUMN "stockActuel" INTEGER DEFAULT 0;
    END IF;
END $$;

-- Update existing products to have userId (assign to user 1 as default)
UPDATE produits SET "userId" = 1 WHERE "userId" IS NULL;

-- Update existing products to have stockActuel (default to 0)
UPDATE produits SET "stockActuel" = 0 WHERE "stockActuel" IS NULL;

-- Update existing factures to have montantTotal (default to 0)
UPDATE factures SET "montantTotal" = 0 WHERE "montantTotal" IS NULL;

-- Update existing facture_items to have montantTotal (default to 0)
UPDATE facture_items SET "montantTotal" = 0 WHERE "montantTotal" IS NULL;