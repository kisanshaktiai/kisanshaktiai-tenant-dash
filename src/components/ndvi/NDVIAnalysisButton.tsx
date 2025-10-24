import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Satellite, Loader2, Play, CheckCircle2, Clock, AlertCircle, Zap } from 'lucide-react';
import { useNDVIQueue } from '@/hooks/data/useNDVIQueue';
import { useAutoNDVIAnalysis } from '@/hooks/data/useAutoNDVIAnalysis';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export const NDVIAnalysisButton: React.FC = () => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [instantMode, setInstantMode] = useState(false);
  const queryClient = useQueryClient();
  
  const {
    processQueue,
    isProcessingQueue,
    queueCount,
    activeJobs,
  } = useNDVIQueue();

  const {
    landsNeedingUpdate,
    landsCount,
    isLoading: isCheckingLands,
    createAutoRequest,
    isCreating,
  } = useAutoNDVIAnalysis();

  const handleAutoQueue = async () => {
    try {
      const results = await createAutoRequest.mutateAsync({ instant: instantMode });
      setShowConfirmDialog(false);
      
      if (instantMode) {
        // Check if any result has instant_result
        const hasInstantResults = results.some((r: any) => r.result?.instant_result);
        
        if (hasInstantResults) {
          toast.success('✅ NDVI processed instantly!', {
            description: `Processed ${landsCount} land(s) successfully`,
          });
          
          // Refetch NDVI data
          queryClient.invalidateQueries({ queryKey: ['ndvi-data'] });
          queryClient.invalidateQueries({ queryKey: ['ndvi-land-data'] });
          queryClient.invalidateQueries({ queryKey: ['farmers'] });
          queryClient.invalidateQueries({ queryKey: ['lands-needing-ndvi-update'] });
        } else {
          toast.success('NDVI analysis request created', {
            description: 'Processing will complete shortly',
          });
        }
      } else {
        toast.success('NDVI analysis queued', {
          description: `${landsCount} land(s) will be processed`,
        });
      }
    } catch (error) {
      console.error('Failed to create NDVI analysis requests:', error);
      toast.error('Failed to process NDVI', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleProcessQueue = () => {
    processQueue();
  };

  const openDialog = (instant: boolean) => {
    setInstantMode(instant);
    setShowConfirmDialog(true);
  };

  return (
    <div className="flex gap-2">
      {/* Smart NDVI Analysis Request */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <div className="flex gap-2">
          <Button
            onClick={() => openDialog(false)}
            disabled={isCheckingLands || isCreating}
            variant="outline"
            className="gap-2"
          >
            {isCheckingLands ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Satellite className="w-4 h-4" />
                Queue Analysis
                {landsCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {landsCount}
                  </Badge>
                )}
              </>
            )}
          </Button>

          <Button
            onClick={() => openDialog(true)}
            disabled={isCheckingLands || isCreating || landsCount === 0}
            className="gap-2"
          >
            {isCheckingLands ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                ⚡ Instant Analysis
                {landsCount > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-white/20">
                    {landsCount}
                  </Badge>
                )}
              </>
            )}
          </Button>
        </div>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {instantMode ? '⚡ Instant NDVI Analysis' : 'Queue NDVI Analysis'}
            </DialogTitle>
            <DialogDescription>
              {instantMode 
                ? 'Process NDVI data immediately for lands requiring updates'
                : 'Automatically queue lands that need vegetation health monitoring'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {isCheckingLands ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : landsCount === 0 ? (
              <Alert>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  All lands have recent NDVI data (updated within 24 hours). No analysis needed right now.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Alert>
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  <AlertDescription>
                    <strong>{landsCount} land{landsCount !== 1 ? 's' : ''}</strong> require NDVI updates:
                    <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
                      <li>New lands (created within last 7 days)</li>
                      <li>Lands with data older than 24 hours</li>
                      <li>Lands never processed</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {instantMode && (
                  <Alert className="border-primary">
                    <Zap className="h-4 w-4 text-primary" />
                    <AlertDescription>
                      <strong>⚡ Instant Processing Mode</strong>
                      <p className="mt-1 text-sm">
                        NDVI data will be processed immediately (may take 1-2 minutes per land). 
                        Results will be available in real-time.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="rounded-lg border p-4 bg-muted/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Analysis Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Lands to process: {landsCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Satellite className="w-4 h-4 text-muted-foreground" />
                      <span>Auto-detected tiles</span>
                    </div>
                  </div>
                </div>

                {!instantMode && queueCount > 0 && (
                  <Alert>
                    <AlertDescription className="flex items-center gap-2">
                      <Badge variant="secondary">{queueCount} already in queue</Badge>
                      {activeJobs > 0 && (
                        <Badge variant="default">{activeJobs} processing now</Badge>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAutoQueue}
              disabled={isCreating || landsCount === 0}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {instantMode ? 'Processing...' : 'Queueing...'}
                </>
              ) : (
                <>
                  {instantMode ? <Zap className="w-4 h-4 mr-2" /> : <Satellite className="w-4 h-4 mr-2" />}
                  {instantMode ? `⚡ Process ${landsCount} Now` : `Queue ${landsCount} Land${landsCount !== 1 ? 's' : ''}`}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Queue Button */}
      {queueCount > 0 && (
        <Button
          variant="secondary"
          onClick={handleProcessQueue}
          disabled={isProcessingQueue}
          className="gap-2"
        >
          {isProcessingQueue ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Process Queue ({queueCount})
            </>
          )}
        </Button>
      )}
    </div>
  );
};
