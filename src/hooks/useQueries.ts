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
  const [isPending, setIsPending] = React.useState(false);

  const createFacture = async (data: any) => {
    setIsPending(true);
    try {
      await api.createFacture(data);
      toast.success('Facture créée avec succès');
      return true;
    } catch (error) {
      toast.error('Erreur lors de la création de la facture');
      return false;
    } finally {
      setIsPending(false);
    }
  };
  
  return { mutate: createFacture, mutateAsync: createFacture, isPending };
}

export function useUpdateFacture() {
  const [isPending, setIsPending] = React.useState(false);

  const updateFacture = async ({ id, data }: { id: string; data: Partial<Facture> }) => {
    setIsPending(true);
    try {
      await api.updateFacture(id, data);
      toast.success('Facture mise à jour');
      return true;
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la facture');
      return false;
    } finally {
      setIsPending(false);
    }
  };
  
  return { mutate: updateFacture, mutateAsync: updateFacture, isPending };
}

export function useDeleteFacture() {
  const [isPending, setIsPending] = React.useState(false);

  const deleteFacture = async (id: string) => {
    setIsPending(true);
    try {
      await api.deleteFacture(id);
      toast.success('Facture supprimée');
      return true;
    } catch (error) {
      toast.error('Erreur lors de la suppression de la facture');
      return false;
    } finally {
      setIsPending(false);
    }
  };
  
  return { mutate: deleteFacture, mutateAsync: deleteFacture, isPending };
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
  const [isPending, setIsPending] = React.useState(false);

  const createProduit = async (data: Omit<Produit, 'id'>) => {
    setIsPending(true);
    try {
      await api.createProduit(data);
      toast.success('Produit créé avec succès');
      return true;
    } catch (error) {
      toast.error('Erreur lors de la création du produit');
      return false;
    } finally {
      setIsPending(false);
    }
  };
  
  return { mutate: createProduit, mutateAsync: createProduit, isPending };
}

export function useUpdateProduit() {
  const [isPending, setIsPending] = React.useState(false);

  const updateProduit = async ({ id, data }: { id: string; data: Partial<Produit> }) => {
    setIsPending(true);
    try {
      await api.updateProduit(id, data);
      toast.success('Produit mis à jour');
      return true;
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du produit');
      return false;
    } finally {
      setIsPending(false);
    }
  };
  
  return { mutate: updateProduit, mutateAsync: updateProduit, isPending };
}

export function useDeleteProduit() {
  const [isPending, setIsPending] = React.useState(false);

  const deleteProduit = async (id: string) => {
    setIsPending(true);
    try {
      await api.deleteProduit(id);
      toast.success('Produit supprimé');
      return true;
    } catch (error) {
      toast.error('Erreur lors de la suppression du produit');
      return false;
    } finally {
      setIsPending(false);
    }
  };
  
  return { mutate: deleteProduit, mutateAsync: deleteProduit, isPending };
}
