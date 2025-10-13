import { LandWithSoil } from '@/services/SoilAnalysisService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, RefreshCw, Filter, MapPin, User } from 'lucide-react';
import { useState, useMemo } from 'react';
import { getNPKBadgeVariant, getConfidenceBadge, calculateCompleteness } from '@/utils/soilMetrics';

interface SoilOverviewTableProps {
  lands: LandWithSoil[];
  onLandClick: (land: LandWithSoil) => void;
  onUpdateSoilData: (landId: string, tenantId: string) => void;
  isUpdating: boolean;
}

export function SoilOverviewTable({ lands, onLandClick, onUpdateSoilData, isUpdating }: SoilOverviewTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'name' | 'area'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredLands = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    return lands.filter(land =>
      land.name.toLowerCase().includes(searchLower) ||
      land.farmer?.farmer_name?.toLowerCase().includes(searchLower) ||
      land.farmer?.farmer_code?.toLowerCase().includes(searchLower) ||
      land.village?.toLowerCase().includes(searchLower) ||
      land.current_crop?.toLowerCase().includes(searchLower)
    );
  }, [lands, searchQuery]);

  const sortedLands = useMemo(() => {
    return [...filteredLands].sort((a, b) => {
      const comparison = sortField === 'name' 
        ? a.name.localeCompare(b.name)
        : a.area_acres - b.area_acres;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredLands, sortField, sortDirection]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by farmer, land, location, or crop..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="pl-10" 
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[200px]">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Farmer
                </div>
              </TableHead>
              <TableHead className="w-[220px]">Land Details</TableHead>
              <TableHead className="w-[180px]">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </div>
              </TableHead>
              <TableHead className="w-[150px]">Current Crop</TableHead>
              <TableHead className="w-[140px]">Soil Quality</TableHead>
              <TableHead className="w-[200px]">NPK Status</TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No lands found matching your search
                </TableCell>
              </TableRow>
            ) : (
              sortedLands.map((land) => {
                const latestSoil = land.soil_health?.[0];
                const confidence = latestSoil?.confidence_level || 'unknown';
                const completeness = calculateCompleteness(latestSoil);

                return (
                  <TableRow 
                    key={land.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onLandClick(land)}
                  >
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-sm">
                          {land.farmer?.farmer_name || 'Unknown'}
                        </span>
                        {land.farmer?.farmer_code && (
                          <span className="text-xs text-muted-foreground font-mono">
                            {land.farmer.farmer_code}
                          </span>
                        )}
                        {land.farmer?.mobile_number && (
                          <span className="text-xs text-muted-foreground">
                            {land.farmer.mobile_number}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-sm">{land.name}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium">{land.area_acres.toFixed(2)} acres</span>
                          {land.area_guntas && (
                            <span>({land.area_guntas.toFixed(0)} guntas)</span>
                          )}
                        </div>
                        {land.survey_number && (
                          <span className="text-xs text-muted-foreground">
                            Survey: {land.survey_number}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs">
                        {land.village && (
                          <span className="font-medium">{land.village}</span>
                        )}
                        {land.taluka && (
                          <span className="text-muted-foreground">{land.taluka}</span>
                        )}
                        {land.district && (
                          <span className="text-muted-foreground">{land.district}</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {land.current_crop ? (
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-sm">{land.current_crop}</span>
                          {land.crop_stage && (
                            <Badge variant="outline" className="w-fit text-xs">
                              {land.crop_stage}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No crop</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-2">
                        {getConfidenceBadge(confidence)}
                        <div className="flex items-center gap-2">
                          <Progress value={completeness} className="w-16 h-2" />
                          <span className="text-xs text-muted-foreground">{completeness}%</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        <Badge 
                          variant={getNPKBadgeVariant(latestSoil?.nitrogen_level)} 
                          className="text-xs"
                        >
                          N: {latestSoil?.nitrogen_level || latestSoil?.nitrogen_text || 'N/A'}
                        </Badge>
                        <Badge 
                          variant={getNPKBadgeVariant(latestSoil?.phosphorus_level)} 
                          className="text-xs"
                        >
                          P: {latestSoil?.phosphorus_level || latestSoil?.phosphorus_text || 'N/A'}
                        </Badge>
                        <Badge 
                          variant={getNPKBadgeVariant(latestSoil?.potassium_level)} 
                          className="text-xs"
                        >
                          K: {latestSoil?.potassium_level || latestSoil?.potassium_text || 'N/A'}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateSoilData(land.id, land.tenant_id);
                        }}
                        disabled={isUpdating}
                        className="h-8 w-8 p-0"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing {sortedLands.length} of {lands.length} lands</span>
        {filteredLands.length < lands.length && (
          <span className="text-primary">
            Filtered {lands.length - filteredLands.length} lands
          </span>
        )}
      </div>
    </div>
  );
}
