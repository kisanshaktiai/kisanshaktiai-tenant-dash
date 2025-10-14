import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle2, XCircle, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
import { NDVIQueueProcessorService } from '@/services/NDVIQueueProcessorService';
import { toast } from 'sonner';

interface QueueItem {
  id: string;
  tenant_id: string;
  land_ids: string[];
  tile_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  batch_size: number;
  processed_count: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  retry_count?: number;
  last_error?: string;
  processing_duration_ms?: number;
  metadata?: any;
}

export const NDVIProcessingStatus: React.FC = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchQueueStatus = async () => {
    if (!currentTenant?.id) return;

    try {
      const data = await NDVIQueueProcessorService.getQueueStatus(currentTenant.id);
      // Map the data to match QueueItem interface
      const mappedData: QueueItem[] = (data || []).map((item: any) => ({
        id: item.id,
        tenant_id: item.tenant_id || currentTenant.id,
        land_ids: item.land_ids || [],
        tile_id: item.tile_id || '',
        status: item.status || 'queued',
        batch_size: item.batch_size || item.land_ids?.length || 0,
        processed_count: item.processed_count || 0,
        created_at: item.created_at,
        started_at: item.started_at,
        completed_at: item.completed_at,
        retry_count: item.retry_count || 0,
        last_error: item.last_error,
        processing_duration_ms: item.processing_duration_ms,
        metadata: item.metadata,
      }));
      setQueueItems(mappedData);
    } catch (error) {
      console.error('Failed to fetch queue status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerProcessing = async () => {
    setIsProcessing(true);
    try {
      toast.info('Starting queue processor...');
      const result = await NDVIQueueProcessorService.processQueue(10);
      
      if (result.success) {
        toast.success(`✅ Processed ${result.processed || 0} items successfully`);
        await fetchQueueStatus();
      } else {
        toast.error(result.message || 'Processing failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to trigger processing');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchQueueStatus();

    // Set up real-time subscription
    if (!currentTenant?.id) return;

    const channel = supabase
      .channel('queue-status-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ndvi_request_queue',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        () => {
          fetchQueueStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'processing': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      case 'failed': return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      default: return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'processing': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const stats = {
    total: queueItems.length,
    queued: queueItems.filter(i => i.status === 'queued').length,
    processing: queueItems.filter(i => i.status === 'processing').length,
    completed: queueItems.filter(i => i.status === 'completed').length,
    failed: queueItems.filter(i => i.status === 'failed').length,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="w-5 h-5" />
              Processing Queue Status
            </CardTitle>
            <CardDescription>Real-time NDVI processing pipeline monitoring</CardDescription>
          </div>
          <Button
            onClick={triggerProcessing}
            disabled={isProcessing || stats.queued === 0}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
            Process Now
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistics */}
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.queued}</div>
            <div className="text-xs text-muted-foreground">Queued</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
            <div className="text-xs text-muted-foreground">Processing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </div>
        </div>

        {/* Progress Bar */}
        {stats.total > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">
                {Math.round((stats.completed / stats.total) * 100)}%
              </span>
            </div>
            <Progress value={(stats.completed / stats.total) * 100} className="h-2" />
          </div>
        )}

        {/* Queue Items */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : queueItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No items in queue</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {queueItems.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(item.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {item.land_ids?.length || 0} lands
                      </span>
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Tile: {item.tile_id} • Created: {new Date(item.created_at).toLocaleString()}
                    </div>
                    {item.retry_count && item.retry_count > 0 && (
                      <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                        <AlertTriangle className="w-3 h-3" />
                        Retry {item.retry_count}/3
                      </div>
                    )}
                    {item.last_error && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Error: {item.last_error}
                      </div>
                    )}
                  </div>
                </div>
                {item.status === 'completed' && item.processed_count && (
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      {item.processed_count} processed
                    </div>
                    {item.processing_duration_ms && (
                      <div className="text-xs text-muted-foreground">
                        {(item.processing_duration_ms / 1000).toFixed(1)}s
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
