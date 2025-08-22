
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Plus, Filter, Download, MoreVertical } from 'lucide-react';
import type { EnhancedDealer } from '@/types/dealer';

interface DealerDirectoryProps {
  dealers: EnhancedDealer[];
  loading: boolean;
  searchTerm: string;
  onSearch: (value: string) => void;
  selectedDealers: string[];
  onSelectedDealersChange: (dealers: string[]) => void;
}

export const DealerDirectory: React.FC<DealerDirectoryProps> = ({
  dealers,
  loading,
  searchTerm,
  onSearch,
  selectedDealers,
  onSelectedDealersChange,
}) => {
  const handleSelectAll = () => {
    if (selectedDealers.length === dealers.length) {
      onSelectedDealersChange([]);
    } else {
      onSelectedDealersChange(dealers.map(d => d.id));
    }
  };

  const handleSelectDealer = (dealerId: string) => {
    if (selectedDealers.includes(dealerId)) {
      onSelectedDealersChange(selectedDealers.filter(id => id !== dealerId));
    } else {
      onSelectedDealersChange([...selectedDealers, dealerId]);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search dealers..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
        
        <div className="flex gap-2">
          {selectedDealers.length > 0 && (
            <>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export ({selectedDealers.length})
              </Button>
              <Button variant="outline" size="sm">
                Bulk Actions
              </Button>
            </>
          )}
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Dealer
          </Button>
        </div>
      </div>

      {/* Select All */}
      {dealers.length > 0 && (
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={selectedDealers.length === dealers.length && dealers.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm text-muted-foreground">
            Select all ({dealers.length} dealers)
          </span>
        </div>
      )}

      {/* Dealers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dealers.map((dealer) => (
          <Card key={dealer.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedDealers.includes(dealer.id)}
                    onCheckedChange={() => handleSelectDealer(dealer.id)}
                  />
                  <div>
                    <CardTitle className="text-lg">{dealer.business_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{dealer.dealer_code}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">{dealer.contact_person}</p>
                <p className="text-sm text-muted-foreground">{dealer.phone}</p>
                <p className="text-sm text-muted-foreground">{dealer.email}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant={dealer.is_active ? 'default' : 'secondary'}>
                  {dealer.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant={dealer.registration_status === 'verified' ? 'default' : 'secondary'}>
                  {dealer.registration_status || 'Pending'}
                </Badge>
                <Badge variant={dealer.kyc_status === 'verified' ? 'default' : 'secondary'}>
                  KYC: {dealer.kyc_status || 'Pending'}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {dealers.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            {searchTerm 
              ? `No dealers match "${searchTerm}"`
              : "No dealers found"
            }
          </div>
          {!searchTerm && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Dealer
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
