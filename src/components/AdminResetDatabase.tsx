import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Database } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface AdminResetDatabaseProps {
  className?: string;
}

export function AdminResetDatabase({ className }: AdminResetDatabaseProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { token } = useAuth();

  const handleResetDatabase = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsResetting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/reset-database`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Base de données réinitialisée avec succès');
        setShowConfirm(false);
        // Reload the page to reflect the empty state
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error(`Erreur: ${data.error || 'Échec de la réinitialisation'}`);
      }
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      toast.error('Erreur de connexion au serveur');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border border-red-200 bg-red-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">Réinitialiser la base de données</h3>
            <p className="text-sm text-red-700 mt-1">
              Cette action va supprimer TOUTES les données de la base de données (factures, produits, utilisateurs).
              Cette opération est irréversible.
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            onClick={handleResetDatabase}
            disabled={isResetting}
            variant="destructive"
            size="sm"
          >
            <Database className="h-4 w-4 mr-2" />
            {isResetting ? 'Réinitialisation en cours...' : showConfirm ? '⚠️ Confirmer la suppression' : 'Réinitialiser la base de données'}
          </Button>

          {showConfirm && (
            <Button
              onClick={() => setShowConfirm(false)}
              disabled={isResetting}
              variant="outline"
              size="sm"
            >
              Annuler
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
