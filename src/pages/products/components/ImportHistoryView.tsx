
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';
import { productImportService } from '@/services/ProductImportService';
import { format } from 'date-fns';

export default function ImportHistoryView() {
  const { currentTenant } = useTenantIsolation();

  const { data: history, isLoading } = useQuery({
    queryKey: ['import-history', currentTenant?.id],
    queryFn: () => productImportService.getImportHistory(currentTenant!.id),
    enabled: !!currentTenant,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5" />
          <CardTitle>Import History</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : history && history.length > 0 ? (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {history.map((record) => (
                <Card key={record.id} className="border-l-4" style={{
                  borderLeftColor: record.items_failed > 0 ? 'hsl(var(--destructive))' : 'hsl(var(--success))'
                }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant={record.import_type === 'product' ? 'default' : 'secondary'}>
                            {record.import_type}
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(record.created_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                      {record.items_failed === 0 ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-3 text-center">
                      <div className="p-2 bg-success/10 rounded">
                        <p className="text-xl font-bold text-success">{record.items_imported}</p>
                        <p className="text-xs text-muted-foreground">Imported</p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded">
                        <p className="text-xl font-bold text-primary">{record.items_updated}</p>
                        <p className="text-xs text-muted-foreground">Updated</p>
                      </div>
                      <div className="p-2 bg-destructive/10 rounded">
                        <p className="text-xl font-bold text-destructive">{record.items_failed}</p>
                        <p className="text-xs text-muted-foreground">Failed</p>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <p className="text-xl font-bold">{record.items_skipped}</p>
                        <p className="text-xs text-muted-foreground">Skipped</p>
                      </div>
                    </div>

                    {record.error_log && Array.isArray(record.error_log) && record.error_log.length > 0 && (
                      <div className="mt-3 p-2 bg-destructive/10 rounded">
                        <p className="text-xs font-semibold mb-1">Errors:</p>
                        <ul className="text-xs space-y-1 text-destructive">
                          {record.error_log.slice(0, 3).map((error: any, idx: number) => (
                            <li key={idx}>• {error.item}: {error.error}</li>
                          ))}
                          {record.error_log.length > 3 && (
                            <li>... and {record.error_log.length - 3} more errors</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No import history yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Start importing products or categories to see history here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
