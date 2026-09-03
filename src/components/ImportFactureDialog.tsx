import { useState } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useCreateFacture } from '@/hooks/useQueries';

interface ImportFactureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'achat' | 'vente';
}

export function ImportFactureDialog({ open, onOpenChange, type }: ImportFactureDialogProps) {
  const createMut = useCreateFacture();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error('Le fichier CSV doit contenir au moins une ligne d\'en-tête et une ligne de données');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        return obj;
      });

      setPreview(data);
    };
    reader.readAsText(file);
  };

  const processImport = async () => {
    if (!file || preview.length === 0) return;

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    for (const row of preview) {
      try {
        const numero = row.numero || row.facture || `FAC-${Date.now()}`;
        const date = row.date || new Date().toISOString().split('T')[0];
        const fournisseurNom = type === 'achat' ? (row.fournisseur || row.fournisseur_nom || '') : undefined;
        const clientNom = type === 'vente' ? (row.client || row.client_nom || '') : undefined;
        
        const items = [{
          produitId: '',
          designation: row.designation || row.produit || row.description || '',
          quantite: parseInt(row.quantite || row.qte || '1'),
          prixUnitaire: parseFloat(row.prix || row.prix_unitaire || row.prix_unitaire || '0')
        }];

        const payload = {
          numero,
          date,
          type,
          fournisseurNom,
          clientNom,
          items,
          status: 'Validée',
        };

        await createMut.mutateAsync(payload);
        successCount++;
      } catch (error) {
        errorCount++;
        console.error('Erreur import ligne:', row, error);
      }
    }

    setIsProcessing(false);
    
    if (successCount > 0) {
      toast.success(`${successCount} facture(s) importée(s) avec succès`);
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} facture(s) n'ont pas pu être importées`);
    }

    setFile(null);
    setPreview([]);
    onOpenChange(false);
  };

  const reset = () => {
    setFile(null);
    setPreview([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importer des factures depuis CSV</DialogTitle>
          <DialogDescription>
            Importez vos factures {type === 'achat' ? 'd\'achat' : 'de vente'} depuis un fichier CSV
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label>Fichier CSV</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Cliquez pour sélectionner un fichier CSV
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Colonnes attendues: numero, date, designation, quantite, prix, {type === 'achat' ? 'fournisseur' : 'client'}
                </p>
              </label>
            </div>
          </div>

          {/* File Info */}
          {file && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-muted-foreground">({preview.length} lignes)</span>
              </div>
              <Button size="icon" variant="ghost" onClick={reset}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div className="space-y-2">
              <Label>Aperçu des données</Label>
              <div className="max-h-60 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      {Object.keys(preview[0]).map(key => (
                        <th key={key} className="p-2 text-left font-medium">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 5).map((row, index) => (
                      <tr key={index} className="border-t">
                        {Object.values(row).map((value: any, cellIndex) => (
                          <td key={cellIndex} className="p-2">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 5 && (
                  <p className="p-2 text-xs text-muted-foreground text-center">
                    ... et {preview.length - 5} autres lignes
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Format Guide */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Format CSV attendu
            </h4>
            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
              {type === 'achat' ? 'numero,date,fournisseur,designation,quantite,prix' : 'numero,date,client,designation,quantite,prix'}
            </pre>
            <p className="text-xs text-muted-foreground mt-2">
              Exemple: FAC-001,2026-09-03,Supplier A,Produit X,10,15.50
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={processImport}
            disabled={!file || preview.length === 0 || isProcessing}
          >
            {isProcessing ? 'Importation...' : 'Importer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}