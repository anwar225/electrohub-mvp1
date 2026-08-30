const express = require('express');
const prisma = require('../utils/prisma');
const { verifyToken } = require('../middleware/auth');
const { saveFacture, updateFacture, validateFacture } = require('../services/facture.service');
const { validerFacture } = require('../services/facture-calcul.service');
const { toInt } = require('../utils/validators');

const router = express.Router();

// POST: Créer une facture avec items (SAISIE MANUELLE COMPLÈTE)
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const {
      numero,
      date,
      type = 'achat',
      fournisseurNom,
      clientNom,
      items = [],
      status,
    } = req.body;

    // Valider les données
    const validation = validerFacture({
      numero,
      date,
      type,
      items
    });

    if (!validation.valide) {
      return res.status(400).json({
        error: 'Données invalides',
        erreurs: validation.erreurs
      });
    }

    // Utiliser le service existant pour la création
    const facture = await saveFacture({
      userId: req.userId,
      numero,
      date,
      type,
      fournisseurNom,
      clientNom,
      items,
      status,
    });

    res.status(201).json(facture);
  } catch (error) {
    next(error);
  }
});

// GET: Lister toutes les factures
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const factures = await prisma.facture.findMany({
      where: { userId: req.userId },
      include: { items: { include: { produit: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(factures);
  } catch (error) {
    next(error);
  }
});

// GET: Détail d'une facture
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const id = toInt(req.params.id);
    const facture = await prisma.facture.findFirst({
      where: { id, userId: req.userId },
      include: { items: { include: { produit: true } } },
    });
    if (!facture) return res.status(404).json({ error: 'Not found' });
    res.json(facture);
  } catch (error) {
    next(error);
  }
});

// PUT: Modifier le statut d'une facture
router.put('/:id', verifyToken, async (req, res, next) => {
  try {
    const id = toInt(req.params.id);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const updated = await updateFacture(id, req.userId, { status });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE: Supprimer une facture
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const id = toInt(req.params.id);
    const existing = await prisma.facture.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    await prisma.facture.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
