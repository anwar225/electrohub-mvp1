import React from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type {
  Facture,
  Produit,
} from '@/types';

// Simple API calls without react-query
export function useFactures() {
  const [data, setData] = React.useState<Facture[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    api.listFactures()
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
}

export function useCreateFacture() {
  const createFacture = async (data: any) => {
    try {
      await api.createFacture(data);
      toast.success('Facture créée avec succès');
      return true;
    } catch (error) {
      toast.error('Erreur lors de la création de la facture');
      return false;
    }
  };
  
  return { mutate: createFacture };
}

export function useUpdateFacture() {
  const updateFacture = async ({ id, data }: { id: string; data: Partial<Facture> }) => {
    try {
      await api.updateFacture(id, data);
      toast.success('Facture mise à jour');
      return true;
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la facture');
      return false;
    }
  };
  
  return { mutate: updateFacture };
}

export function useDeleteFacture() {
  const deleteFacture = async (id: string) => {
    try {
      await api.deleteFacture(id);
      toast.success('Facture supprimée');
      return true;
    } catch (error) {
      toast.error('Erreur lors de la suppression de la facture');
      return false;
    }
  };
  
  return { mutate: deleteFacture };
}

export function useProduits() {
  const [data, setData] = React.useState<Produit[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    api.listProduits()
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
}

export function useCreateProduit() {
  const createProduit = async (data: Omit<Produit, 'id'>) => {
    try {
      await api.createProduit(data);
      toast.success('Produit créé avec succès');
      return true;
    } catch (error) {
      toast.error('Erreur lors de la création du produit');
      return false;
    }
  };
  
  return { mutate: createProduit };
}

export function useUpdateProduit() {
  const updateProduit = async ({ id, data }: { id: string; data: Partial<Produit> }) => {
    try {
      await api.updateProduit(id, data);
      toast.success('Produit mis à jour');
      return true;
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du produit');
      return false;
    }
  };
  
  return { mutate: updateProduit };
}

export function useDeleteProduit() {
  const deleteProduit = async (id: string) => {
    try {
      await api.deleteProduit(id);
      toast.success('Produit supprimé');
      return true;
    } catch (error) {
      toast.error('Erreur lors de la suppression du produit');
      return false;
    }
  };
  
  return { mutate: deleteProduit };
}
