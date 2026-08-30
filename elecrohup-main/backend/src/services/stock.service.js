const prisma = require('../utils/prisma');

async function recordMovement({ produitId, type, quantite, factureId = null }) {
  return prisma.stockMovement.create({
    data: { produitId, type, quantite, factureId },
  });
}

async function adjustStock({ produitId, quantite, type }) {
  const qty = parseInt(quantite, 10);
  if (!produitId || !qty || !['in', 'out'].includes(type)) {
    const error = new Error('Invalid stock adjustment');
    error.status = 400;
    throw error;
  }

  const produit = await prisma.produit.update({
    where: { id: produitId },
    data: {
      stockActuel: { increment: type === 'in' ? qty : -qty },
    },
  });

  await recordMovement({ produitId, type, quantite: qty });
  return produit;
}

module.exports = { recordMovement, adjustStock };
