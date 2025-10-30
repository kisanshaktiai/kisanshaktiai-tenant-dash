import { useState, useMemo } from 'react';
import { useRealtimeSoilData, LandWithSoilHealth } from '@/hooks/data/useRealtimeSoilData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { 
  Search, 
  TrendingUp, 
  MapPin, 
  Activity, 
  AlertTriangle,
  Download,
  RefreshCw,
  BarChart3,
  TableIcon,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { LandDistributionChart } from './LandDistributionChart';
import { NPKDistributionChart } from './NPKDistributionChart';
import { SoilHealthTimeline } from './SoilHealthTimeline';

interface EnhancedLandDataDashboardProps {
  onViewDetails: (land: LandWithSoilHealth) => void;
}

export const EnhancedLandDataDashboard = ({ onViewDetails }: EnhancedLandDataDashboardProps) => {
  const { landsWithSoil, isLoading, refetch } = useRealtimeSoilData();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [npkFilter, setNPKFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'analytics'>('table');

  // Calculate summary metrics
  const metrics = useMemo(() => {
    if (!landsWithSoil) return null;

    const totalLands = landsWithSoil.length;
    const landsWithData = landsWithSoil.filter(l => l.soil_health && l.soil_health.length > 0).length;
    const recentUpdates = landsWithSoil.filter(l => {
      const lastUpdate = new Date(l.updated_at);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return lastUpdate > dayAgo;
    }).length;

    // Calculate lands needing attention (low NPK)
    const needsAttention = landsWithSoil.filter(l => {
      if (!l.soil_health || l.soil_health.length === 0) return false;
      const latest = l.soil_health[0];
      return (latest.nitrogen_kg_per_ha !== null && latest.nitrogen_kg_per_ha < 200) ||
             (latest.phosphorus_kg_per_ha !== null && latest.phosphorus_kg_per_ha < 10) ||
             (latest.potassium_kg_per_ha !== null && latest.potassium_kg_per_ha < 100);
    }).length;

    // Calculate average health score (simplified)
    const avgHealthScore = landsWithData > 0 ? 
      Math.round((landsWithData / totalLands) * 100) : 0;

    return { totalLands, landsWithData, needsAttention, recentUpdates, avgHealthScore };
  }, [landsWithSoil]);

  // Get unique locations for filter
  const locations = useMemo(() => {
    if (!landsWithSoil) return [];
    const districts = new Set(landsWithSoil.map(l => l.district).filter(Boolean));
    return Array.from(districts).sort();
  }, [landsWithSoil]);

  // Filter and search lands
  const filteredLands = useMemo(() => {
    if (!landsWithSoil) return [];

    return landsWithSoil.filter(land => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        land.name.toLowerCase().includes(searchLower) ||
        land.farmer?.farmer_name?.toLowerCase().includes(searchLower) ||
        land.farmer?.farmer_code?.toLowerCase().includes(searchLower) ||
        land.village?.toLowerCase().includes(searchLower) ||
        land.district?.toLowerCase().includes(searchLower);

      // Location filter
      const matchesLocation = locationFilter === 'all' || land.district === locationFilter;

      // NPK filter
      let matchesNPK = true;
      if (npkFilter !== 'all' && land.soil_health && land.soil_health.length > 0) {
        const latest = land.soil_health[0];
        if (npkFilter === 'low') {
          matchesNPK = (latest.nitrogen_kg_per_ha !== null && latest.nitrogen_kg_per_ha < 200) ||
                       (latest.phosphorus_kg_per_ha !== null && latest.phosphorus_kg_per_ha < 10) ||
                       (latest.potassium_kg_per_ha !== null && latest.potassium_kg_per_ha < 100);
        } else if (npkFilter === 'medium') {
          matchesNPK = (latest.nitrogen_kg_per_ha !== null && latest.nitrogen_kg_per_ha >= 200 && latest.nitrogen_kg_per_ha < 400) ||
                       (latest.phosphorus_kg_per_ha !== null && latest.phosphorus_kg_per_ha >= 10 && latest.phosphorus_kg_per_ha < 20) ||
                       (latest.potassium_kg_per_ha !== null && latest.potassium_kg_per_ha >= 100 && latest.potassium_kg_per_ha < 200);
        } else if (npkFilter === 'high') {
          matchesNPK = (latest.nitrogen_kg_per_ha !== null && latest.nitrogen_kg_per_ha >= 400) &&
                       (latest.phosphorus_kg_per_ha !== null && latest.phosphorus_kg_per_ha >= 20) &&
                       (latest.potassium_kg_per_ha !== null && latest.potassium_kg_per_ha >= 200);
        }
      } else if (npkFilter !== 'all') {
        matchesNPK = false;
      }

      return matchesSearch && matchesLocation && matchesNPK;
    });
  }, [landsWithSoil, searchQuery, locationFilter, npkFilter]);

  const getNPKBadge = (value: number | null, type: 'N' | 'P' | 'K') => {
    if (value === null) return <Badge variant="outline">N/A</Badge>;
    
    let status: 'destructive' | 'default' | 'secondary';
    let thresholds = type === 'N' ? [200, 400] : type === 'P' ? [10, 20] : [100, 200];
    
    if (value < thresholds[0]) status = 'destructive';
    else if (value < thresholds[1]) status = 'default';
    else status = 'secondary';

    return <Badge variant={status}>{value.toFixed(1)}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-20"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Total Lands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalLands || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics?.landsWithData || 0} with soil data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-success" />
              Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.avgHealthScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average soil health
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{metrics?.needsAttention || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Low NPK levels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Recent Updates
              <LiveIndicator isConnected={true} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.recentUpdates || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Land Data Overview
                <LiveIndicator isConnected={true} />
              </CardTitle>
              <CardDescription>
                Real-time soil analysis data for {filteredLands.length} lands
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by farmer, land name, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(loc => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={npkFilter} onValueChange={setNPKFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="NPK Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All NPK Levels</SelectItem>
                <SelectItem value="low">Low NPK</SelectItem>
                <SelectItem value="medium">Medium NPK</SelectItem>
                <SelectItem value="high">High NPK</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Tabs */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'analytics')} className="w-full">
            <TabsList>
              <TabsTrigger value="table" className="gap-2">
                <TableIcon className="h-4 w-4" />
                Table View
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Farmer</TableHead>
                      <TableHead>Land Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Area (Acres)</TableHead>
                      <TableHead className="text-center">N</TableHead>
                      <TableHead className="text-center">P</TableHead>
                      <TableHead className="text-center">K</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLands.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          No lands found matching your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLands.map((land) => {
                        const latestSoil = land.soil_health && land.soil_health.length > 0 ? land.soil_health[0] : null;
                        const isRecent = new Date(land.updated_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);

                        return (
                          <TableRow key={land.id} className="hover:bg-muted/50">
                            <TableCell>
                              <div>
                                <div className="font-medium">{land.farmer?.farmer_name || 'Unknown'}</div>
                                <div className="text-xs text-muted-foreground">{land.farmer?.farmer_code}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{land.name}</div>
                                {land.current_crop && (
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {land.current_crop}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{land.village}</div>
                                <div className="text-xs text-muted-foreground">
                                  {land.taluka}, {land.district}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{land.area_acres.toFixed(2)}</TableCell>
                            <TableCell className="text-center">
                              {latestSoil ? getNPKBadge(latestSoil.nitrogen_kg_per_ha, 'N') : <Badge variant="outline">N/A</Badge>}
                            </TableCell>
                            <TableCell className="text-center">
                              {latestSoil ? getNPKBadge(latestSoil.phosphorus_kg_per_ha, 'P') : <Badge variant="outline">N/A</Badge>}
                            </TableCell>
                            <TableCell className="text-center">
                              {latestSoil ? getNPKBadge(latestSoil.potassium_kg_per_ha, 'K') : <Badge variant="outline">N/A</Badge>}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {isRecent && <LiveIndicator isConnected={true} />}
                                <span className="text-sm">
                                  {format(new Date(land.updated_at), 'MMM dd, yyyy')}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewDetails(land)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LandDistributionChart lands={filteredLands} />
                <NPKDistributionChart lands={filteredLands} />
              </div>
              <SoilHealthTimeline lands={filteredLands} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
