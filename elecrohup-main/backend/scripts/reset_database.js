/**
 * Script pour supprimer TOUTES les données de la base de données
 * ATTENTION: Opération irréversible
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('⚠️  ATTENTION: Suppression de TOUTES les données de la base de données...');
  console.log('⚠️  Cette opération est irréversible');

  try {
    // Désactiver les contraintes de clés étrangères
    await prisma.$executeRaw`SET CONSTRAINTS ALL DEFERRED`;

    // Vider toutes les tables dans l'ordre correct (selon le schema.prisma actuel)
    console.log('🗑️  Suppression des stock_movements...');
    await prisma.$executeRaw`TRUNCATE TABLE "stock_movements" CASCADE`;

    console.log('🗑️  Suppression des facture_items...');
    await prisma.$executeRaw`TRUNCATE TABLE "facture_items" CASCADE`;

    console.log('🗑️  Suppression des factures...');
    await prisma.$executeRaw`TRUNCATE TABLE "factures" CASCADE`;

    console.log('🗑️  Suppression des produits...');
    await prisma.$executeRaw`TRUNCATE TABLE "produits" CASCADE`;

    console.log('🗑️  Suppression des utilisateurs...');
    await prisma.$executeRaw`TRUNCATE TABLE "users" CASCADE`;

    // Réinitialiser les séquences d'auto-increment
    console.log('🔄 Réinitialisation des séquences...');
    await prisma.$executeRaw`ALTER SEQUENCE "stock_movements_id_seq" RESTART WITH 1`;
    await prisma.$executeRaw`ALTER SEQUENCE "facture_items_id_seq" RESTART WITH 1`;
    await prisma.$executeRaw`ALTER SEQUENCE "factures_id_seq" RESTART WITH 1`;
    await prisma.$executeRaw`ALTER SEQUENCE "produits_id_seq" RESTART WITH 1`;
    await prisma.$executeRaw`ALTER SEQUENCE "users_id_seq" RESTART WITH 1`;

    // Réactiver les contraintes
    await prisma.$executeRaw`SET CONSTRAINTS ALL IMMEDIATE`;

    console.log('✅ Base de données réinitialisée avec succès');
    console.log('✅ Toutes les données ont été supprimées');

  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase()
  .then(() => {
    console.log('✅ Opération terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
