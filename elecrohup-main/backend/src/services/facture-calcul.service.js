/**
 * Calcule les montants pour un item de facture
 */
function calculerMontantsItem(quantite, prixUnitaire, tauxTVA = 20, type = 'achat') {
  // Validation
  quantite = parseFloat(quantite) || 0;
  prixUnitaire = parseFloat(prixUnitaire) || 0;
  tauxTVA = parseFloat(tauxTVA) || 20;

  // Calculs selon le type de facture
  if (type === 'vente') {
    // Pour les ventes, le prix est TTC, on décompose en HT + TVA
    const montantTTC = quantite * prixUnitaire;
    const montantHT = montantTTC / (1 + tauxTVA / 100);
    const montantTVA = montantTTC - montantHT;

    return {
      montantHT: parseFloat(montantHT.toFixed(2)),
      montantTVA: parseFloat(montantTVA.toFixed(2)),
      montantTTC: parseFloat(montantTTC.toFixed(2))
    };
  } else {
    // Pour les achats, le prix est HT, on ajoute la TVA
    const montantHT = quantite * prixUnitaire;
    const montantTVA = montantHT * (tauxTVA / 100);
    const montantTTC = montantHT + montantTVA;

    return {
      montantHT: parseFloat(montantHT.toFixed(2)),
      montantTVA: parseFloat(montantTVA.toFixed(2)),
      montantTTC: parseFloat(montantTTC.toFixed(2))
    };
  }
}

/**
 * Calcule les totaux de la facture
 */
function calculerTotauxFacture(items) {
  let totalHT = 0;
  let totalTVA = 0;
  let totalTTC = 0;

  items.forEach(item => {
    totalHT += item.montantHT || 0;
    totalTVA += item.montantTVA || 0;
    totalTTC += item.montantTTC || 0;
  });

  return {
    montantHT: parseFloat(totalHT.toFixed(2)),
    montantTVA: parseFloat(totalTVA.toFixed(2)),
    montantTTC: parseFloat(totalTTC.toFixed(2))
  };
}

/**
 * Valide les données de la facture avant sauvegarde
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
