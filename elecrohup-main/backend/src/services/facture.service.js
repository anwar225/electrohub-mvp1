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

async function findOrCreateProduit(item, userId) {
  console.log('findOrCreateProduit - item:', item, 'userId:', userId);
  
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

  console.log('Recherche produit avec nom:', nom, 'userId:', userId);
  
  let produit = await prisma.produit.findFirst({
    where: {
      userId: userId,
      OR: [{ nom: { equals: nom, mode: 'insensitive' } }, { reference: nom }],
    },
  });

  if (!produit) {
    console.log('Création nouveau produit:', nom, 'prix:', prix, 'userId:', userId);
    produit = await prisma.produit.create({
      data: {
        nom,
        reference: slugifyRef(nom),
        categorie: item.categorie || 'Général',
        prixAchat: prix,
        prixVente: Number((prix * 1.3).toFixed(2)),
        stockActuel: 0, // Initial stock at 0, will be updated by validation
        stockMin: 5,
        userId: userId,
      },
    });
    console.log('Produit créé avec ID:', produit.id);
  } else {
    console.log('Produit existant trouvé avec ID:', produit.id);
  }

  return produit;
}

async function uniqueNumero(preferred) {
  const base = preferred || `FAC-${Date.now()}`;
  const exists = await prisma.facture.findUnique({ where: { numero: base } });
  if (!exists) return base;
  return `${base}-${Date.now()}`;
}

async function replaceItems(factureId, items, type = 'achat', userId) {
  console.log('replaceItems called with:', { factureId, itemsCount: items?.length, type, userId });
  
  await prisma.factureItem.deleteMany({ where: { factureId } });
  
  const calculatedItems = [];
  for (const item of items || []) {
    console.log('Processing item:', item);
    const produit = await findOrCreateProduit(item, userId);
    console.log('Product found/created:', { id: produit.id, nom: produit.nom, userId: produit.userId });
    
    const quantite = parseInt(item.quantite, 10) || 0;
    const prixUnitaire = Number(item.prixUnitaire) || 0;
    
    const montants = calculerMontantsItem(quantite, prixUnitaire, 0, type);
    console.log('Item montants:', montants);
    
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
    
    console.log('FactureItem created:', { id: factureItem.id, produitId: factureItem.produitId });
    calculatedItems.push(factureItem);
  }
  
  console.log('replaceItems completed, items created:', calculatedItems.length);
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

  const calculatedItems = await replaceItems(facture.id, items, type, userId);
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
    calculatedItems = await replaceItems(id, items, existing.type, userId);
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

  // Gérer le stock automatiquement lors de la validation
  for (const item of facture.items) {
    const produit = await prisma.produit.findUnique({
      where: { id: item.produitId },
    });

    if (produit) {
      const stockChange = facture.type === 'achat' ? item.quantite : -item.quantite;
      const newStock = Math.max(0, produit.stockActuel + stockChange);
      
      await prisma.produit.update({
        where: { id: produit.id },
        data: { stockActuel: newStock },
      });

      // Créer un mouvement de stock
      await prisma.stockMovement.create({
        data: {
          produitId: produit.id,
          type: facture.type === 'achat' ? 'entree' : 'sortie',
          quantite: item.quantite,
          factureId: facture.id,
        },
      });
    }
  }

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
