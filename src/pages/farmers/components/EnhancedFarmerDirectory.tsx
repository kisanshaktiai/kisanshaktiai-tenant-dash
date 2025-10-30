
import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Search, Tag, Users, Phone, MapPin, CheckSquare, Square } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AdvancedSearchModal } from './AdvancedSearchModal';
import { BulkOperationsPanel } from './BulkOperationsPanel';
import { useFarmersQuery } from '@/hooks/data/useFarmersQuery';
import { useFarmerSegmentsQuery } from '@/hooks/data/useEnhancedFarmerQuery';
import type { Farmer } from '@/services/FarmersService';
import type { AdvancedSearchFilters } from '@/services/EnhancedFarmerService';

interface EnhancedFarmerDirectoryProps {
  onSelectFarmer: (farmer: Farmer) => void;
  selectedFarmers?: string[];
  onSelectedFarmersChange?: (farmers: string[]) => void;
  searchTerm?: string;
}

// Memoized farmer card component to prevent unnecessary re-renders
const FarmerCard = React.memo<{
  farmer: Farmer;
  isSelected: boolean;
  onSelect: (farmerId: string, selected: boolean) => void;
  onSelectFarmer: (farmer: Farmer) => void;
}>(({ farmer, isSelected, onSelect, onSelectFarmer }) => {
  const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(farmer.id, e.target.checked);
  }, [farmer.id, onSelect]);

  const handleViewProfile = useCallback(() => {
    onSelectFarmer(farmer);
  }, [farmer, onSelectFarmer]);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            {isSelected ? (
              <CheckSquare 
                className="h-4 w-4 text-primary cursor-pointer" 
                onClick={() => onSelect(farmer.id, false)}
              />
            ) : (
              <Square 
                className="h-4 w-4 text-muted-foreground cursor-pointer" 
                onClick={() => onSelect(farmer.id, true)}
              />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">{farmer.farmer_code}</h3>
              <Badge variant="secondary">
                {farmer.farming_experience_years} years exp
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Contact available
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Location available
              </div>
              <div>
                Land: {farmer.total_land_acres} acres
              </div>
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Crops: {farmer.primary_crops?.join(', ') || 'None'}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewProfile}
          >
            View Profile
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleViewProfile}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                Edit Farmer
              </DropdownMenuItem>
              <DropdownMenuItem>
                Add Note
              </DropdownMenuItem>
              <DropdownMenuItem>
                Send Message
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
});

FarmerCard.displayName = 'FarmerCard';

export const EnhancedFarmerDirectory: React.FC<EnhancedFarmerDirectoryProps> = React.memo(({
  onSelectFarmer,
  selectedFarmers = [],
  onSelectedFarmersChange = () => {},
  searchTerm = ''
}) => {
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [isBulkPanelOpen, setIsBulkPanelOpen] = useState(false);
  const [filters, setFilters] = useState<AdvancedSearchFilters>({});

  const { data: farmersData, isLoading, error } = useFarmersQuery({
    search: searchTerm,
    limit: 50,
  });

  const { data: segments = [] } = useFarmerSegmentsQuery();

  const farmers = farmersData?.data || [];

  // Memoize filtered farmers to prevent unnecessary recalculations
  const filteredFarmers = useMemo(() => {
    if (!searchTerm && Object.keys(filters).length === 0) {
      return farmers;
    }
    
    return farmers.filter(farmer => {
      // Apply search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!farmer.farmer_code.toLowerCase().includes(searchLower) &&
            !farmer.primary_crops?.some(crop => crop.toLowerCase().includes(searchLower))) {
          return false;
        }
      }
      
      // Apply additional filters here if needed
      return true;
    });
  }, [farmers, searchTerm, filters]);

  const handleFarmerSelect = useCallback((farmerId: string, selected: boolean) => {
    const newSelection = selected 
      ? [...selectedFarmers, farmerId]
      : selectedFarmers.filter(id => id !== farmerId);
    onSelectedFarmersChange(newSelection);
  }, [selectedFarmers, onSelectedFarmersChange]);

  const handleSelectAll = useCallback(() => {
    const newSelection = selectedFarmers.length === filteredFarmers.length 
      ? [] 
      : filteredFarmers.map(f => f.id);
    onSelectedFarmersChange(newSelection);
  }, [filteredFarmers, selectedFarmers, onSelectedFarmersChange]);

  const handleFiltersChange = useCallback((newFilters: AdvancedSearchFilters) => {
    setFilters(newFilters);
  }, []);

  const handleBulkOperationComplete = useCallback(() => {
    onSelectedFarmersChange([]);
    setIsBulkPanelOpen(false);
  }, [onSelectedFarmersChange]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading farmers...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">Error loading farmers: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Farmer Directory ({filteredFarmers.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAdvancedSearchOpen(true)}
              >
                Advanced Search
              </Button>
              {selectedFarmers.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkPanelOpen(true)}
                >
                  Bulk Actions ({selectedFarmers.length})
                </Button>
              )}
            </div>
          </div>

          {/* Select All */}
          {filteredFarmers.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center cursor-pointer" onClick={handleSelectAll}>
                {selectedFarmers.length === filteredFarmers.length ? (
                  <CheckSquare className="h-4 w-4 text-primary" />
                ) : (
                  <Square className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                Select all ({selectedFarmers.length} of {filteredFarmers.length} selected)
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredFarmers.map((farmer) => (
              <FarmerCard
                key={farmer.id}
                farmer={farmer}
                isSelected={selectedFarmers.includes(farmer.id)}
                onSelect={handleFarmerSelect}
                onSelectFarmer={onSelectFarmer}
              />
            ))}

            {filteredFarmers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No farmers found matching your criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Search Modal */}
      <AdvancedSearchModal
        open={isAdvancedSearchOpen}
        onOpenChange={setIsAdvancedSearchOpen}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        segments={segments}
        tags={[]}
      />

      {/* Bulk Operations Panel */}
      <BulkOperationsPanel
        open={isBulkPanelOpen}
        onOpenChange={setIsBulkPanelOpen}
        selectedFarmers={selectedFarmers}
        onComplete={handleBulkOperationComplete}
      />
    </>
  );
});

EnhancedFarmerDirectory.displayName = 'EnhancedFarmerDirectory';
