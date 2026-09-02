const express = require('express');
const prisma = require('../utils/prisma');
const { verifyToken } = require('../middleware/auth');
const { toInt, requireFields, slugifyRef } = require('../utils/validators');

const router = express.Router();

router.get('/', verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const produits = await prisma.produit.findMany({ 
      where: { userId },
      orderBy: { nom: 'asc' } 
    });
    res.json(produits);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const produit = await prisma.produit.findFirst({
      where: { 
        id: toInt(req.params.id),
        userId 
      },
    });
    if (!produit) return res.status(404).json({ error: 'Not found' });
    res.json(produit);
  } catch (error) {
    next(error);
  }
});

router.post('/', verifyToken, async (req, res, next) => {
  try {
    const missing = requireFields(req.body, ['nom', 'prixAchat', 'prixVente']);
    if (missing.length) {
      return res.status(400).json({ error: 'Missing fields', missing });
    }
    const { nom, reference, categorie, prixAchat, prixVente, stockMin, stockActuel, stock } = req.body;
    const userId = req.user.id;
    const produit = await prisma.produit.create({
      data: {
        nom,
        reference: reference || slugifyRef(nom),
        categorie: categorie || 'Général',
        prixAchat: Number(prixAchat),
        prixVente: Number(prixVente),
        stockMin: stockMin !== undefined ? Number(stockMin) : 5,
        stockActuel: Number(stockActuel ?? stock ?? 0),
        userId,
      },
    });
    res.status(201).json(produit);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { nom, reference, categorie, prixAchat, prixVente, stockMin, stockActuel, stock } = req.body;
    
    // Vérifier que le produit appartient à l'utilisateur
    const existing = await prisma.produit.findFirst({
      where: { 
        id: toInt(req.params.id),
        userId 
      }
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    const produit = await prisma.produit.update({
      where: { id: toInt(req.params.id) },
      data: {
        ...(nom !== undefined && { nom }),
        ...(reference !== undefined && { reference }),
        ...(categorie !== undefined && { categorie }),
        ...(prixAchat !== undefined && { prixAchat: Number(prixAchat) }),
        ...(prixVente !== undefined && { prixVente: Number(prixVente) }),
        ...(stockMin !== undefined && { stockMin: Number(stockMin) }),
        ...((stockActuel !== undefined || stock !== undefined) && {
          stockActuel: Number(stockActuel ?? stock),
        }),
      },
    });
    res.json(produit);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const id = toInt(req.params.id);
    
    // Vérifier que le produit appartient à l'utilisateur
    const existing = await prisma.produit.findFirst({
      where: { 
        id,
        userId 
      }
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    // Vérifier si le produit est utilisé dans des factures
    const factureItems = await prisma.factureItem.findMany({
      where: { produitId: id }
    });
    
    if (factureItems.length > 0) {
      return res.status(400).json({ 
        error: 'Ce produit est utilisé dans des factures et ne peut pas être supprimé',
        count: factureItems.length
      });
    }
    
    // Vérifier si le produit est utilisé dans des mouvements de stock
    const stockMovements = await prisma.stockMovement.findMany({
      where: { produitId: id }
    });
    
    if (stockMovements.length > 0) {
      return res.status(400).json({ 
        error: 'Ce produit a des mouvements de stock et ne peut pas être supprimé',
        count: stockMovements.length
      });
    }
    
    await prisma.produit.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
