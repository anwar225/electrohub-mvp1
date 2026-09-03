export type FactureStatus = 'Draft' | 'Validée' | 'Archivée';

export type StockStatus = 'OK' | 'Bas' | 'Rupture';

export interface User {
  id: string;
  email: string;
  nom: string;
}

export interface ProduitFacture {
  produitId?: string;
  nom: string;
  designation?: string;
  quantite: number;
  prixUnitaire: number;
  montantTotal?: number;
}

export interface Facture {
  id: string;
  numero: string;
  date: string; // ISO
  type: 'achat' | 'vente';
  fournisseurNom: string;
  clientNom?: string;
  produits: ProduitFacture[];
  montantTotal: number;
  status: FactureStatus;
  createdAt: string;
}

export interface Produit {
  id: string;
  nom: string;
  categorie: string;
  stock: number;
  stockMin: number;
  prixAchat: number;
  prixVente: number;
}
