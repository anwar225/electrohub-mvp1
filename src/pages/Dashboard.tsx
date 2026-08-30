import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  FileText,
  PackageX,
  Boxes,
  Plus,
  PackagePlus,
  Eye,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
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

  const weeklyData = useMemo(() => buildWeeklyData(factures ?? []), [factures]);
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
            <PackagePlus className="mr-2 h-4 w-4" /> Ajouter stock
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/stock">
            <Eye className="mr-2 h-4 w-4" /> Voir tous les produits
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Ventes par semaine (30 derniers jours)</CardTitle>
          </CardHeader>
          <CardContent>
            {lf ? (
              <Skeleton className="h-[260px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={weeklyData} margin={{ left: -10, right: 10, top: 5 }}>
                  <defs>
                    <linearGradient id="ca" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [formatCurrency(v), 'Ventes']}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    fill="url(#ca)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent factures */}
        <Card className="lg:col-span-2">
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

function buildWeeklyData(factures: { date: string; montantTotal: number; status: string }[]) {
  const weeks: { label: string; total: number }[] = [];
  const now = new Date();
  for (let i = 3; i >= 0; i--) {
    const end = new Date(now);
    end.setDate(now.getDate() - i * 7);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    const total = factures
      .filter((f) => {
        if (f.status !== 'Validée') return false;
        const d = new Date(f.date);
        return d >= start && d <= end;
      })
      .reduce((s, f) => s + f.montantTotal, 0);
    weeks.push({
      label: `S${4 - i}`,
      total,
    });
  }
  return weeks;
}
