import { useState, useMemo } from 'react';
import {
  Eye,
  Trash2,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowDownUp,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { useFactures, useDeleteFacture, useProduits, useCreateFacture } from '@/hooks/useQueries';
import { FactureStatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/formatting';
import { calculerMontantsItem, calculerTotauxFacture } from '@/lib/facture-calcul';
import type { Facture } from '@/types';

const PAGE_SIZE = 20;

export function FacturesPage() {
  const { data: factures, isLoading } = useFactures();
  const { data: produits } = useProduits();
  const deleteMut = useDeleteFacture();
  const createMut = useCreateFacture();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const [detail, setDetail] = useState<Facture | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Facture | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state for creating facture
  const [formData, setFormData] = useState({
    numero: '',
    date: new Date().toISOString().split('T')[0],
    type: 'achat',
    fournisseurNom: '',
    clientNom: '',
    items: [{ produitId: '', designation: '', quantite: 1, prixUnitaire: 0, tauxTVA: 20 }]
  });

  const filtered = useMemo(() => {
    return (factures ?? []).filter((f) => {
      if (statusFilter !== 'all' && f.status !== statusFilter) return false;
      if (typeFilter !== 'all' && f.type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !f.numero.toLowerCase().includes(q) &&
          !f.fournisseurNom.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [factures, search, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      toast.success('Facture supprimée');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleCreate = async () => {
    try {
      if (!formData.numero.trim() || formData.items.length === 0) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }
      
      if (formData.type === 'achat' && !formData.fournisseurNom.trim()) {
        toast.error('Veuillez renseigner le fournisseur');
        return;
      }

      // Map items to include produitId if selected
      const itemsWithProduitId = formData.items.map(item => ({
        ...item,
        ...(item.produitId ? { produitId: Number(item.produitId) } : {})
      }));

      const payload = {
        ...formData,
        items: itemsWithProduitId,
        status: 'Validée',
        ...(formData.type === 'achat' ? { fournisseurNom: formData.fournisseurNom } : { clientNom: formData.clientNom }),
      };

      await createMut.mutateAsync(payload);
      
      toast.success('Facture créée avec succès');
      setShowCreateForm(false);
      setFormData({
        numero: '',
        date: new Date().toISOString().split('T')[0],
        type: 'achat',
        fournisseurNom: '',
        clientNom: '',
        items: [{ produitId: '', designation: '', quantite: 1, prixUnitaire: 0, tauxTVA: 20 }]
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-fill designation and price when a product is selected
    if (field === 'produitId' && value) {
      const selectedProduct = produits?.find(p => p.id === value);
      if (selectedProduct) {
        newItems[index].designation = selectedProduct.nom;
        newItems[index].prixUnitaire = formData.type === 'achat' ? selectedProduct.prixAchat : selectedProduct.prixVente;
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { produitId: '', designation: '', quantite: 1, prixUnitaire: 0, tauxTVA: 20 }]
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index)
      });
    }
  };

  const totaux = calculerTotauxFacture(formData.items.map(item => {
    const montants = calculerMontantsItem(item.quantite, item.prixUnitaire, item.tauxTVA, formData.type as 'achat' | 'vente');
    return { ...item, ...montants };
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Liste des factures</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} facture(s)</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nouvelle facture
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par numéro ou fournisseur..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="achat">Achat</SelectItem>
                <SelectItem value="vente">Vente</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Validée">Validée</SelectItem>
                <SelectItem value="Archivée">Archivée</SelectItem>
              </SelectContent>
            </Select>

          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : paged.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">Aucune facture trouvée</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Fournisseur/Client</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.numero}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(f.date)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        f.type === 'achat' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {f.type === 'achat' ? 'Achat' : 'Vente'}
                      </span>
                    </TableCell>
                    <TableCell>{f.type === 'achat' ? f.fournisseurNom : (f as any).clientNom || '-'}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {formatCurrency(f.type === 'vente' ? f.montantHT : f.montantTTC)}
                    </TableCell>
                    <TableCell><FactureStatusBadge status={f.status} /></TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setDetail(f)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteTarget(f)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages}
          </p>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détail facture</DialogTitle>
            <DialogDescription>{detail?.numero}</DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Date" value={formatDate(detail.date)} />
                <Info label="Type" value={detail.type === 'achat' ? 'Achat' : 'Vente'} />
                <Info label={detail.type === 'achat' ? 'Fournisseur' : 'Client'} value={detail.type === 'achat' ? detail.fournisseurNom : (detail as any).clientNom || '-'} />
                <Info label="Statut" value={detail.status} />
                <Info label="Montant total" value={formatCurrency(detail.type === 'vente' ? detail.montantHT : detail.montantTTC)} />
              </div>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead className="text-center">Qté</TableHead>
                      <TableHead className="text-right">P.U.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.produits.map((p, i) => (
                      <TableRow key={i}>
                        <TableCell>{p.nom}</TableCell>
                        <TableCell className="text-center tabular-nums">{p.quantite}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatCurrency(p.prixUnitaire)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatCurrency(p.quantite * p.prixUnitaire)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create facture dialog */}
      <Dialog open={showCreateForm} onOpenChange={(o) => !o && setShowCreateForm(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer une facture</DialogTitle>
            <DialogDescription>Saisissez les informations de la facture manuellement</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Numéro *</Label>
                <Input
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  placeholder="FAC-2026-001"
                />
              </div>
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Type de facture *</Label>
              <Select value={formData.type} onValueChange={(v) => {
                const newType = v;
                const updatedItems = formData.items.map(item => {
                  if (item.produitId) {
                    const product = produits?.find(p => p.id === item.produitId);
                    if (product) {
                      return {
                        ...item,
                        prixUnitaire: newType === 'achat' ? product.prixAchat : product.prixVente
                      };
                    }
                  }
                  return item;
                });
                setFormData({ 
                  ...formData, 
                  type: newType, 
                  fournisseurNom: '', 
                  clientNom: '',
                  items: updatedItems
                });
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="achat">Achat (fournisseur)</SelectItem>
                  <SelectItem value="vente">Vente (client)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.type === 'achat' ? (
              <div className="space-y-2">
                <Label>Fournisseur *</Label>
                <Input
                  value={formData.fournisseurNom}
                  onChange={(e) => setFormData({ ...formData, fournisseurNom: e.target.value })}
                  placeholder="Nom du fournisseur"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Client *</Label>
                <Input
                  value={formData.clientNom}
                  onChange={(e) => setFormData({ ...formData, clientNom: e.target.value })}
                  placeholder="Nom du client"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Produits</Label>
                <Button size="sm" variant="outline" onClick={addItem}>
                  <Plus className="mr-1 h-3 w-3" /> Ajouter
                </Button>
              </div>
              <div className="space-y-2">
                {formData.items.map((item, idx) => {
                  const montants = calculerMontantsItem(item.quantite, item.prixUnitaire, item.tauxTVA, formData.type as 'achat' | 'vente');
                  return (
                    <div key={idx} className="grid grid-cols-7 gap-2 items-end">
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Produit</Label>
                        <Select value={item.produitId} onValueChange={(v) => updateItem(idx, 'produitId', v)}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            {(produits ?? []).map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.nom}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Désignation</Label>
                        <Input
                          value={item.designation}
                          onChange={(e) => updateItem(idx, 'designation', e.target.value)}
                          placeholder="Produit"
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Qté</Label>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantite}
                          onChange={(e) => updateItem(idx, 'quantite', Number(e.target.value))}
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Prix</Label>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={item.prixUnitaire}
                          onChange={(e) => updateItem(idx, 'prixUnitaire', Number(e.target.value))}
                          className="h-8"
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeItem(idx)}
                          disabled={formData.items.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`grid gap-4 p-4 bg-muted rounded ${formData.type === 'vente' ? 'grid-cols-1' : 'grid-cols-3'}`}>
              {formData.type === 'vente' ? (
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-bold text-green-600">{formatCurrency(totaux.montantHT)}</p>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground">Total HT</p>
                    <p className="font-bold">{formatCurrency(totaux.montantHT)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total TVA</p>
                    <p className="font-bold">{formatCurrency(totaux.montantTVA)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total TTC</p>
                    <p className="font-bold text-green-600">{formatCurrency(totaux.montantTTC)}</p>
                  </div>
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>Annuler</Button>
            <Button
              disabled={createMut.isPending}
              onClick={handleCreate}
            >
              {createMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Supprimer la facture ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. La facture {deleteTarget?.numero} sera définitivement supprimée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Annuler</Button>
            <Button
              variant="destructive"
              disabled={deleteMut.isPending}
              onClick={handleDelete}
            >
              {deleteMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
