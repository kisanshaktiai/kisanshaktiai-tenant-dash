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
import { Satellite, Loader2, Play, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useNDVIQueue } from '@/hooks/data/useNDVIQueue';
import { useAutoNDVIAnalysis } from '@/hooks/data/useAutoNDVIAnalysis';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const NDVIAnalysisButton: React.FC = () => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
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
    await createAutoRequest();
    setShowConfirmDialog(false);
  };

  const handleProcessQueue = () => {
    processQueue();
  };

  return (
    <div className="flex gap-2">
      {/* Smart NDVI Analysis Request */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <Button
          onClick={() => setShowConfirmDialog(true)}
          disabled={isCheckingLands || isCreating}
          className="gap-2"
        >
          {isCheckingLands ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking Lands...
            </>
          ) : (
            <>
              <Satellite className="w-4 h-4" />
              Request NDVI Analysis
              {landsCount > 0 && (
                <Badge variant="secondary" className="ml-1 bg-white/20">
                  {landsCount}
                </Badge>
              )}
            </>
          )}
        </Button>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Queue NDVI Analysis</DialogTitle>
            <DialogDescription>
              Automatically queue lands that need vegetation health monitoring
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
                      <li>Lands without any NDVI data</li>
                      <li>Lands with data older than 24 hours</li>
                      <li>Lands with updated satellite imagery available</li>
                    </ul>
                  </AlertDescription>
                </Alert>

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

                {queueCount > 0 && (
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
                  Queueing...
                </>
              ) : (
                <>
                  <Satellite className="w-4 h-4 mr-2" />
                  Queue {landsCount} Land{landsCount !== 1 ? 's' : ''}
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
