import React, { useState } from 'react';
import { LandWithSoil } from '@/services/SoilAnalysisService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface SoilOverviewTableProps {
  lands: LandWithSoil[];
  onLandClick: (land: LandWithSoil) => void;
  onUpdateSoilData: (landId: string, tenantId: string) => void;
  isUpdating: boolean;
}

export function SoilOverviewTable({
  lands,
  onLandClick,
  onUpdateSoilData,
  isUpdating,
}: SoilOverviewTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'name' | 'area' | 'ph' | 'date'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter lands based on search
  const filteredLands = lands.filter((land) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      land.name.toLowerCase().includes(searchLower) ||
      land.farmer_id?.toLowerCase().includes(searchLower) ||
      land.village?.toLowerCase().includes(searchLower)
    );
  });

  // Sort lands
  const sortedLands = [...filteredLands].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'area':
        comparison = a.area_acres - b.area_acres;
        break;
      case 'ph':
        const phA = a.soil_health?.[0]?.ph_level ?? a.soil_ph ?? 0;
        const phB = b.soil_health?.[0]?.ph_level ?? b.soil_ph ?? 0;
        comparison = phA - phB;
        break;
      case 'date':
        const dateA = a.soil_health?.[0]?.test_date ?? a.last_soil_test_date ?? '';
        const dateB = b.soil_health?.[0]?.test_date ?? b.last_soil_test_date ?? '';
        comparison = dateA.localeCompare(dateB);
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getPhBadge = (pH: number | null | undefined) => {
    if (!pH) return <Badge variant="outline">N/A</Badge>;

    if (pH < 6.0) return <Badge className="bg-yellow-100 text-yellow-800">Acidic ({pH})</Badge>;
    if (pH >= 6.5 && pH <= 7.5)
      return <Badge className="bg-green-100 text-green-800">Neutral ({pH})</Badge>;
    return <Badge className="bg-orange-100 text-orange-800">Alkaline ({pH})</Badge>;
  };

  const getOCBadge = (oc: number | null | undefined) => {
    if (!oc) return <Badge variant="outline">N/A</Badge>;

    if (oc < 0.5) return <Badge className="bg-red-100 text-red-800">Low ({oc}%)</Badge>;
    if (oc < 1.0) return <Badge className="bg-blue-100 text-blue-800">Moderate ({oc}%)</Badge>;
    return <Badge className="bg-green-100 text-green-800">High ({oc}%)</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by farmer, land name, or village..."
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

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  ✅ Farmer ID
                  {sortField === 'name' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('name')}
              >
                🌾 Land Name
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('area')}
              >
                📏 Area (acres)
                {sortField === 'area' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('ph')}
              >
                🌡️ pH Level
                {sortField === 'ph' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </TableHead>
              <TableHead>🌱 Organic Carbon</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('date')}
              >
                ⏰ Last Test Date
                {sortField === 'date' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </TableHead>
              <TableHead className="text-right">⚙️ Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No lands found. {searchQuery && 'Try adjusting your search.'}
                </TableCell>
              </TableRow>
            ) : (
              sortedLands.map((land) => {
                const latestSoilData = land.soil_health?.[0];
                const pH = latestSoilData?.ph_level ?? land.soil_ph;
                const oc = latestSoilData?.organic_carbon ?? land.organic_carbon_percent;
                const testDate = latestSoilData?.test_date ?? land.last_soil_test_date;

                return (
                  <TableRow
                    key={land.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onLandClick(land)}
                  >
                    <TableCell className="font-medium text-xs">
                      {land.farmer_id?.slice(0, 8) || 'N/A'}...
                    </TableCell>
                    <TableCell>{land.name}</TableCell>
                    <TableCell>{land.area_acres.toFixed(2)}</TableCell>
                    <TableCell>{getPhBadge(pH)}</TableCell>
                    <TableCell>{getOCBadge(oc)}</TableCell>
                    <TableCell>
                      {testDate ? format(new Date(testDate), 'MMM dd, yyyy') : 'Never tested'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isUpdating}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateSoilData(land.id, land.tenant_id);
                        }}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {sortedLands.length} of {lands.length} lands
      </div>
    </div>
  );
}
