
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle2, XCircle, Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';
import { useAppSelector } from '@/store/hooks';
import { productImportService, type ImportOptions, type ImportPreview } from '@/services/ProductImportService';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import type { MasterProduct, MasterProductCategory } from '@/services/MasterDataService';

interface ImportPreviewModalProps {
  type: 'product' | 'category';
  items: (MasterProduct | MasterProductCategory)[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportPreviewModal({ type, items, onClose, onSuccess }: ImportPreviewModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentTenant } = useTenantIsolation();
  const { user } = useAppSelector(state => state.auth);

  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [previews, setPreviews] = useState<ImportPreview[]>([]);
  const [options, setOptions] = useState<ImportOptions>({
    skipDuplicates: true,
    updateExisting: false,
    applyPriceMarkup: 0,
    setAsActive: true,
    setAsFeatured: false,
    defaultStock: 0,
  });

  useEffect(() => {
    loadPreview();
  }, []);

  const loadPreview = async () => {
    if (!currentTenant) return;

    try {
      setIsLoadingPreview(true);
      let previewData: ImportPreview[];

      if (type === 'product') {
        previewData = await productImportService.previewProductImport(
          currentTenant.id,
          items as MasterProduct[],
          options
        );
      } else {
        previewData = await productImportService.previewCategoryImport(
          currentTenant.id,
          items as MasterProductCategory[]
        );
      }

      setPreviews(previewData);
    } catch (error: any) {
      toast({
        title: 'Preview failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleImport = async () => {
    if (!currentTenant || !user) return;

    try {
      setIsImporting(true);
      let result;

      if (type === 'product') {
        result = await productImportService.importProducts(
          currentTenant.id,
          user.id,
          items as MasterProduct[],
          options
        );
      } else {
        result = await productImportService.importCategories(
          currentTenant.id,
          user.id,
          items as MasterProductCategory[],
          options
        );
      }

      if (result.success || result.imported > 0 || result.updated > 0) {
        toast({
          title: 'Import completed',
          description: `Imported: ${result.imported}, Updated: ${result.updated}, Failed: ${result.failed}, Skipped: ${result.skipped}`,
        });

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['product-categories'] });
        queryClient.invalidateQueries({ queryKey: ['import-history'] });

        onSuccess();
      } else {
        toast({
          title: 'Import failed',
          description: 'No items were imported. Check the errors below.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Import failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const stats = previews.reduce(
    (acc, p) => {
      if (p.action === 'create') acc.new++;
      else if (p.action === 'update') acc.update++;
      else if (p.action === 'skip') acc.skip++;
      return acc;
    },
    { new: 0, update: 0, skip: 0 }
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Import Preview - {type === 'product' ? 'Products' : 'Categories'}</DialogTitle>
          <DialogDescription>
            Review the items that will be imported and configure import options
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium">New Items</p>
                <p className="text-2xl font-bold">{stats.new}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
              <Info className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Updates</p>
                <p className="text-2xl font-bold">{stats.update}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <XCircle className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Skipped</p>
                <p className="text-2xl font-bold">{stats.skip}</p>
              </div>
            </div>
          </div>

          {/* Options for Products */}
          {type === 'product' && (
            <div className="space-y-4 p-4 bg-accent/50 rounded-lg">
              <h4 className="font-semibold text-sm">Import Options</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="skip-duplicates">Skip Duplicates</Label>
                  <Switch
                    id="skip-duplicates"
                    checked={options.skipDuplicates}
                    onCheckedChange={(checked) => setOptions({ ...options, skipDuplicates: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="update-existing">Update Existing</Label>
                  <Switch
                    id="update-existing"
                    checked={options.updateExisting}
                    onCheckedChange={(checked) => setOptions({ ...options, updateExisting: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="set-active">Set as Active</Label>
                  <Switch
                    id="set-active"
                    checked={options.setAsActive}
                    onCheckedChange={(checked) => setOptions({ ...options, setAsActive: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="set-featured">Set as Featured</Label>
                  <Switch
                    id="set-featured"
                    checked={options.setAsFeatured}
                    onCheckedChange={(checked) => setOptions({ ...options, setAsFeatured: checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price-markup">Price Markup (%)</Label>
                  <Input
                    id="price-markup"
                    name="priceMarkup"
                    type="number"
                    min="0"
                    max="100"
                    value={options.applyPriceMarkup}
                    onChange={(e) => setOptions({ ...options, applyPriceMarkup: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-stock">Default Stock</Label>
                  <Input
                    id="default-stock"
                    name="defaultStock"
                    type="number"
                    min="0"
                    value={options.defaultStock}
                    onChange={(e) => setOptions({ ...options, defaultStock: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Preview List */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Items to Import ({previews.length})</h4>
            <ScrollArea className="h-[300px] border rounded-md p-4">
              {isLoadingPreview ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-2">
                  {previews.map((preview, index) => (
                    <div key={index} className="flex items-start justify-between p-3 bg-card border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{preview.masterItem.name}</p>
                        {type === 'product' && (
                          <p className="text-xs text-muted-foreground mt-1">
                            SKU: {(preview.masterItem as MasterProduct).sku}
                          </p>
                        )}
                        {preview.conflicts && preview.conflicts.length > 0 && (
                          <Alert className="mt-2" variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                              {preview.conflicts.join(', ')}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                      <Badge
                        variant={
                          preview.action === 'create'
                            ? 'default'
                            : preview.action === 'update'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {preview.action}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isImporting}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isLoadingPreview || isImporting || previews.length === 0}>
            {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Import {stats.new + stats.update} Items
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
