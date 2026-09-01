/**
 * Calcule les montants pour un item de facture (SANS TVA)
 */
function calculerMontantsItem(quantite, prixUnitaire, tauxTVA = 0, type = 'achat') {
  // Validation
  quantite = parseFloat(quantite) || 0;
  prixUnitaire = parseFloat(prixUnitaire) || 0;

  // Calcul simple sans TVA - juste quantité * prix unitaire
  const montantTotal = quantite * prixUnitaire;

  return {
    montantTotal: parseFloat(montantTotal.toFixed(2))
  };
}

/**
 * Calcule les totaux de la facture (SANS TVA)
 */
function calculerTotauxFacture(items) {
  let total = 0;

  items.forEach(item => {
    total += item.montantTotal || 0;
  });

  return {
    montantTotal: parseFloat(total.toFixed(2))
  };
}

/**
 * Valide les données de la facture avant sauvegarde (SANS TVA)
 */
function validerFacture(facture) {
  const erreurs = [];

  if (!facture.numero || facture.numero.trim() === '') {
    erreurs.push('Numéro de facture requis');
  }

  if (!facture.date) {
    erreurs.push('Date de facture requise');
  }

  if (!facture.type || !['achat', 'vente'].includes(facture.type)) {
    erreurs.push('Type de facture invalide (achat/vente)');
  }

  if (!facture.items || facture.items.length === 0) {
    erreurs.push('Au moins un produit est requis');
  }

  facture.items?.forEach((item, index) => {
    if (!item.designation || item.designation.trim() === '') {
      erreurs.push(`Ligne ${index + 1}: Désignation requise`);
    }
    if (!item.quantite || item.quantite <= 0) {
      erreurs.push(`Ligne ${index + 1}: Quantité invalide`);
    }
    if (!item.prixUnitaire || item.prixUnitaire <= 0) {
      erreurs.push(`Ligne ${index + 1}: Prix unitaire invalide`);
    }
  });

  return {
    valide: erreurs.length === 0,
    erreurs
  };
}

module.exports = {
  calculerMontantsItem,
  calculerTotauxFacture,
  validerFacture
};
