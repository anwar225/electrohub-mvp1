import { useState, useMemo } from 'react';
import {
  Plus,
  History,
  Trash2,
  Pencil,
  Loader2,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useProduits,
  useCreateProduit,
  useUpdateProduit,
  useDeleteProduit,
  useFactures,
} from '@/hooks/useQueries';
import { StockStatusBadge, getStockStatus } from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/formatting';
import type { Produit } from '@/types';
import { cn } from '@/lib/utils';

export function StockPage() {
  const { data: produits, isLoading } = useProduits();
  const { data: factures } = useFactures();
  const createP = useCreateProduit();
  const updateP = useUpdateProduit();
  const deleteP = useDeleteProduit();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [historyTarget, setHistoryTarget] = useState<Produit | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Produit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Produit | null>(null);

  const filtered = useMemo(() => {
    return (produits ?? []).filter((p) => {
      if (statusFilter !== 'all' && getStockStatus(p.stock, p.stockMin) !== statusFilter) return false;
      if (search && !p.nom.toLowerCase().includes(search.toLowerCase()) && !p.categorie.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [produits, search, statusFilter]);

  const productHistory = (prod: Produit) =>
    (factures ?? [])
      .filter((f) => f.status === 'Validée')
      .flatMap((f) =>
        f.produits
          .filter((p) => p.nom.toLowerCase() === prod.nom.toLowerCase())
          .map((p) => ({ date: f.date, numero: f.numero, quantite: p.quantite, fournisseur: f.fournisseurNom }))
      )
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));

  const openNew = () => { setEditTarget(null); setFormOpen(true); };
  const openEdit = (p: Produit) => { setEditTarget(p); setFormOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock / Inventaire</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} produit(s)</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Nouveau produit
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un produit..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="OK">OK</SelectItem>
                <SelectItem value="Bas">Bas</SelectItem>
                <SelectItem value="Rupture">Rupture</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">Aucun produit</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Min</TableHead>
                    <TableHead className="text-right">Prix achat</TableHead>
                    <TableHead className="text-right">Prix vente</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => {
                    const status = getStockStatus(p.stock, p.stockMin);
                    return (
                      <TableRow key={p.id} className={cn(status === 'Rupture' && 'bg-destructive/5')}>
                        <TableCell>
                          <p className="font-medium">{p.nom}</p>
                          <p className="text-xs text-muted-foreground">{p.categorie}</p>
                        </TableCell>
                        <TableCell className={cn('font-semibold tabular-nums', status === 'Rupture' && 'text-destructive')}>
                          {p.stock}
                        </TableCell>
                        <TableCell className="text-muted-foreground tabular-nums">{p.stockMin}</TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">{formatCurrency(p.prixAchat)}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium">{formatCurrency(p.prixVente)}</TableCell>
                        <TableCell><StockStatusBadge status={status} /></TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">

                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setHistoryTarget(p)}>
                              <History className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(p)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget(p)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History modal */}
      <Dialog open={!!historyTarget} onOpenChange={(o) => !o && setHistoryTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Historique des mouvements</DialogTitle>
            <DialogDescription>{historyTarget?.nom}</DialogDescription>
          </DialogHeader>
          {historyTarget && (
            <div className="max-h-80 overflow-y-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Facture</TableHead>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead className="text-right">Qté entrée</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productHistory(historyTarget).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                        Aucun mouvement
                      </TableCell>
                    </TableRow>
                  ) : (
                    productHistory(historyTarget).map((m, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-muted-foreground">{formatDate(m.date)}</TableCell>
                        <TableCell className="font-medium">{m.numero}</TableCell>
                        <TableCell>{m.fournisseur}</TableCell>
                        <TableCell className="text-right font-medium text-success tabular-nums">+{m.quantite}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New / Edit product modal */}
      <ProduitFormDialog
        open={formOpen}
        target={editTarget}
        onClose={() => setFormOpen(false)}
        onSubmit={async (data) => {
          try {
            if (editTarget) {
              await updateP.mutateAsync({ id: editTarget.id, data });
              toast.success('Produit mis à jour');
            } else {
              await createP.mutateAsync(data as Omit<Produit, 'id'>);
              toast.success('Produit créé');
            }
            setFormOpen(false);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Erreur');
          }
        }}
        pending={createP.isPending || updateP.isPending}
      />

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Supprimer le produit ?</DialogTitle>
            <DialogDescription>{deleteTarget?.nom} sera supprimé définitivement.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Annuler</Button>
            <Button
              variant="destructive"
              disabled={deleteP.isPending}
              onClick={async () => {
                if (!deleteTarget) return;
                await deleteP.mutateAsync(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              {deleteP.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProduitFormDialog({
  open,
  target,
  onClose,
  onSubmit,
  pending,
}: {
  open: boolean;
  target: Produit | null;
  onClose: () => void;
  onSubmit: (data: Partial<Produit>) => void;
  pending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{target ? 'Modifier le produit' : 'Nouveau produit'}</DialogTitle>
          <DialogDescription>
            {target ? 'Mettez à jour les informations du produit.' : 'Ajoutez un produit à votre inventaire.'}
          </DialogDescription>
        </DialogHeader>
        <ProduitForm key={target?.id ?? 'new'} initial={target} pending={pending} onCancel={onClose} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
}

function ProduitForm({
  initial,
  pending,
  onCancel,
  onSubmit,
}: {
  initial: Produit | null;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (data: Partial<Produit>) => void;
}) {
  const [nom, setNom] = useState(initial?.nom ?? '');
  const [categorie, setCategorie] = useState(initial?.categorie ?? '');
  const [stock, setStock] = useState(initial?.stock ?? 0);
  const [stockMin, setStockMin] = useState(initial?.stockMin ?? 0);
  const [prixAchat, setPrixAchat] = useState(initial?.prixAchat ?? 0);
  const [prixVente, setPrixVente] = useState(initial?.prixVente ?? 0);

  const submit = () => {
    if (!nom.trim()) { toast.error('Nom requis'); return; }
    onSubmit({ nom: nom.trim(), categorie: categorie.trim(), stock, stockMin, prixAchat, prixVente });
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Nom du produit</Label>
          <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="ex: Réfrigérateur X" />
        </div>
        <div className="space-y-2">
          <Label>Catégorie</Label>
          <Input value={categorie} onChange={(e) => setCategorie(e.target.value)} placeholder="ex: Froid" />
        </div>
        <div className="space-y-2">
          <Label>Stock min</Label>
          <Input type="number" min={0} value={stockMin} onChange={(e) => setStockMin(Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label>Stock actuel</Label>
          <Input type="number" min={0} value={stock} onChange={(e) => setStock(Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label>Prix achat</Label>
          <Input type="number" min={0} step="0.01" value={prixAchat} onChange={(e) => setPrixAchat(Number(e.target.value))} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Prix vente</Label>
          <Input type="number" min={0} step="0.01" value={prixVente} onChange={(e) => setPrixVente(Number(e.target.value))} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Annuler</Button>
        <Button disabled={pending} onClick={submit}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initial ? 'Enregistrer' : 'Créer'}
        </Button>
      </DialogFooter>
    </>
  );
}