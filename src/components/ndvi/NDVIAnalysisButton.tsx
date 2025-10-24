import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Satellite, Loader2, Play } from 'lucide-react';
import { useNDVIQueue } from '@/hooks/data/useNDVIQueue';
import { Badge } from '@/components/ui/badge';

export const NDVIAnalysisButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [landIds, setLandIds] = useState('');
  const [tileId, setTileId] = useState('43RGN'); // Default tile ID
  
  const {
    createRequest,
    processQueue,
    isCreatingRequest,
    isProcessingQueue,
    queueCount,
    activeJobs,
  } = useNDVIQueue();

  const handleCreateRequest = () => {
    const ids = landIds.split(',').map(id => id.trim()).filter(Boolean);
    if (ids.length === 0) {
      return;
    }
    
    createRequest({ landIds: ids, tileId }, {
      onSuccess: () => {
        setOpen(false);
        setLandIds('');
      },
    });
  };

  const handleProcessQueue = () => {
    processQueue();
  };

  return (
    <div className="flex gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Satellite className="w-4 h-4" />
            Request NDVI Analysis
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request NDVI Analysis</DialogTitle>
            <DialogDescription>
              Queue lands for satellite vegetation health analysis
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="land-ids">Land IDs (comma-separated)</Label>
              <Input
                id="land-ids"
                placeholder="e.g., land-uuid-1, land-uuid-2"
                value={landIds}
                onChange={(e) => setLandIds(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter the UUIDs of the lands you want to analyze
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tile-id">Satellite Tile ID</Label>
              <Input
                id="tile-id"
                placeholder="e.g., 43RGN"
                value={tileId}
                onChange={(e) => setTileId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                MGRS tile identifier for the satellite imagery
              </p>
            </div>

            {queueCount > 0 && (
              <div className="rounded-lg border p-3 bg-muted/50">
                <p className="text-sm font-medium">Queue Status</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{queueCount} in queue</Badge>
                  {activeJobs > 0 && (
                    <Badge variant="default">{activeJobs} processing</Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isCreatingRequest}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRequest}
              disabled={isCreatingRequest || !landIds.trim()}
            >
              {isCreatingRequest && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
