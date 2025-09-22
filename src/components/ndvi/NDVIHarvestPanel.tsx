import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Satellite, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  Cloud,
  HardDrive,
  MapPin,
  Calendar,
  Activity,
  Loader2,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface TileInfo {
  tile_id: string;
  land_count: number;
  total_area_ha: number;
  latest_ndvi?: {
    acquisition_date: string;
    cloud_cover: number;
    status: string;
  };
}

interface HarvestJob {
  id: string;
  job_type: string;
  status: string;
  progress: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
  parameters: any;
}

export const NDVIHarvestPanel: React.FC = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const [tiles, setTiles] = useState<TileInfo[]>([]);
  const [jobs, setJobs] = useState<HarvestJob[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [quota, setQuota] = useState<any>(null);
  const [storageUsage, setStorageUsage] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (currentTenant?.id) {
      fetchTenantTiles();
      fetchHarvestStatus();
      fetchStorageUsage();
      
      // Set up real-time subscriptions
      const jobsChannel = supabase
        .channel('harvest-jobs')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'system_jobs',
            filter: `tenant_id=eq.${currentTenant.id}`
          },
          () => {
            fetchHarvestStatus();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(jobsChannel);
      };
    }
  }, [currentTenant]);

  const fetchTenantTiles = async () => {
    if (!currentTenant?.id) return;

    try {
      const response = await supabase.functions.invoke('ndvi-harvest', {
        body: {
          action: 'get_tenant_tiles',
          tenant_id: currentTenant.id
        }
      });

      if (response.error) throw response.error;
      setTiles(response.data.tiles);
    } catch (error) {
      console.error('Error fetching tiles:', error);
      toast.error('Failed to fetch tile information');
    }
  };

  const fetchHarvestStatus = async () => {
    if (!currentTenant?.id) return;

    try {
      const response = await supabase.functions.invoke('ndvi-harvest', {
        body: {
          action: 'get_harvest_status',
          tenant_id: currentTenant.id
        }
      });

      if (response.error) throw response.error;
      setJobs(response.data.jobs);
      
      // Check quota
      const { data: quotaData } = await supabase
        .rpc('check_harvest_quota', { p_tenant_id: currentTenant.id });
      setQuota(quotaData);
    } catch (error) {
      console.error('Error fetching harvest status:', error);
    }
  };

  const fetchStorageUsage = async () => {
    if (!currentTenant?.id) return;

    try {
      const response = await supabase.functions.invoke('ndvi-harvest', {
        body: {
          action: 'get_storage_usage',
          tenant_id: currentTenant.id
        }
      });

      if (response.error) throw response.error;
      setStorageUsage(response.data);
    } catch (error) {
      console.error('Error fetching storage usage:', error);
    }
  };

  const triggerHarvest = async () => {
    if (!currentTenant?.id || selectedTiles.length === 0) return;

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('ndvi-harvest', {
        body: {
          action: 'trigger_harvest',
          tenant_id: currentTenant.id,
          tile_ids: selectedTiles,
          params: {
            priority: 3
          }
        }
      });

      if (response.error) throw response.error;

      toast.success(`Started harvest for ${selectedTiles.length} tiles`);
      setSelectedTiles([]);
      fetchHarvestStatus();
    } catch (error: any) {
      console.error('Error triggering harvest:', error);
      toast.error(error.message || 'Failed to trigger harvest');
    } finally {
      setIsLoading(false);
    }
  };

  const retryJob = async (jobId: string) => {
    if (!currentTenant?.id) return;

    try {
      const response = await supabase.functions.invoke('ndvi-harvest', {
        body: {
          action: 'retry_failed_job',
          tenant_id: currentTenant.id,
          params: { job_id: jobId }
        }
      });

      if (response.error) throw response.error;
      toast.success('Job retry initiated');
      fetchHarvestStatus();
    } catch (error) {
      console.error('Error retrying job:', error);
      toast.error('Failed to retry job');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'running': return 'secondary';
      case 'failed': return 'destructive';
      case 'pending': return 'outline';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'running': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      case 'pending': return <Pause className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Satellite className="w-6 h-6 text-primary" />
            NDVI Harvest & Cache
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage satellite imagery acquisition and NDVI processing
          </p>
        </div>
        
        {quota && (
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Monthly Quota</div>
            <div className="font-semibold">
              {quota.current_usage} / {quota.monthly_limit} harvests
            </div>
            <Progress 
              value={(quota.current_usage / quota.monthly_limit) * 100} 
              className="mt-2 w-32"
            />
          </Card>
        )}
      </div>

      {/* Storage Usage Alert */}
      {storageUsage && storageUsage.percentage_used > 80 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Storage usage is at {storageUsage.percentage_used.toFixed(1)}%. 
            Consider cleaning up old tiles or upgrading your plan.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tiles">Tiles</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tiles</p>
                  <p className="text-2xl font-bold">{tiles.length}</p>
                </div>
                <MapPin className="w-8 h-8 text-primary opacity-20" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                  <p className="text-2xl font-bold">
                    {jobs.filter(j => j.status === 'running').length}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-warning opacity-20" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Storage Used</p>
                  <p className="text-2xl font-bold">
                    {storageUsage ? `${(storageUsage.used_mb / 1024).toFixed(1)} GB` : '0 GB'}
                  </p>
                </div>
                <HardDrive className="w-8 h-8 text-info opacity-20" />
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tiles">
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Available Tiles</h3>
                <Button 
                  onClick={triggerHarvest}
                  disabled={selectedTiles.length === 0 || isLoading || !quota?.can_harvest}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Fetch NDVI ({selectedTiles.length})
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                {tiles.map((tile) => (
                  <div
                    key={tile.tile_id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedTiles.includes(tile.tile_id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTiles([...selectedTiles, tile.tile_id]);
                          } else {
                            setSelectedTiles(selectedTiles.filter(id => id !== tile.tile_id));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      
                      <div>
                        <div className="font-semibold">{tile.tile_id}</div>
                        <div className="text-sm text-muted-foreground">
                          {tile.land_count} lands • {tile.total_area_ha.toFixed(0)} ha
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {tile.latest_ndvi && (
                        <>
                          <div className="text-sm text-right">
                            <div className="text-muted-foreground">Last Update</div>
                            <div>{format(new Date(tile.latest_ndvi.acquisition_date), 'dd MMM yyyy')}</div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Cloud className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{tile.latest_ndvi.cloud_cover}%</span>
                          </div>
                          
                          <Badge variant={getStatusColor(tile.latest_ndvi.status)}>
                            {tile.latest_ndvi.status}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Processing Jobs</h3>
              
              <div className="space-y-2">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(job.status)}
                      
                      <div>
                        <div className="font-medium">
                          Tile {job.parameters?.tile_id || 'Unknown'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Started {format(new Date(job.created_at), 'dd MMM HH:mm')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {job.status === 'running' && (
                        <Progress value={job.progress} className="w-24" />
                      )}
                      
                      <Badge variant={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                      
                      {job.status === 'failed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => retryJob(job.id)}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {jobs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No jobs found
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="storage">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Storage Management</h3>
              
              {storageUsage && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Storage Usage</span>
                      <span className="text-sm font-medium">
                        {(storageUsage.used_mb / 1024).toFixed(2)} GB / {(storageUsage.limit_mb / 1024).toFixed(0)} GB
                      </span>
                    </div>
                    <Progress value={storageUsage.percentage_used} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{storageUsage.files_count}</div>
                      <div className="text-sm text-muted-foreground">Total Files</div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold">
                        {storageUsage.used_mb > 0 ? (storageUsage.used_mb / storageUsage.files_count).toFixed(2) : 0} MB
                      </div>
                      <div className="text-sm text-muted-foreground">Avg File Size</div>
                    </div>
                  </div>
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Files older than 30 days are automatically cleaned up to optimize storage.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};