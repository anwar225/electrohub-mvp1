-- Fix missing montantTotal column in facture_items table
-- This migration is specifically for the facture_items.montantTotal column

-- Add montantTotal column to facture_items table
ALTER TABLE facture_items ADD COLUMN IF NOT EXISTS "montantTotal" FLOAT DEFAULT 0;

-- Update existing facture_items to have montantTotal (default to 0)
UPDATE facture_items SET "montantTotal" = 0 WHERE "montantTotal" IS NULL;