import { LandWithSoil } from '@/services/SoilAnalysisService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, RefreshCw, Filter } from 'lucide-react';
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
      land.farmer_id?.toLowerCase().includes(searchLower) ||
      land.village?.toLowerCase().includes(searchLower)
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
          <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-2" />Filters</Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Farmer ID</TableHead>
              <TableHead>Land Name</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Completeness</TableHead>
              <TableHead>NPK Summary</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLands.map((land) => (
              <TableRow key={land.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onLandClick(land)}>
                <TableCell className="text-xs">{land.farmer_id?.slice(0, 8)}...</TableCell>
                <TableCell>{land.name}</TableCell>
                <TableCell>{land.area_acres.toFixed(2)}</TableCell>
                <TableCell>
                  {land.soil_health?.[0]?.confidence_level ? (
                    <Badge className={getConfidenceBadge(land.soil_health[0].confidence_level)}>
                      {land.soil_health[0].confidence_level}
                    </Badge>
                  ) : <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>
                  <Progress value={calculateCompleteness(land.soil_health?.[0])} className="h-2" />
                </TableCell>
                <TableCell>
                  {land.soil_health?.[0] ? (
                    <div className="text-xs space-y-1">
                      <div>N: {land.soil_health[0].nitrogen_kg_per_ha?.toFixed(1) || '—'} <Badge variant={getNPKBadgeVariant(land.soil_health[0].nitrogen_level)} className="text-[10px] px-1">{land.soil_health[0].nitrogen_level}</Badge></div>
                      <div>P: {land.soil_health[0].phosphorus_kg_per_ha?.toFixed(1) || '—'}</div>
                      <div>K: {land.soil_health[0].potassium_kg_per_ha?.toFixed(1) || '—'}</div>
                    </div>
                  ) : <span className="text-muted-foreground">No data</span>}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" disabled={isUpdating} onClick={(e) => { e.stopPropagation(); onUpdateSoilData(land.id, land.tenant_id); }}>
                    <RefreshCw className="h-3 w-3 mr-1" />Update
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="text-sm text-muted-foreground">Showing {sortedLands.length} of {lands.length} lands</div>
    </div>
  );
}
