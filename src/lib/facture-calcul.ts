export function calculerMontantsItem(quantite: number, prixUnitaire: number, type: 'achat' | 'vente' = 'achat') {
  quantite = parseFloat(quantite.toString()) || 0;
  prixUnitaire = parseFloat(prixUnitaire.toString()) || 0;

  // Calcul simple sans TVA
  const montantTotal = quantite * prixUnitaire;

  return {
    montantHT: parseFloat(montantTotal.toFixed(2)),
    montantTVA: 0,
    montantTTC: parseFloat(montantTotal.toFixed(2))
  };
}

export function calculerTotauxFacture(items: any[]) {
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
