import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Satellite, 
  CloudOff, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Download,
  RefreshCw,
  Eye,
  Calendar,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { useNDVITimeSeries } from '@/hooks/data/useNDVIData';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';

interface NDVIDataTableProps {
  farmerId: string;
  farmerName?: string;
  onViewDetails?: (data: any) => void;
}

export const NDVIDataTable: React.FC<NDVIDataTableProps> = ({ 
  farmerId, 
  farmerName,
  onViewDetails 
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { data: timeSeriesData, isLoading, refetch } = useNDVITimeSeries(farmerId, 90);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Trigger NDVI data fetch for this farmer
      const { error } = await supabase.functions.invoke('ndvi-harvest', {
        body: {
          action: 'trigger_harvest',
          tenant_id: currentTenant?.id,
          farmer_ids: [farmerId],
          source: 'MPC'
        }
      });

      if (error) throw error;
      
      toast({
        title: "NDVI Data Fetch Initiated",
        description: `Fetching latest satellite data for ${farmerName || 'farmer'}`,
      });
      
      // Refetch data after a delay
      setTimeout(() => refetch(), 3000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch NDVI data",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    if (!timeSeriesData || timeSeriesData.length === 0) return;
    
    // Convert to CSV
    const headers = ['Date', 'NDVI', 'EVI', 'NDWI', 'SAVI'];
    const csvData = timeSeriesData.map(row => 
      [row.date, row.ndvi, row.evi, row.ndwi, row.savi].join(',')
    );
    const csv = [headers.join(','), ...csvData].join('\n');
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ndvi_data_${farmerName || farmerId}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTrendIcon = (current: number, previous: number) => {
    const diff = current - previous;
    if (Math.abs(diff) < 0.02) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (diff > 0) return <TrendingUp className="h-4 w-4 text-success" />;
    return <TrendingDown className="h-4 w-4 text-destructive" />;
  };

  const getHealthBadge = (ndvi: number) => {
    if (ndvi >= 0.7) return <Badge variant="default" className="bg-success">Excellent</Badge>;
    if (ndvi >= 0.5) return <Badge variant="default" className="bg-primary">Good</Badge>;
    if (ndvi >= 0.3) return <Badge variant="default" className="bg-warning">Moderate</Badge>;
    return <Badge variant="destructive">Poor</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Satellite className="h-5 w-5" />
            Loading NDVI Data...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Satellite className="h-5 w-5" />
            Vegetation Health Data
            {farmerName && <span className="text-sm font-normal text-muted-foreground">for {farmerName}</span>}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={!timeSeriesData || timeSeriesData.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!timeSeriesData || timeSeriesData.length === 0 ? (
          <div className="text-center py-8">
            <CloudOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No NDVI data available</p>
            <Button onClick={handleRefresh} disabled={isRefreshing}>
              <Satellite className="h-4 w-4 mr-2" />
              Fetch Satellite Data
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Latest Values Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">NDVI</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{timeSeriesData[0]?.ndvi.toFixed(3)}</p>
                  {timeSeriesData[1] && getTrendIcon(timeSeriesData[0].ndvi, timeSeriesData[1].ndvi)}
                </div>
                {getHealthBadge(timeSeriesData[0]?.ndvi)}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">EVI</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{timeSeriesData[0]?.evi.toFixed(3)}</p>
                  {timeSeriesData[1] && getTrendIcon(timeSeriesData[0].evi, timeSeriesData[1].evi)}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">NDWI</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{timeSeriesData[0]?.ndwi.toFixed(3)}</p>
                  {timeSeriesData[1] && getTrendIcon(timeSeriesData[0].ndwi, timeSeriesData[1].ndwi)}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">SAVI</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{timeSeriesData[0]?.savi.toFixed(3)}</p>
                  {timeSeriesData[1] && getTrendIcon(timeSeriesData[0].savi, timeSeriesData[1].savi)}
                </div>
              </div>
            </div>

            {/* Historical Data Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>NDVI</TableHead>
                    <TableHead>EVI</TableHead>
                    <TableHead>NDWI</TableHead>
                    <TableHead>SAVI</TableHead>
                    <TableHead>Health</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeSeriesData.slice(0, 10).map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(row.date), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {row.ndvi.toFixed(3)}
                          {index > 0 && getTrendIcon(row.ndvi, timeSeriesData[index - 1].ndvi)}
                        </div>
                      </TableCell>
                      <TableCell>{row.evi.toFixed(3)}</TableCell>
                      <TableCell>{row.ndwi.toFixed(3)}</TableCell>
                      <TableCell>{row.savi.toFixed(3)}</TableCell>
                      <TableCell>{getHealthBadge(row.ndvi)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails?.(row)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Health Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall Vegetation Health</span>
                <span className="font-medium">{(timeSeriesData[0]?.ndvi * 100).toFixed(1)}%</span>
              </div>
              <Progress value={timeSeriesData[0]?.ndvi * 100} className="h-2" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};