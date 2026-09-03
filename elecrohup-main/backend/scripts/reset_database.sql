-- ATTENTION: Ce script supprime TOUTES les données de la base de données
-- Opération irréversible - Exécutez uniquement si vous êtes certain

-- Désactiver les contraintes de clés étrangères
SET CONSTRAINTS ALL DEFERRED;

-- Vider toutes les tables dans l'ordre correct (tables enfants d'abord)
TRUNCATE TABLE "facture_items" CASCADE;
TRUNCATE TABLE "factures" CASCADE;
TRUNCATE TABLE "produits" CASCADE;
TRUNCATE TABLE "fournisseurs" CASCADE;
TRUNCATE TABLE "clients" CASCADE;
TRUNCATE TABLE "users" CASCADE;

-- Réinitialiser les séquences d'auto-increment
ALTER SEQUENCE "facture_items_id_seq" RESTART WITH 1;
ALTER SEQUENCE "factures_id_seq" RESTART WITH 1;
ALTER SEQUENCE "produits_id_seq" RESTART WITH 1;
ALTER SEQUENCE "fournisseurs_id_seq" RESTART WITH 1;
ALTER SEQUENCE "clients_id_seq" RESTART WITH 1;
ALTER SEQUENCE "users_id_seq" RESTART WITH 1;

-- Réactiver les contraintes
SET CONSTRAINTS ALL IMMEDIATE;

-- Confirmer
SELECT 'Base de données réinitialisée avec succès - Toutes les données supprimées' AS status;
