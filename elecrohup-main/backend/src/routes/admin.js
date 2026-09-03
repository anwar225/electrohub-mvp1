const express = require('express');
const prisma = require('../utils/prisma');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/admin/reset-database
 * Réinitialise la base de données (supprime toutes les données)
 * ATTENTION: Opération irréversible - Endpoint temporaire pour administration
 */
router.post('/reset-database', verifyToken, async (req, res) => {
  try {
    console.log('⚠️  ADMIN: Réinitialisation de la base de données demandée par utilisateur:', req.user.email);

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

    console.log('✅ Base de données réinitialisée avec succès');

    res.json({
      success: true,
      message: 'Base de données réinitialisée avec succès - Toutes les données supprimées'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la réinitialisation de la base de données',
      details: error.message
    });
  }
});

module.exports = router;
