const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanup() {
  console.log('Début du nettoyage des données...');
  
  try {
    // Supprimer d'abord les facture_items car ils dépendent des factures
    await prisma.factureItem.deleteMany({});
    console.log('✓ Facture items supprimés');
    
    // Supprimer les factures
    await prisma.facture.deleteMany({});
    console.log('✓ Factures supprimées');
    
    // Supprimer les mouvements de stock
    await prisma.stockMovement.deleteMany({});
    console.log('✓ Stock movements supprimés');
    
    // Garder les produits et utilisateurs
    console.log('✓ Produits et utilisateurs conservés');
    
    console.log('Nettoyage terminé avec succès !');
  } catch (error) {
    console.error('Erreur lors du nettoyage:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();