
import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRealTimeFarmersQuery } from '@/hooks/data/useRealTimeFarmersQuery';
import { FarmerProfile } from './FarmerProfile';
import type { Farmer } from '@/services/FarmersService';

export const FarmerDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const {
    data: farmersResponse,
    isLoading,
    error
  } = useRealTimeFarmersQuery({
    search: searchTerm,
    limit: 50,
  });

  const farmers = farmersResponse?.data || [];

  const handleViewProfile = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setShowProfile(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading farmers: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search farmers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {farmers.map((farmer: Farmer) => (
          <Card key={farmer.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {farmer.farmer_code}
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleViewProfile(farmer)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Experience: {farmer.farming_experience_years} years
                </p>
                <p className="text-sm text-muted-foreground">
                  Land: {farmer.total_land_acres} acres
                </p>
                <div className="flex flex-wrap gap-1">
                  {farmer.primary_crops.slice(0, 2).map((crop, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {crop}
                    </Badge>
                  ))}
                  {farmer.primary_crops.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{farmer.primary_crops.length - 2} more
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={farmer.is_verified ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {farmer.is_verified ? "Verified" : "Pending"}
                  </Badge>
                  {farmer.has_irrigation && (
                    <Badge variant="outline" className="text-xs">
                      Irrigation
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {farmers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No farmers found</p>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && selectedFarmer && (
        <FarmerProfile
          farmer={selectedFarmer}
          onClose={() => {
            setShowProfile(false);
            setSelectedFarmer(null);
          }}
        />
      )}
    </div>
  );
};
