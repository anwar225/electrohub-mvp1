import axios, { AxiosError } from 'axios';
import type {
  Facture,
  Produit,
  User,
  FactureStatus,
} from '@/types';

const API_URL = import.meta.env.VITE_API_URL || '';

const getStoredAuth = () => {
  try {
    const stored = localStorage.getItem('electrohub-auth');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error parsing stored auth:', e);
  }
  return { user: null, token: null };
};

const clearStoredAuth = () => {
  try {
    localStorage.removeItem('electrohub-auth');
  } catch (e) {
    console.error('Error clearing stored auth:', e);
  }
};

const http = axios.create({
  baseURL: API_URL,
  timeout: 180000,
});

http.interceptors.request.use((config) => {
  const auth = getStoredAuth();
  const token = auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ error?: string }>) => {
    if (error.response?.status === 401) {
      const path = error.config?.url || '';
      if (!path.includes('/api/auth/login') && !path.includes('/api/auth/signup')) {
        clearStoredAuth();
      }
    }
    const message = error.response?.data?.error || error.message || 'Erreur réseau';
    return Promise.reject(new Error(message));
  }
);

function mapStatus(status: string): FactureStatus {
  if (status === 'validated' || status === 'Validée') return 'Validée';
  if (status === 'archived' || status === 'Archivée') return 'Archivée';
  return 'Draft';
}

function mapFacture(f: Record<string, unknown>): Facture {
  const items = (f.items as Array<Record<string, unknown>>) || [];
  return {
    id: String(f.id),
    numero: String(f.numero),
    date: String(f.date),
    type: (String(f.type || 'achat') as 'achat' | 'vente'),
    fournisseurNom: f.fournisseurNom ? String(f.fournisseurNom) : '',
    clientNom: f.clientNom ? String(f.clientNom) : undefined,
    produits: items.map((item) => {
      const produit = item.produit as { nom?: string } | undefined;
      return {
        nom: String(item.designation || produit?.nom || item.nom || ''),
        designation: String(item.designation || produit?.nom || item.nom || ''),
        quantite: Number(item.quantite),
        prixUnitaire: Number(item.prixUnitaire),
        montantTotal: Number(item.montantTotal) || 0,
      };
    }),
    montantTotal: Number(f.montantTotal),
    status: mapStatus(String(f.status)),
    createdAt: String(f.createdAt),
  };
}

function mapProduit(p: Record<string, unknown>): Produit {
  return {
    id: String(p.id),
    nom: String(p.nom),
    categorie: String(p.categorie || 'Général'),
    stock: Number(p.stockActuel || p.stock || 0),
    stockMin: Number(p.stockMin),
    prixAchat: Number(p.prixAchat),
    prixVente: Number(p.prixVente),
  };
}

function mapUser(u: Record<string, unknown>): User {
  return {
    id: String(u.id),
    email: String(u.email),
    nom: String(u.nom),
  };
}

export const api = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const { data } = await http.post('/api/auth/login', { email, password });
    const authData = { token: data.token, user: mapUser(data.user) };
    try {
      localStorage.setItem('electrohub-auth', JSON.stringify(authData));
    } catch (e) {
      console.error('Error storing auth:', e);
    }
    return authData;
  },

  async signup(nom: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const { data } = await http.post('/api/auth/signup', { nom, email, password });
    const authData = { token: data.token, user: mapUser(data.user) };
    try {
      localStorage.setItem('electrohub-auth', JSON.stringify(authData));
    } catch (e) {
      console.error('Error storing auth:', e);
    }
    return authData;
  },

  async listFactures(): Promise<Facture[]> {
    const { data } = await http.get('/api/factures');
    return (data as Record<string, unknown>[]).map(mapFacture);
  },

  async getFacture(id: string): Promise<Facture | undefined> {
    const { data } = await http.get(`/api/factures/${id}`);
    return mapFacture(data);
  },

  async createFacture(payload: any): Promise<Facture> {
    const items = (payload.items || payload.produits).map((item: any) => ({
      ...item,
      ...(item.produitId ? { produitId: Number(item.produitId) } : {})
    }));

    const { data } = await http.post('/api/factures', {
      numero: payload.numero,
      date: payload.date,
      type: payload.type || 'achat',
      fournisseurNom: payload.fournisseurNom,
      clientNom: payload.clientNom,
      items,
      status: payload.status,
    });
    return mapFacture(data);
  },

  async updateFacture(id: string, payload: Partial<Facture> & { items?: any[] }): Promise<Facture> {
    const items = payload.produits || payload.items;
    const processedItems = items ? items.map((item: any) => ({
      ...item,
      ...(item.produitId ? { produitId: Number(item.produitId) } : {})
    })) : undefined;

    const { data } = await http.put(`/api/factures/${id}`, {
      ...(payload.numero && { numero: payload.numero }),
      ...(payload.date && { date: payload.date }),
      ...(payload.fournisseurNom && { fournisseurNom: payload.fournisseurNom }),
      ...(processedItems && { items: processedItems }),
      ...(payload.status && { status: payload.status }),
    });
    return mapFacture(data);
  },

  async deleteFacture(id: string): Promise<void> {
    await http.delete(`/api/factures/${id}`);
  },

  async listProduits(): Promise<Produit[]> {
    const { data } = await http.get('/api/produits');
    return (data as Record<string, unknown>[]).map(mapProduit);
  },

  async createProduit(payload: Omit<Produit, 'id'>): Promise<Produit> {
    const { data } = await http.post('/api/produits', {
      nom: payload.nom,
      categorie: payload.categorie,
      prixAchat: payload.prixAchat,
      prixVente: payload.prixVente,
      stockMin: payload.stockMin,
      stock: payload.stock,
    });
    return mapProduit(data);
  },

  async updateProduit(id: string, payload: Partial<Produit>): Promise<Produit> {
    const { data } = await http.put(`/api/produits/${id}`, {
      ...(payload.nom !== undefined && { nom: payload.nom }),
      ...(payload.categorie !== undefined && { categorie: payload.categorie }),
      ...(payload.prixAchat !== undefined && { prixAchat: payload.prixAchat }),
      ...(payload.prixVente !== undefined && { prixVente: payload.prixVente }),
      ...(payload.stockMin !== undefined && { stockMin: payload.stockMin }),
      ...(payload.stock !== undefined && { stock: payload.stock }),
    });
    return mapProduit(data);
  },

  async deleteProduit(id: string): Promise<void> {
    await http.delete(`/api/produits/${id}`);
  },
};
