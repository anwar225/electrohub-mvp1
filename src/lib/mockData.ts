import type {
  Facture,
  Produit,
  User,
} from '@/types';

const UID = () => Math.random().toString(36).slice(2, 10);

export const seedUsers: (User & { password: string })[] = [
  { id: 'u1', email: 'test@example.com', nom: 'Admin ElectroHub', password: 'password' },
];

const produitsSeed: Produit[] = [
  { id: 'p1', nom: 'Réfrigérateur Samsung RT38', categorie: 'Froid', stock: 8, stockMin: 5, prixAchat: 3200, prixVente: 4299 },
  { id: 'p2', nom: 'Lave-linge LG 8kg', categorie: 'Lavage', stock: 3, stockMin: 4, prixAchat: 2100, prixVente: 2890 },
  { id: 'p3', nom: 'Four Bosch HBN', categorie: 'Cuisson', stock: 12, stockMin: 5, prixAchat: 1800, prixVente: 2450 },
  { id: 'p4', nom: 'TV Philips 50" 4K', categorie: 'TV', stock: 0, stockMin: 3, prixAchat: 2900, prixVente: 3890 },
  { id: 'p5', nom: 'Micro-ondes Samsung MS23', categorie: 'Cuisson', stock: 15, stockMin: 5, prixAchat: 650, prixVente: 990 },
  { id: 'p6', nom: 'Climatiseur LG 12000 BTU', categorie: 'Climatisation', stock: 6, stockMin: 4, prixAchat: 3400, prixVente: 4500 },
  { id: 'p7', nom: 'Lave-vaisselle Bosch 12C', categorie: 'Lavage', stock: 2, stockMin: 3, prixAchat: 2400, prixVente: 3199 },
  { id: 'p8', nom: 'Aspirateur Philips PowerPro', categorie: 'Nettoyage', stock: 20, stockMin: 5, prixAchat: 480, prixVente: 799 },
  { id: 'p9', nom: 'Bouilloire Samsung 1.7L', categorie: 'Petit électro', stock: 25, stockMin: 8, prixAchat: 120, prixVente: 249 },
  { id: 'p10', nom: 'Cafetière Philips LatteGo', categorie: 'Petit électro', stock: 4, stockMin: 4, prixAchat: 980, prixVente: 1490 },
  { id: 'p11', nom: 'Congélateur Bosch GSN', categorie: 'Froid', stock: 7, stockMin: 3, prixAchat: 3100, prixVente: 4199 },
  { id: 'p12', nom: 'Téléviseur LG OLED 55"', categorie: 'TV', stock: 5, stockMin: 3, prixAchat: 6200, prixVente: 8490 },
  { id: 'p13', nom: 'Hotte Bosch 90cm', categorie: 'Cuisson', stock: 9, stockMin: 4, prixAchat: 1100, prixVente: 1590 },
  { id: 'p14', nom: 'Plaque induction Philips', categorie: 'Cuisson', stock: 0, stockMin: 3, prixAchat: 1300, prixVente: 1890 },
  { id: 'p15', nom: 'Fer à repasser Philips', categorie: 'Petit électro', stock: 30, stockMin: 10, prixAchat: 90, prixVente: 199 },
];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const facturesSeed: Facture[] = [
  { id: 'fa1', numero: 'FAC-2026-0042', date: daysAgo(2), type: 'achat', fournisseurNom: 'Samsung Maroc', montantTotal: 4299, montantHT: 3582.5, montantTVA: 716.5, montantTTC: 4299, status: 'Validée', createdAt: daysAgo(2),
    produits: [{ nom: 'Réfrigérateur Samsung RT38', quantite: 1, prixUnitaire: 4299 }] },
  { id: 'fa2', numero: 'FAC-2026-0041', date: daysAgo(4), type: 'achat', fournisseurNom: 'LG Distribution', montantTotal: 5780, montantHT: 4816.67, montantTVA: 963.33, montantTTC: 5780, status: 'Validée', createdAt: daysAgo(4),
    produits: [{ nom: 'Lave-linge LG 8kg', quantite: 2, prixUnitaire: 2890 }] },
  { id: 'fa3', numero: 'FAC-2026-0040', date: daysAgo(6), type: 'achat', fournisseurNom: 'Bosch Pro', montantTotal: 7350, montantHT: 6125, montantTVA: 1225, montantTTC: 7350, status: 'Validée', createdAt: daysAgo(6),
    produits: [{ nom: 'Four Bosch HBN', quantite: 2, prixUnitaire: 2450 }, { nom: 'Lave-vaisselle Bosch 12C', quantite: 1, prixUnitaire: 3199 }] },
  { id: 'fa4', numero: 'FAC-2026-0039', date: daysAgo(9), type: 'achat', fournisseurNom: 'Philips Elec', montantTotal: 4678, montantHT: 3898.33, montantTVA: 779.67, montantTTC: 4678, status: 'Validée', createdAt: daysAgo(9),
    produits: [{ nom: 'TV Philips 50" 4K', quantite: 1, prixUnitaire: 3890 }, { nom: 'Aspirateur Philips PowerPro', quantite: 1, prixUnitaire: 799 }] },
  { id: 'fa5', numero: 'FAC-2026-0038', date: daysAgo(12), type: 'achat', fournisseurNom: 'Samsung Maroc', montantTotal: 2475, montantHT: 2062.5, montantTVA: 412.5, montantTTC: 2475, status: 'Validée', createdAt: daysAgo(12),
    produits: [{ nom: 'Micro-ondes Samsung MS23', quantite: 5, prixUnitaire: 495 }] },
  { id: 'fa6', numero: 'FAC-2026-0037', date: daysAgo(15), type: 'achat', fournisseurNom: 'LG Distribution', montantTotal: 9000, montantHT: 7500, montantTVA: 1500, montantTTC: 9000, status: 'Validée', createdAt: daysAgo(15),
    produits: [{ nom: 'Climatiseur LG 12000 BTU', quantite: 2, prixUnitaire: 4500 }] },
  { id: 'fa7', numero: 'FAC-2026-0036', date: daysAgo(20), type: 'achat', fournisseurNom: 'Bosch Pro', montantTotal: 4199, montantHT: 3499.17, montantTVA: 699.83, montantTTC: 4199, status: 'Archivée', createdAt: daysAgo(20),
    produits: [{ nom: 'Congélateur Bosch GSN', quantite: 1, prixUnitaire: 4199 }] },
  { id: 'fa8', numero: 'FAC-2026-0035', date: daysAgo(25), type: 'achat', fournisseurNom: 'Philips Elec', montantTotal: 1687, montantHT: 1405.83, montantTVA: 281.17, montantTTC: 1687, status: 'Validée', createdAt: daysAgo(25),
    produits: [{ nom: 'Cafetière Philips LatteGo', quantite: 1, prixUnitaire: 1490 }, { nom: 'Fer à repasser Philips', quantite: 1, prixUnitaire: 199 }] },
  { id: 'fa9', numero: 'FAC-2026-0034', date: daysAgo(28), type: 'achat', fournisseurNom: 'Samsung Maroc', montantTotal: 1494, montantHT: 1245, montantTVA: 249, montantTTC: 1494, status: 'Draft', createdAt: daysAgo(28),
    produits: [{ nom: 'Bouilloire Samsung 1.7L', quantite: 6, prixUnitaire: 249 }] },
  { id: 'fa10', numero: 'FAC-2026-0033', date: daysAgo(35), type: 'achat', fournisseurNom: 'LG Distribution', montantTotal: 8490, montantHT: 7075, montantTVA: 1415, montantTTC: 8490, status: 'Archivée', createdAt: daysAgo(35),
    produits: [{ nom: 'Téléviseur LG OLED 55"', quantite: 1, prixUnitaire: 8490 }] },
  { id: 'fa11', numero: 'FAC-2026-0032', date: daysAgo(48), type: 'achat', fournisseurNom: 'Bosch Pro', montantTotal: 4770, montantHT: 3975, montantTVA: 795, montantTTC: 4770, status: 'Validée', createdAt: daysAgo(48),
    produits: [{ nom: 'Hotte Bosch 90cm', quantite: 3, prixUnitaire: 1590 }] },
  { id: 'fa12', numero: 'FAC-2026-0031', date: daysAgo(62), type: 'achat', fournisseurNom: 'Philips Elec', montantTotal: 3780, montantHT: 3150, montantTVA: 630, montantTTC: 3780, status: 'Validée', createdAt: daysAgo(62),
    produits: [{ nom: 'Plaque induction Philips', quantite: 2, prixUnitaire: 1890 }] },
];

export const mockData = {
  users: seedUsers,
  factures: facturesSeed,
  produits: produitsSeed,
};

export function newId(): string {
  return UID();
}
