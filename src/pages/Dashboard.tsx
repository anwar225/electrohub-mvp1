import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  FileText,
  PackageX,
  Boxes,
  Plus,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useFactures, useProduits } from '@/hooks/useQueries';
import { FactureStatusBadge, getStockStatus } from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/formatting';

function isSameMonth(iso: string, ref: Date) {
  const d = new Date(iso);
  return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();
}

export function Dashboard() {
  const { data: factures, isLoading: lf } = useFactures();
  const { data: produits, isLoading: lp } = useProduits();

  const stats = useMemo(() => {
    const now = new Date();
    const monthFactures = (factures ?? []).filter((f) => isSameMonth(f.date, now));
    const caMois = monthFactures
      .filter((f) => f.status === 'Validée')
      .reduce((s, f) => s + f.montantTotal, 0);
    const rupture = (produits ?? []).filter((p) => getStockStatus(p.stock, p.stockMin) === 'Rupture').length;
    return {
      caMois,
      nbFactMois: monthFactures.length,
      rupture,
      totalProduits: (produits ?? []).length,
    };
  }, [factures, produits]);

  const recent = useMemo(
    () => [...(factures ?? [])].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 5),
    [factures]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground">
          Vue d'ensemble de votre activité ce mois-ci
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          loading={lf}
          title="Chiffre d'affaires (mois)"
          value={formatCurrency(stats.caMois)}
          icon={TrendingUp}
          tint="primary"
        />
        <Kpi
          loading={lf}
          title="Factures (mois)"
          value={String(stats.nbFactMois)}
          icon={FileText}
          tint="warning"
        />
        <Kpi
          loading={lp}
          title="Produits en rupture"
          value={String(stats.rupture)}
          icon={PackageX}
          tint="destructive"
        />
        <Kpi
          loading={lp}
          title="Total inventaire"
          value={String(stats.totalProduits)}
          icon={Boxes}
          tint="success"
        />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2.5">
        <Button asChild>
          <Link to="/factures">
            <Plus className="mr-2 h-4 w-4" /> Nouvelle facture
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/stock">
            <Eye className="mr-2 h-4 w-4" /> Voir le stock
          </Link>
        </Button>
      </div>

      {/* Recent factures */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Dernières factures</CardTitle>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-primary">
            <Link to="/factures">
              Tout voir <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {lf ? (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Aucune facture</p>
          ) : (
            recent.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{f.numero}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {f.type === 'achat' ? f.fournisseurNom : f.clientNom || '-'} · {formatDate(f.date)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <FactureStatusBadge status={f.status} />
                  <span className="text-sm font-semibold tabular-nums">
                    {formatCurrency(f.montantTotal)}
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const tints: Record<string, string> = {
  primary: 'bg-primary/10 text-primary',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
  success: 'bg-success/10 text-success',
};

function Kpi({
  title,
  value,
  icon: Icon,
  loading,
  tint,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  loading: boolean;
  tint: keyof typeof tints | string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <p className="text-2xl font-bold tracking-tight tabular-nums">{value}</p>
            )}
          </div>
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tints[tint]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
