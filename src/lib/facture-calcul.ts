export function calculerMontantsItem(quantite: number, prixUnitaire: number, tauxTVA: number = 20, type: 'achat' | 'vente' = 'achat') {
  quantite = parseFloat(quantite.toString()) || 0;
  prixUnitaire = parseFloat(prixUnitaire.toString()) || 0;
  tauxTVA = parseFloat(tauxTVA.toString()) || 20;

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
