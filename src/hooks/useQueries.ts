import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import type {
  Facture,
  Produit,
} from '@/types';

export const queryKeys = {
  factures: ['factures'] as const,
  produits: ['produits'] as const,
};

// ---------- Factures ----------
function useAuthedQuery<T>(key: readonly unknown[], queryFn: () => Promise<T>) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: key,
    queryFn,
    enabled: !!token,
  });
}

export function useFactures() {
  return useAuthedQuery(queryKeys.factures, api.listFactures);
}

export function useCreateFacture() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.createFacture(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.factures });
      qc.invalidateQueries({ queryKey: queryKeys.produits });
    },
  });
}

export function useUpdateFacture() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Facture> }) =>
      api.updateFacture(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.factures });
      qc.invalidateQueries({ queryKey: queryKeys.produits });
    },
  });
}

export function useDeleteFacture() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteFacture(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.factures }),
  });
}

// ---------- Produits ----------
export function useProduits() {
  return useAuthedQuery(queryKeys.produits, api.listProduits);
}

export function useCreateProduit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Produit, 'id'>) => api.createProduit(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.produits }),
  });
}

export function useUpdateProduit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Produit> }) =>
      api.updateProduit(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.produits }),
  });
}

export function useDeleteProduit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteProduit(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.produits });
      toast.success('Produit supprimé');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la suppression du produit');
    },
  });
}
