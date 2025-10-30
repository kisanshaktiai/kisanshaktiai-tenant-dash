import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Satellite, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  RefreshCw,
  Eye,
  Calendar,
  Droplets,
  Leaf
} from 'lucide-react';
import { format } from 'date-fns';
import { useNDVIData } from '@/hooks/data/useNDVIData';
import { useAppSelector } from '@/store/hooks';
import { toast } from '@/hooks/use-toast';
import { renderNDVIService } from '@/services/RenderNDVIService';
import { ndviLandService } from '@/services/NDVILandService';

interface FarmerNDVICardProps {
  farmerId: string;
  farmerName: string;
  onViewDetails: () => void;
}

export const FarmerNDVICard: React.FC<FarmerNDVICardProps> = ({
  farmerId,
  farmerName,
  onViewDetails
}) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { data: ndviData, isLoading, refetch } = useNDVIData(farmerId);
  const [isFetching, setIsFetching] = React.useState(false);

  const handleFetchNDVI = async () => {
    if (!currentTenant?.id) return;
    
    setIsFetching(true);
    try {
      // Queue NDVI requests via Render API
      await ndviLandService.fetchNDVIForLands(currentTenant.id, farmerId, true);
      
      toast({
        title: "NDVI Jobs Queued",
        description: `Queued satellite data requests for ${farmerName}. Click "Process Queue" on NDVI page to fetch data.`,
      });
      
      // Refetch after processing delay
      setTimeout(() => refetch(), 5000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to queue NDVI requests",
        variant: "destructive"
      });
    } finally {
      setIsFetching(false);
    }
  };

  const getTrendIcon = () => {
    if (!ndviData?.trend) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (ndviData.trend === 'up') return <TrendingUp className="h-4 w-4 text-success" />;
    if (ndviData.trend === 'down') return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getHealthStatus = (ndvi: number) => {
    if (ndvi >= 0.7) return { label: 'Excellent', color: 'bg-success' };
    if (ndvi >= 0.5) return { label: 'Good', color: 'bg-primary' };
    if (ndvi >= 0.3) return { label: 'Moderate', color: 'bg-warning' };
    return { label: 'Poor', color: 'bg-destructive' };
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!ndviData) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium flex items-center gap-2">
              <Satellite className="h-4 w-4" />
              NDVI Data
            </h3>
            <Badge variant="outline" className="text-xs">No Data</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            No satellite data available
          </p>
          <Button 
            size="sm" 
            onClick={handleFetchNDVI}
            disabled={isFetching}
            className="w-full"
          >
            {isFetching ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <Satellite className="h-4 w-4 mr-2" />
                Fetch Satellite Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const healthStatus = getHealthStatus(ndviData.ndvi);

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium flex items-center gap-2">
            <Satellite className="h-4 w-4" />
            Vegetation Health
          </h3>
          <Badge className={healthStatus.color}>{healthStatus.label}</Badge>
        </div>

        {/* NDVI Value with Trend */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-muted-foreground">NDVI Index</span>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold">{ndviData.ndvi.toFixed(3)}</span>
              {getTrendIcon()}
            </div>
          </div>
          <Progress value={ndviData.ndvi * 100} className="h-2" />
        </div>

        {/* Other Indices Grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Leaf className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">EVI</p>
            <p className="font-medium">{ndviData.evi.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Droplets className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">NDWI</p>
            <p className="font-medium">{ndviData.ndwi.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Activity className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">SAVI</p>
            <p className="font-medium">{ndviData.savi.toFixed(2)}</p>
          </div>
        </div>

        {/* Last Updated */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(ndviData.capturedDate), 'MMM dd, yyyy')}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleFetchNDVI}
            disabled={isFetching}
            className="flex-1"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
            Update
          </Button>
          <Button 
            size="sm" 
            onClick={onViewDetails}
            className="flex-1"
          >
            <Eye className="h-3 w-3 mr-1" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
