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
  console.log('Validating facture:', facture);

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
    // Plus lenient validation for imports
    const designation = item.designation || item.nom || '';
    if (!designation || designation.trim() === '') {
      erreurs.push(`Ligne ${index + 1}: Désignation requise`);
    }
    
    const quantite = parseInt(item.quantite, 10) || 0;
    if (!quantite || quantite <= 0) {
      erreurs.push(`Ligne ${index + 1}: Quantité invalide (${item.quantite})`);
    }
    
    // Pour les imports, accepter prix = 0 et le remplacer par un prix par défaut
    const prixUnitaire = parseFloat(item.prixUnitaire) || 0;
    if (prixUnitaire < 0) {
      erreurs.push(`Ligne ${index + 1}: Prix unitaire invalide (${item.prixUnitaire})`);
    }
    // Prix = 0 est accepté pour les imports, sera remplacé par défaut
  });

  const result = {
    valide: erreurs.length === 0,
    erreurs
  };
  
  console.log('Validation result:', result);
  return result;
}

module.exports = {
  calculerMontantsItem,
  calculerTotauxFacture,
  validerFacture
};
