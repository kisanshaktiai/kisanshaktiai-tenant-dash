import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle2, XCircle, Info, Search, Sparkles, TrendingUp, Package, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';
import { useAppSelector } from '@/store/hooks';
import { productImportService, type ImportOptions, type ImportPreview } from '@/services/ProductImportService';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import type { MasterProduct, MasterProductCategory } from '@/services/MasterDataService';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<'all' | 'create' | 'update' | 'skip'>('all');
  const [optionsExpanded, setOptionsExpanded] = useState(true);
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
      console.error('Preview error:', error);
      toast({
        title: 'Preview failed',
        description: error.message || 'Failed to load import preview. Please check console for details.',
        variant: 'destructive',
      });
      // Set empty previews on error so UI doesn't hang
      setPreviews([]);
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

  // Filtered and searched previews
  const filteredPreviews = useMemo(() => {
    return previews.filter(preview => {
      // Filter by action
      if (filterAction !== 'all' && preview.action !== filterAction) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const name = preview.masterItem.name.toLowerCase();
        const sku = type === 'product' ? (preview.masterItem as MasterProduct).sku?.toLowerCase() || '' : '';
        return name.includes(query) || sku.includes(query);
      }
      
      return true;
    });
  }, [previews, searchQuery, filterAction, type]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 gap-0 flex flex-col">
        {/* Header with Gradient */}
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Import Preview</DialogTitle>
              <DialogDescription className="text-base mt-1">
                {type === 'product' ? 'Products' : 'Categories'} - Review and configure your import
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="flex flex-col h-full">
            {/* Statistics Cards */}
            <div className="px-6 pt-4">
              <div className="grid grid-cols-4 gap-3">
              <div className="relative overflow-hidden rounded-xl border-2 border-border bg-gradient-to-br from-card to-card/50 p-4 transition-all hover:shadow-lg hover:border-primary/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Items</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      {items.length}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-xl border-2 border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-500/5 p-4 transition-all hover:shadow-lg hover:border-green-500/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">New Items</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {stats.new}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-xl border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-4 transition-all hover:shadow-lg hover:border-blue-500/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Updates</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.update}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-xl border-2 border-border bg-gradient-to-br from-muted to-muted/50 p-4 transition-all hover:shadow-lg hover:border-muted-foreground/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Skipped</p>
                    <p className="text-3xl font-bold text-muted-foreground">
                      {stats.skip}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted-foreground/10">
                    <XCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </div>

            {/* Import Options - Collapsible */}
            {type === 'product' && (
              <div className="px-6 pt-4">
              <Collapsible open={optionsExpanded} onOpenChange={setOptionsExpanded}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto hover:bg-accent/50 rounded-xl border-2 border-border transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Settings className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Import Configuration</p>
                        <p className="text-xs text-muted-foreground">
                          Customize how items are imported
                        </p>
                      </div>
                    </div>
                    {optionsExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <div className="p-4 bg-gradient-to-br from-accent/50 to-accent/30 rounded-xl border-2 border-border space-y-4">
                    {/* Toggle Options */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border hover:border-primary/50 transition-all">
                        <div className="flex-1 mr-3">
                          <Label htmlFor="skip-duplicates" className="font-medium cursor-pointer">
                            Skip Duplicates
                          </Label>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Ignore items that already exist
                          </p>
                        </div>
                        <Switch
                          id="skip-duplicates"
                          checked={options.skipDuplicates}
                          onCheckedChange={(checked) => setOptions({ ...options, skipDuplicates: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border hover:border-primary/50 transition-all">
                        <div className="flex-1 mr-3">
                          <Label htmlFor="update-existing" className="font-medium cursor-pointer">
                            Update Existing
                          </Label>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Overwrite existing items
                          </p>
                        </div>
                        <Switch
                          id="update-existing"
                          checked={options.updateExisting}
                          onCheckedChange={(checked) => setOptions({ ...options, updateExisting: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border hover:border-primary/50 transition-all">
                        <div className="flex-1 mr-3">
                          <Label htmlFor="set-active" className="font-medium cursor-pointer">
                            Set as Active
                          </Label>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Make items visible immediately
                          </p>
                        </div>
                        <Switch
                          id="set-active"
                          checked={options.setAsActive}
                          onCheckedChange={(checked) => setOptions({ ...options, setAsActive: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border hover:border-primary/50 transition-all">
                        <div className="flex-1 mr-3">
                          <Label htmlFor="set-featured" className="font-medium cursor-pointer">
                            Set as Featured
                          </Label>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Highlight in catalog
                          </p>
                        </div>
                        <Switch
                          id="set-featured"
                          checked={options.setAsFeatured}
                          onCheckedChange={(checked) => setOptions({ ...options, setAsFeatured: checked })}
                        />
                      </div>
                    </div>

                    <Separator className="bg-border/50" />

                    {/* Number Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price-markup" className="font-medium flex items-center gap-2">
                          <TrendingUp className="h-3.5 w-3.5 text-primary" />
                          Price Markup (%)
                        </Label>
                        <Input
                          id="price-markup"
                          name="priceMarkup"
                          type="number"
                          min="0"
                          max="200"
                          value={options.applyPriceMarkup}
                          onChange={(e) => setOptions({ ...options, applyPriceMarkup: parseFloat(e.target.value) || 0 })}
                          className="border-2 focus:border-primary transition-all"
                        />
                        <p className="text-xs text-muted-foreground">
                          Add margin to imported prices
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="default-stock" className="font-medium flex items-center gap-2">
                          <Package className="h-3.5 w-3.5 text-primary" />
                          Default Stock Quantity
                        </Label>
                        <Input
                          id="default-stock"
                          name="defaultStock"
                          type="number"
                          min="0"
                          value={options.defaultStock}
                          onChange={(e) => setOptions({ ...options, defaultStock: parseInt(e.target.value) || 0 })}
                          className="border-2 focus:border-primary transition-all"
                        />
                        <p className="text-xs text-muted-foreground">
                          Initial inventory level
                        </p>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {/* Search and Filter */}
            <div className="px-6 pt-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${type === 'product' ? 'products by name or SKU' : 'categories'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-2 focus:border-primary transition-all"
                />
              </div>
              <div className="flex items-center gap-2 bg-accent/50 rounded-lg p-1 border-2 border-border">
                {(['all', 'create', 'update', 'skip'] as const).map((action) => (
                  <Button
                    key={action}
                    variant={filterAction === action ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterAction(action)}
                    className={cn(
                      'capitalize transition-all',
                      filterAction === action && 'shadow-md'
                    )}
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredPreviews.length}</span> of{' '}
                <span className="font-semibold text-foreground">{previews.length}</span> items
              </p>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="h-7 text-xs"
                >
                  Clear search
                </Button>
              )}
            </div>
          </div>

            {/* Items List */}
            <div className="px-6 pt-3 pb-4 flex-1 min-h-0">
              <ScrollArea className="h-[300px] rounded-xl border-2 border-border bg-accent/30 p-3">
              {isLoadingPreview ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-sm text-muted-foreground">Analyzing items...</p>
                </div>
              ) : filteredPreviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Info className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">No items match your filters</p>
                </div>
              ) : (
                <div className="space-y-2 pr-3">
                  {filteredPreviews.map((preview, index) => (
                    <div
                      key={index}
                      className={cn(
                        'group relative overflow-hidden rounded-lg border-2 p-4 transition-all duration-300',
                        'hover:shadow-lg hover:-translate-y-0.5',
                        preview.action === 'create' && 'border-green-500/30 bg-green-500/5 hover:border-green-500/50',
                        preview.action === 'update' && 'border-blue-500/30 bg-blue-500/5 hover:border-blue-500/50',
                        preview.action === 'skip' && 'border-border bg-card/50 hover:border-muted-foreground/50'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                              {preview.masterItem.name}
                            </h4>
                          </div>
                          
                          {type === 'product' && (
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="font-mono">SKU: {(preview.masterItem as MasterProduct).sku}</span>
                              {(preview.masterItem as MasterProduct).brand && (
                                <>
                                  <span>•</span>
                                  <span>{(preview.masterItem as MasterProduct).brand}</span>
                                </>
                              )}
                            </div>
                          )}

                          {preview.conflicts && preview.conflicts.length > 0 && (
                            <Alert className="mt-3 border-orange-500/50 bg-orange-500/10" variant="destructive">
                              <AlertCircle className="h-4 w-4 text-orange-600" />
                              <AlertDescription className="text-xs text-orange-600">
                                {preview.conflicts.join(', ')}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>

                        <Badge
                          className={cn(
                            'capitalize font-semibold',
                            preview.action === 'create' && 'bg-green-500/10 text-green-600 border-green-500/30 dark:text-green-400',
                            preview.action === 'update' && 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400',
                            preview.action === 'skip' && 'bg-muted text-muted-foreground border-muted-foreground/30'
                          )}
                          variant="outline"
                        >
                          {preview.action}
                        </Badge>
                      </div>

                      {/* Hover gradient effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                  ))}
                </div>
              )}
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Footer - Always Visible */}
        <DialogFooter className="px-6 py-4 border-t bg-gradient-to-r from-accent/30 to-transparent flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              Ready to import <span className="font-bold text-foreground">{stats.new + stats.update}</span> items
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isImporting}
                className="border-2 hover:border-primary/50 transition-all"
              >
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={isLoadingPreview || isImporting || (stats.new + stats.update === 0)}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
              >
                {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Sparkles className="mr-2 h-4 w-4" />
                Import {stats.new + stats.update} Items
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
