import { AdminResetDatabase } from '@/components/AdminResetDatabase';

export function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Administration</h1>
        <p className="text-muted-foreground">Outils d'administration du système</p>
      </div>

      <AdminResetDatabase />
    </div>
  );
}
