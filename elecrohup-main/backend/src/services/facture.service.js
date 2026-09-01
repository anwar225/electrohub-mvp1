const prisma = require('../utils/prisma');
const { slugifyRef } = require('../utils/validators');

function calculerMontantsItem(quantite, prixUnitaire, tauxTVA, type = 'achat') {
  // Calcul simple sans TVA - juste quantité * prix unitaire
  const montantTotal = quantite * prixUnitaire;
  
  return {
    montantTotal: Number(montantTotal.toFixed(2)),
  };
}

function calculerTotauxFacture(items) {
  let total = 0;

  for (const item of items) {
    total += item.montantTotal || 0;
  }

  return {
    montantTotal: Number(total.toFixed(2)),
  };
}

function toDbStatus(status) {
  if (!status) return undefined;
  const map = {
    Draft: 'draft',
    'Validée': 'validated',
    'Archivée': 'archived',
    draft: 'draft',
    validated: 'validated',
    archived: 'archived',
  };
  return map[status] || status;
}

async function findOrCreateProduit(item) {
  // Si un produitId est fourni, utiliser le produit existant
  if (item.produitId) {
    const produit = await prisma.produit.findUnique({
      where: { id: Number(item.produitId) },
    });
    if (produit) return produit;
  }

  // Sinon, chercher ou créer par nom/désignation
  const nom = item.designation || item.nom || 'Produit';
  const prix = Number(item.prixUnitaire) || 0;

  let produit = await prisma.produit.findFirst({
    where: {
      OR: [{ nom: { equals: nom, mode: 'insensitive' } }, { reference: nom }],
    },
  });

  if (!produit) {
    produit = await prisma.produit.create({
      data: {
        nom,
        reference: slugifyRef(nom),
        categorie: item.categorie || 'Général',
        prixAchat: prix,
        prixVente: Number((prix * 1.3).toFixed(2)),
      },
    });
  }

  return produit;
}

async function uniqueNumero(preferred) {
  const base = preferred || `FAC-${Date.now()}`;
  const exists = await prisma.facture.findUnique({ where: { numero: base } });
  if (!exists) return base;
  return `${base}-${Date.now()}`;
}

async function replaceItems(factureId, items, type = 'achat') {
  await prisma.factureItem.deleteMany({ where: { factureId } });
  
  const calculatedItems = [];
  for (const item of items || []) {
    const produit = await findOrCreateProduit(item);
    const quantite = parseInt(item.quantite, 10) || 0;
    const prixUnitaire = Number(item.prixUnitaire) || 0;
    
    const montants = calculerMontantsItem(quantite, prixUnitaire, 0, type);
    
    const factureItem = await prisma.factureItem.create({
      data: {
        factureId,
        produitId: produit.id,
        designation: item.designation || item.nom || produit.nom,
        quantite,
        prixUnitaire,
        ...montants,
      },
    });
    
    calculatedItems.push(factureItem);
  }
  
  return calculatedItems;
}

function factureInclude() {
  return {
    items: { include: { produit: true } },
  };
}

async function saveFacture({
  userId,
  numero,
  date,
  type = 'achat',
  fournisseurNom,
  clientNom,
  items = [],
  status = 'draft',
}) {
  const facture = await prisma.facture.create({
    data: {
      numero: await uniqueNumero(numero),
      date: new Date(date || Date.now()),
      type,
      fournisseurNom: fournisseurNom || null,
      clientNom: clientNom || null,
      montantTotal: 0,
      status: 'draft',
      userId,
    },
  });

  const calculatedItems = await replaceItems(facture.id, items, type);
  const totaux = calculerTotauxFacture(calculatedItems);

  await prisma.facture.update({
    where: { id: facture.id },
    data: totaux,
  });

  const dbStatus = toDbStatus(status) || 'draft';
  if (dbStatus === 'validated') {
    return validateFacture(facture.id, userId);
  }

  if (dbStatus !== 'draft') {
    return prisma.facture.update({
      where: { id: facture.id },
      data: { status: dbStatus },
      include: factureInclude(),
    });
  }

  return prisma.facture.findUnique({
    where: { id: facture.id },
    include: factureInclude(),
  });
}

async function updateFacture(id, userId, payload) {
  const existing = await prisma.facture.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    const error = new Error('Not found');
    error.status = 404;
    throw error;
  }

  const {
    status,
    numero,
    date,
    fournisseurNom,
    clientNom,
    type,
    items,
  } = payload;

  let calculatedItems = [];
  if (items) {
    if (existing.status === 'validated') {
      const error = new Error('Impossible de modifier les lignes d\'une facture validée');
      error.status = 400;
      throw error;
    }
    calculatedItems = await replaceItems(id, items, existing.type);
  }

  const updateData = {
    ...(numero && { numero }),
    ...(date && { date: new Date(date) }),
    ...(fournisseurNom !== undefined && { fournisseurNom }),
    ...(clientNom !== undefined && { clientNom }),
    ...(type && { type }),
  };

  if (items && calculatedItems.length > 0) {
    const totaux = calculerTotauxFacture(calculatedItems);
    Object.assign(updateData, totaux);
  }

  await prisma.facture.update({
    where: { id },
    data: updateData,
  });

  const dbStatus = toDbStatus(status);
  if (dbStatus === 'validated') {
    return validateFacture(id, userId);
  }

  if (dbStatus) {
    return prisma.facture.update({
      where: { id },
      data: { status: dbStatus },
      include: factureInclude(),
    });
  }

  return prisma.facture.findFirst({
    where: { id, userId },
    include: factureInclude(),
  });
}

async function validateFacture(id, userId) {
  const facture = await prisma.facture.findFirst({
    where: { id, userId },
    include: { items: true },
  });

  if (!facture) {
    const error = new Error('Not found');
    error.status = 404;
    throw error;
  }

  if (facture.status === 'validated') {
    return prisma.facture.findFirst({
      where: { id },
      include: factureInclude(),
    });
  }

  // Pour MVP, on ne gère pas le stock automatiquement
  return prisma.facture.update({
    where: { id: facture.id },
    data: { status: 'validated' },
    include: factureInclude(),
  });
}

module.exports = {
  saveFacture,
  updateFacture,
  validateFacture,
  toDbStatus,
  calculerMontantsItem,
  calculerTotauxFacture,
};
