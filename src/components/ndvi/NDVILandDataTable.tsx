import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Satellite, 
  CloudOff, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertCircle,
  CheckCircle,
  MapPin,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

interface NDVILandDataTableProps {
  data: any[] | null;
  isLoading: boolean;
}

export const NDVILandDataTable: React.FC<NDVILandDataTableProps> = ({ 
  data, 
  isLoading 
}) => {
  const getTrendIcon = (value: number) => {
    if (value >= 0.7) return <TrendingUp className="h-4 w-4 text-success" />;
    if (value >= 0.3) return <Minus className="h-4 w-4 text-warning" />;
    return <TrendingDown className="h-4 w-4 text-destructive" />;
  };

  const getHealthBadge = (ndvi: number) => {
    // Green (healthy) if NDVI > 0.5
    if (ndvi > 0.5) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white">
          🟢 Healthy
        </Badge>
      );
    }
    // Yellow (moderate) if 0.2-0.5
    if (ndvi >= 0.2 && ndvi <= 0.5) {
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
          🟡 Moderate
        </Badge>
      );
    }
    // Red (poor) if < 0.2
    return (
      <Badge className="bg-red-500 hover:bg-red-600 text-white">
        🔴 Poor
      </Badge>
    );
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
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Satellite className="h-5 w-5" />
            NDVI Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CloudOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No NDVI data available yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Click "Refresh NDVI Now" to fetch satellite data
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group data by land
  interface LandGroup {
    land_id: string;
    land_name: string;
    data: any[];
  }

  const landGroups = data.reduce((acc, item) => {
    const landId = item.lands?.id || item.land_id;
    if (!acc[landId]) {
      acc[landId] = {
        land_id: landId,
        land_name: item.lands?.name || 'Unknown Land',
        data: []
      };
    }
    acc[landId].data.push(item);
    return acc;
  }, {} as Record<string, LandGroup>);

  const lands: LandGroup[] = Object.values(landGroups);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Satellite className="h-5 w-5" />
            NDVI Data Overview
          </div>
          <Badge variant="outline" className="text-sm">
            {lands.length} Land{lands.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Lands</p>
            <p className="text-2xl font-bold">{lands.length}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Avg NDVI</p>
            <p className="text-2xl font-bold">
              {(data.reduce((sum, d) => sum + d.ndvi_value, 0) / data.length).toFixed(3)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Latest Update</p>
            <p className="text-sm font-medium">
              {format(new Date(data[0].date), 'MMM dd, yyyy')}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Data Points</p>
            <p className="text-2xl font-bold">{data.length}</p>
          </div>
        </div>

        {/* Lands Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Land</TableHead>
                <TableHead>Latest NDVI</TableHead>
                <TableHead>EVI</TableHead>
                <TableHead>NDWI</TableHead>
                <TableHead>SAVI</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lands.map((land) => {
                const latestData = land.data.sort(
                  (a: any, b: any) => 
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )[0];

                return (
                  <TableRow key={land.land_id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {land.land_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {latestData.ndvi_value.toFixed(3)}
                        {getTrendIcon(latestData.ndvi_value)}
                      </div>
                    </TableCell>
                    <TableCell>{latestData.evi_value?.toFixed(3) || 'N/A'}</TableCell>
                    <TableCell>{latestData.ndwi_value?.toFixed(3) || 'N/A'}</TableCell>
                    <TableCell>{latestData.savi_value?.toFixed(3) || 'N/A'}</TableCell>
                    <TableCell>{getHealthBadge(latestData.ndvi_value)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(latestData.date), 'MMM dd')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <CheckCircle className="h-4 w-4 text-success" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Cache Info */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            NDVI data is cached for 7 days. Use "Refresh NDVI Now" to fetch fresh satellite data.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
