import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface QueueStats {
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  total: number;
}

export function NDVIQueueStatus() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['ndvi-queue-status'],
    queryFn: async (): Promise<QueueStats> => {
      const { data, error } = await supabase
        .from('ndvi_request_queue')
        .select('status');

      if (error) throw error;

      const stats: QueueStats = {
        queued: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        total: data?.length || 0
      };

      data?.forEach((item: any) => {
        if (item.status === 'queued') stats.queued++;
        else if (item.status === 'processing') stats.processing++;
        else if (item.status === 'completed') stats.completed++;
        else if (item.status === 'failed') stats.failed++;
      });

      return stats;
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const hasActiveWork = stats.queued > 0 || stats.processing > 0;
  const hasFailures = stats.failed > 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            NDVI Processing Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Queued</span>
              </div>
              <p className="text-2xl font-bold">{stats.queued}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
                <span className="text-sm text-muted-foreground">Processing</span>
              </div>
              <p className="text-2xl font-bold">{stats.processing}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Completed</span>
              </div>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-muted-foreground">Failed</span>
              </div>
              <p className="text-2xl font-bold">{stats.failed}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {hasActiveWork && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <AlertDescription>
            NDVI data is being processed. This usually takes 2-5 minutes. 
            The data will appear automatically when ready.
          </AlertDescription>
        </Alert>
      )}

      {hasFailures && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Some NDVI requests failed to process. Check the logs or try refreshing the data.
          </AlertDescription>
        </Alert>
      )}

      {!hasActiveWork && stats.total === 0 && (
        <Alert>
          <AlertDescription>
            No NDVI requests in queue. Click "Refresh NDVI" to fetch new satellite data.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
