import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Ruler, Droplets, Sprout, Calendar, AlertCircle, Wifi, WifiOff, Plus } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
import { format } from 'date-fns';
import { AddLandModal } from '@/components/farmers/forms/AddLandModal';

interface FarmerLandHoldingsProps {
  farmerId: string;
}

interface Land {
  id: string;
  tenant_id: string;
  farmer_id: string;
  name: string; // This is the actual field name in DB
  area_acres: number;
  area_guntas?: number | null;
  survey_number?: string | null;
  village?: string | null;
  district?: string | null;
  state?: string | null;
  soil_type?: string | null;
  irrigation_type?: string | null;
  water_source?: string | null;
  current_crop?: string | null;
  ownership_type?: string | null;
  land_documents?: any;
  boundary?: any;
  created_at: string;
  updated_at: string;
  center_lat?: number | null;
  center_lon?: number | null;
}

export const FarmerLandHoldings: React.FC<FarmerLandHoldingsProps> = ({ farmerId }) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();
  const [isRealtime, setIsRealtime] = useState(false);
  const [isAddLandOpen, setIsAddLandOpen] = useState(false);

  // Fetch lands with tenant isolation
  const { data: lands, isLoading, error, refetch } = useQuery({
    queryKey: ['farmer-lands', currentTenant?.id, farmerId],
    queryFn: async () => {
      if (!currentTenant?.id) throw new Error('No tenant selected');
      
      const { data, error } = await supabase
        .from('lands')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Land[];
    },
    enabled: !!currentTenant?.id && !!farmerId,
    staleTime: 10000, // 10 seconds
    gcTime: 300000, // 5 minutes
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!currentTenant?.id || !farmerId) return;

    const channel = supabase.channel(`lands_${farmerId}_${currentTenant.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lands',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        (payload: any) => {
          // Check if the change is for this farmer
          if (payload.new?.farmer_id === farmerId || payload.old?.farmer_id === farmerId) {
            console.log('[FarmerLandHoldings] Real-time update received:', payload);
            setIsRealtime(true);
            // Invalidate query to refetch
            queryClient.invalidateQueries({
              queryKey: ['farmer-lands', currentTenant.id, farmerId],
            });
            // Reset realtime indicator after 2 seconds
            setTimeout(() => setIsRealtime(false), 2000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant, farmerId, queryClient]);

  // Calculate statistics
  const totalArea = lands?.reduce((sum, land) => sum + (land.area_acres || 0), 0) || 0;
  const irrigatedArea = lands
    ?.filter(land => land.irrigation_type && land.irrigation_type !== 'rainfed')
    .reduce((sum, land) => sum + (land.area_acres || 0), 0) || 0;
  const uniqueCrops = new Set(lands?.map(land => land.current_crop).filter(Boolean) || []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <p>Failed to load land holdings</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with stats and real-time indicator */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Land Holdings</h3>
          {isRealtime ? (
            <div className="flex items-center gap-1 px-2 py-1 bg-success/10 rounded-full animate-pulse">
              <Wifi className="w-3 h-3 text-success" />
              <span className="text-xs text-success font-medium">Live Update</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-full">
              <WifiOff className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Real-time</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-4 text-sm">
            <Badge variant="outline">Total: {totalArea.toFixed(2)} acres</Badge>
            <Badge variant="outline" className="text-blue-600">
              Irrigated: {irrigatedArea.toFixed(2)} acres
            </Badge>
            <Badge variant="outline" className="text-green-600">
              {uniqueCrops.size} crops
            </Badge>
          </div>
          <Button 
            size="sm" 
            onClick={() => setIsAddLandOpen(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Land
          </Button>
        </div>
      </div>

      {/* Land cards */}
      <div className="grid gap-4">
        {lands?.map((land) => (
          <Card key={land.id} className={isRealtime ? 'ring-2 ring-success/50 transition-all' : ''}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-medium text-lg">{land.name || `Plot ${land.survey_number || 'N/A'}`}</h4>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {land.village || 
                       land.district || 
                       land.state ||
                       'Location not specified'}
                    </span>
                  </div>
                  {land.survey_number && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Survey #: {land.survey_number}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Badge 
                    variant={land.irrigation_type && land.irrigation_type !== 'rainfed' ? 'default' : 'secondary'}
                  >
                    {land.irrigation_type === 'drip' && '💧 Drip'}
                    {land.irrigation_type === 'sprinkler' && '💦 Sprinkler'}
                    {land.irrigation_type === 'flood' && '🌊 Flood'}
                    {land.irrigation_type === 'rainfed' && '🌧️ Rainfed'}
                    {!land.irrigation_type && 'No Irrigation'}
                  </Badge>
                  {land.ownership_type && (
                    <Badge variant="outline" className="text-xs">
                      {land.ownership_type}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Area</p>
                    <p className="font-medium">{land.area_acres.toFixed(2)} acres</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Soil Type</p>
                  <p className="font-medium">{land.soil_type || 'Unknown'}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Current Crop</p>
                    <p className="font-medium">{land.current_crop || 'None'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Droplets className={`w-4 h-4 ${land.water_source ? 'text-blue-500' : 'text-gray-400'}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">Water Source</p>
                    <p className="font-medium text-sm">{land.water_source || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Added</p>
                    <p className="font-medium text-sm">
                      {format(new Date(land.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional details if available - using boundary field from DB */}
              {land.boundary && typeof land.boundary === 'object' && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">Boundary Info</p>
                  <p className="text-sm mt-1">
                    {/* Display boundary data if it exists and has properties */}
                    {JSON.stringify(land.boundary).substring(0, 100)}...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {(!lands || lands.length === 0) && (
        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No land holdings recorded for this farmer</p>
            <p className="text-sm text-muted-foreground mt-2">
              Click "Add Land" to create a new land parcel
            </p>
            <Button 
              onClick={() => setIsAddLandOpen(true)}
              className="mt-4 gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Your First Land Parcel
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Land Modal */}
      <AddLandModal
        isOpen={isAddLandOpen}
        onClose={() => setIsAddLandOpen(false)}
        farmerId={farmerId}
        onSuccess={() => {
          refetch();
          setIsAddLandOpen(false);
        }}
      />
    </div>
  );
};