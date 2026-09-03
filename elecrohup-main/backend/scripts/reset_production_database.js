/**
 * Script pour supprimer TOUTES les données de la base de données PRODUCTION (Railway)
 * ATTENTION: Opération irréversible
 */
const { PrismaClient } = require('@prisma/client');

// Utiliser l'URL de base de données Railway depuis les variables d'environnement
const railwayDatabaseUrl = process.env.RAILWAY_DATABASE_URL || process.env.DATABASE_URL;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: railwayDatabaseUrl
    }
  }
});

async function resetProductionDatabase() {
  console.log('⚠️  ATTENTION: Suppression de TOUTES les données de la base de données PRODUCTION...');
  console.log('⚠️  Cette opération est irréversible');
  console.log('🌐 Base de données cible:', railwayDatabaseUrl ? 'Railway Production' : 'Local');

  try {
    // Désactiver les contraintes de clés étrangères
    await prisma.$executeRaw`SET CONSTRAINTS ALL DEFERRED`;

    // Vider toutes les tables dans l'ordre correct
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

    console.log('✅ Base de données PRODUCTION réinitialisée avec succès');
    console.log('✅ Toutes les données ont été supprimées');

  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetProductionDatabase()
  .then(() => {
    console.log('✅ Opération terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
