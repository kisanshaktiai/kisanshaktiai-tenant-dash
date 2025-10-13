import React from 'react';
import { useNDVILandData } from '@/hooks/data/useNDVILandData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { 
  TrendingUp,
  TrendingDown,
  MapPin,
  Eye,
  Download,
  Share2,
  Star
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const NDVILandPerformance: React.FC = () => {
  const { cachedData, isLoading } = useNDVILandData();

  const getNDVIStatus = (value: number) => {
    if (value > 0.7) return { label: 'Excellent', color: 'bg-green-500', icon: <TrendingUp className="w-3 h-3" /> };
    if (value > 0.5) return { label: 'Good', color: 'bg-blue-500', icon: <TrendingUp className="w-3 h-3" /> };
    if (value > 0.3) return { label: 'Moderate', color: 'bg-yellow-500', icon: <TrendingDown className="w-3 h-3" /> };
    return { label: 'Poor', color: 'bg-red-500', icon: <TrendingDown className="w-3 h-3" /> };
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (!cachedData || cachedData.length === 0) {
    return (
      <Card className="p-12 text-center">
        <MapPin className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Land Data Available</h3>
        <p className="text-muted-foreground">
          Start monitoring your lands to see performance analytics
        </p>
      </Card>
    );
  }

  // Group by land and get latest data
  const landPerformance = cachedData.reduce((acc: any[], item: any) => {
    const existing = acc.find(l => l.land_id === item.land_id);
    if (!existing || new Date(item.date) > new Date(existing.date)) {
      const index = acc.findIndex(l => l.land_id === item.land_id);
      if (index >= 0) {
        acc[index] = item;
      } else {
        acc.push(item);
      }
    }
    return acc;
  }, []).sort((a, b) => b.ndvi_value - a.ndvi_value);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Land Performance Ranking</h2>
          <p className="text-muted-foreground">Top performing lands based on latest NDVI values</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Performance Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>Land Name</TableHead>
              <TableHead>Farmer</TableHead>
              <TableHead>NDVI</TableHead>
              <TableHead>EVI</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {landPerformance.slice(0, 10).map((land, index) => {
              const status = getNDVIStatus(land.ndvi_value);
              return (
                <TableRow key={land.land_id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {index < 3 && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                      <span className="font-semibold">#{index + 1}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {land.lands?.name || 'Unknown'}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {land.lands?.farmers?.full_name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold">{land.ndvi_value.toFixed(3)}</span>
                      {status.icon}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {land.evi_value?.toFixed(3) || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${status.color} text-white`}>
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(land.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-green-500" />
              <h4 className="font-semibold">Top Performer</h4>
            </div>
            <p className="text-2xl font-bold">{landPerformance[0]?.lands?.name || 'N/A'}</p>
            <p className="text-sm text-muted-foreground">
              NDVI: {landPerformance[0]?.ndvi_value.toFixed(3) || 'N/A'}
            </p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h4 className="font-semibold">Average NDVI</h4>
            </div>
            <p className="text-2xl font-bold">
              {(landPerformance.reduce((sum, l) => sum + l.ndvi_value, 0) / landPerformance.length).toFixed(3)}
            </p>
            <p className="text-sm text-muted-foreground">
              Across {landPerformance.length} lands
            </p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-500" />
              <h4 className="font-semibold">Needs Attention</h4>
            </div>
            <p className="text-2xl font-bold">
              {landPerformance.filter(l => l.ndvi_value < 0.3).length}
            </p>
            <p className="text-sm text-muted-foreground">
              Lands below threshold
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
