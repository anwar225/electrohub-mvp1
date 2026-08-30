import { cn } from '@/lib/utils';
import type { FactureStatus, StockStatus } from '@/types';

export function FactureStatusBadge({ status }: { status: FactureStatus }) {
  const map: Record<FactureStatus, string> = {
    Draft: 'bg-muted text-muted-foreground border px-2 py-0.5 rounded-full text-xs',
    'Validée': 'bg-green-100 text-green-800 border px-2 py-0.5 rounded-full text-xs',
    'Archivée': 'bg-gray-100 text-gray-800 border px-2 py-0.5 rounded-full text-xs',
  };
  return (
    <span className={cn(map[status])}>
      {status}
    </span>
  );
}

export function StockStatusBadge({ status }: { status: StockStatus }) {
  const map: Record<StockStatus, string> = {
    OK: 'bg-green-100 text-green-800 border px-2 py-0.5 rounded-full text-xs',
    Bas: 'bg-yellow-100 text-yellow-800 border px-2 py-0.5 rounded-full text-xs',
    Rupture: 'bg-red-100 text-red-800 border px-2 py-0.5 rounded-full text-xs',
  };
  return <span className={cn(map[status])}>{status}</span>;
}

export function getStockStatus(stock: number, min: number): StockStatus {
  if (stock <= 0) return 'Rupture';
  if (stock < min) return 'Bas';
  return 'OK';
}
