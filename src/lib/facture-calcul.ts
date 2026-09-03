export function calculerMontantsItem(quantite: number, prixUnitaire: number, type: 'achat' | 'vente' = 'achat') {
  quantite = parseFloat(quantite.toString()) || 0;
  prixUnitaire = parseFloat(prixUnitaire.toString()) || 0;

  // Calcul simple sans TVA
  const montantTotal = quantite * prixUnitaire;

  return {
    montantTotal: parseFloat(montantTotal.toFixed(2))
  };
}

export function calculerTotauxFacture(items: any[]) {
  let total = 0;

  items.forEach(item => {
    total += item.montantTotal || 0;
  });

  return {
    montantHT: parseFloat(total.toFixed(2)),
    montantTVA: 0,
    montantTTC: parseFloat(total.toFixed(2))
  };
}
