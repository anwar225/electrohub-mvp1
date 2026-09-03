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
        toast.error('Le fichier CSV doit contenir des données');
        return;
      }

      // Detect format: standard CSV or complex invoice format
      const firstLine = lines[0];
      const isComplexFormat = firstLine.includes(',') && 
                             (firstLine.includes('Numéro') || firstLine.includes('Numéro Bon') || firstLine.includes('Code Client')) &&
                             !firstLine.toLowerCase().includes('numero,date');

      if (isComplexFormat) {
        // Parse complex invoice format (like Moulime format)
        const invoiceData = parseComplexInvoiceFormat(lines);
        setPreview([invoiceData]);
      } else {
        // Parse standard CSV format
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
      }
    };
    reader.readAsText(file);
  };

  const parseComplexInvoiceFormat = (lines: string[]) => {
    const invoice: any = {
      numero: '',
      date: '',
      client: '',
      fournisseur: '',
      items: []
    };

    let currentSection = 'header';
    let itemsStartIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) continue;

      // Detect items section header
      if (line.includes('Code Article') || line.includes('Désignation') || line.includes('Quantité')) {
        currentSection = 'items';
        itemsStartIndex = i + 1;
        continue;
      }

      // Detect totals section
      if (line.includes('TOTAUX') || line.includes('Sous-total') || line.includes('Total HT')) {
        currentSection = 'totals';
        continue;
      }

      if (currentSection === 'header') {
        const parts = line.split(',');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts[1].trim();
          
          if (key.includes('Numéro') || key.includes('Bon') || key.includes('Commande')) {
            invoice.numero = value;
          } else if (key.includes('Date')) {
            // Convert DD/MM/YYYY to YYYY-MM-DD
            const dateParts = value.split('/');
            if (dateParts.length === 3) {
              invoice.date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
            }
          } else if (key.includes('Client')) {
            invoice.client = value;
          } else if (key.includes('Fournisseur')) {
            invoice.fournisseur = value;
          }
        }
      } else if (currentSection === 'items' && itemsStartIndex !== -1 && i >= itemsStartIndex) {
        const parts = line.split(',');
        if (parts.length >= 4) {
          invoice.items.push({
            code: parts[0]?.trim() || '',
            designation: parts[1]?.trim() || '',
            quantite: parseInt(parts[2]?.trim() || '1'),
            prixUnitaire: parseFloat(parts[3]?.trim() || '0'),
            montant: parseFloat(parts[4]?.trim() || '0'),
            taxe: parts[5]?.trim() || '0%',
            montantTTC: parseFloat(parts[6]?.trim() || '0')
          });
        }
      }
    }

    // Set default date if not found
    if (!invoice.date) {
      invoice.date = new Date().toISOString().split('T')[0];
    }

    // Set default client/fournisseur from invoice type if not found
    if (type === 'achat' && !invoice.fournisseur && invoice.client) {
      invoice.fournisseur = invoice.client;
    }
    if (type === 'vente' && !invoice.client && invoice.fournisseur) {
      invoice.client = invoice.fournisseur;
    }

    return invoice;
  };

  const processImport = async () => {
    if (!file || preview.length === 0) return;

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;
    let errorDetails: string[] = [];

    // Check if this is complex format (single invoice with items)
    const isComplexFormat = preview.length === 1 && preview[0].items;

    if (isComplexFormat) {
      // Process complex invoice format
      try {
        const invoiceData = preview[0];
        const numero = invoiceData.numero || `FAC-${Date.now()}`;
        const date = invoiceData.date || new Date().toISOString().split('T')[0];
        const fournisseurNom = type === 'achat' ? (invoiceData.fournisseur || invoiceData.client || '') : undefined;
        const clientNom = type === 'vente' ? (invoiceData.client || '') : undefined;
        
        // Check if we have items
        if (!invoiceData.items || invoiceData.items.length === 0) {
          errorCount = 1;
          errorDetails.push('Aucun article trouvé dans le fichier CSV');
          toast.error('Aucun article trouvé dans le fichier CSV');
        } else {
          const items = invoiceData.items.map((item: any) => ({
            produitId: '',
            designation: item.designation || item.Désignation || '',
            quantite: item.quantite || parseInt(item.Quantité) || 1,
            prixUnitaire: item.prixUnitaire || parseFloat(item['P.U.']) || 0
          }));

          const payload = {
            numero,
            date,
            type,
            fournisseurNom,
            clientNom,
            items,
            status: 'Validée',
          };

          console.log('Import payload:', payload);
          await createMut.mutateAsync(payload);
          successCount = 1;
        }
      } catch (error) {
        errorCount = 1;
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        errorDetails.push(errorMessage);
        console.error('Erreur import facture complexe:', error);
        toast.error(`Erreur lors de l'import: ${errorMessage}`);
      }
    } else {
      // Process standard CSV format (multiple invoices)
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
          const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
          errorDetails.push(`${row.numero || 'Sans numéro'}: ${errorMessage}`);
          console.error('Erreur import ligne:', row, error);
        }
      }
    }

    setIsProcessing(false);
    
    if (successCount > 0) {
      toast.success(`${successCount} facture(s) importée(s) avec succès`);
    }
    if (errorCount > 0) {
      const errorSummary = errorDetails.slice(0, 3).join('; ');
      const moreErrors = errorDetails.length > 3 ? `... et ${errorDetails.length - 3} autres erreurs` : '';
      toast.error(`${errorCount} erreur(s): ${errorSummary}${moreErrors}`);
    }

    if (errorDetails.length > 0) {
      console.log('Détails des erreurs:', errorDetails);
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
            Importez vos factures {type === 'achat' ? 'd\'achat' : 'de vente'} depuis un fichier CSV (format standard ou type Moulime)
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
                  Cliquez pour sélectionner un fichier CSV (format standard ou type Moulime)
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supporte les formats standard et complexes (avec sections en-tête, articles, totaux)
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
                <span className="text-xs text-muted-foreground">
                  ({preview.length === 1 && preview[0].items ? `${preview[0].items.length} articles` : `${preview.length} lignes`})
                </span>
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
                {preview.length === 1 && preview[0].items ? (
                  // Complex format preview
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="font-medium">Numéro:</span> {preview[0].numero}</div>
                      <div><span className="font-medium">Date:</span> {preview[0].date}</div>
                      <div><span className="font-medium">Client:</span> {preview[0].client}</div>
                      <div><span className="font-medium">Fournisseur:</span> {preview[0].fournisseur}</div>
                    </div>
                    <div>
                      <p className="font-medium text-sm mb-2">Articles ({preview[0].items.length}):</p>
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="p-2 text-left">Désignation</th>
                            <th className="p-2 text-right">Qté</th>
                            <th className="p-2 text-right">Prix</th>
                          </tr>
                        </thead>
                        <tbody>
                          {preview[0].items.slice(0, 5).map((item: any, index: number) => (
                            <tr key={index} className="border-t">
                              <td className="p-2">{item.designation}</td>
                              <td className="p-2 text-right">{item.quantite}</td>
                              <td className="p-2 text-right">{item.prixUnitaire.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {preview[0].items.length > 5 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          ... et {preview[0].items.length - 5} autres articles
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  // Standard CSV preview
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
                )}
                {preview.length > 5 && !(preview.length === 1 && preview[0].items) && (
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
              Formats CSV supportés
            </h4>
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-medium mb-1">Format standard (multiple factures):</p>
                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                  {type === 'achat' ? 'numero,date,fournisseur,designation,quantite,prix' : 'numero,date,client,designation,quantite,prix'}
                </pre>
              </div>
              <div>
                <p className="font-medium mb-1">Format complexe (type Moulime):</p>
                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                  Numéro Bon Livraison,2026004449
Client,GHILANI MED
Date,31/07/2026
Code Article,Désignation,Quantité,P.U.,Montant,Taxe %,Montant TTC
C-887FTVFM68,Ref GR735FTHFK FITCO,1,4400.00,4400.00,20.00%,5280.00
                </pre>
              </div>
            </div>
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