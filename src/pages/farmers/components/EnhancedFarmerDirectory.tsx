
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Search, Tag, Users, Phone, MapPin } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AdvancedSearchModal } from './AdvancedSearchModal';
import { BulkOperationsPanel } from './BulkOperationsPanel';
import { useFarmersQuery } from '@/hooks/data/useFarmersQuery';
import type { Farmer } from '@/services/FarmersService';

interface EnhancedFarmerDirectoryProps {
  onSelectFarmer: (farmer: Farmer) => void;
}

export const EnhancedFarmerDirectory: React.FC<EnhancedFarmerDirectoryProps> = ({
  onSelectFarmer
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFarmers, setSelectedFarmers] = useState<string[]>([]);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [isBulkPanelOpen, setIsBulkPanelOpen] = useState(false);

  const { data: farmersData, isLoading, error } = useFarmersQuery({
    search: searchTerm,
    limit: 50,
  });

  const farmers = farmersData?.data || [];

  const handleFarmerSelect = (farmerId: string, selected: boolean) => {
    if (selected) {
      setSelectedFarmers([...selectedFarmers, farmerId]);
    } else {
      setSelectedFarmers(selectedFarmers.filter(id => id !== farmerId));
    }
  };

  const handleSelectAll = () => {
    if (selectedFarmers.length === farmers.length) {
      setSelectedFarmers([]);
    } else {
      setSelectedFarmers(farmers.map(f => f.id));
    }
  };

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
              Farmer Directory ({farmers.length})
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
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search farmers by name, code, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Select All */}
          {farmers.length > 0 && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedFarmers.length === farmers.length}
                onChange={handleSelectAll}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-muted-foreground">
                Select all ({selectedFarmers.length} of {farmers.length} selected)
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {farmers.map((farmer) => (
              <Card key={farmer.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedFarmers.includes(farmer.id)}
                      onChange={(e) => handleFarmerSelect(farmer.id, e.target.checked)}
                      className="rounded border-gray-300"
                    />
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
                          {farmer.phone || 'No phone'}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {farmer.village || 'Unknown location'}
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
                      onClick={() => onSelectFarmer(farmer)}
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
                        <DropdownMenuItem onClick={() => onSelectFarmer(farmer)}>
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
            ))}

            {farmers.length === 0 && (
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
      />

      {/* Bulk Operations Panel */}
      <BulkOperationsPanel
        open={isBulkPanelOpen}
        onOpenChange={setIsBulkPanelOpen}
        selectedFarmers={selectedFarmers}
        onClearSelection={() => setSelectedFarmers([])}
      />
    </>
  );
};
