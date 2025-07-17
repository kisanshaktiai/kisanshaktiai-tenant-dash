
import { useState, useEffect } from 'react';
import { useRealTimeFarmers } from '@/hooks/useRealTimeData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, Filter, Download, MoreHorizontal, MapPin, 
  Phone, Mail, Calendar, Edit, Eye, MessageSquare,
  Users, Sprout, TrendingUp, AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface FarmerDirectoryProps {
  onFarmerSelect: (farmer: any) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const FarmerDirectory = ({ 
  onFarmerSelect, 
  searchQuery, 
  onSearchChange 
}: FarmerDirectoryProps) => {
  const [selectedFarmers, setSelectedFarmers] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    state: '',
    district: '',
    cropType: '',
    status: '',
    verification: ''
  });

  // Real-time farmers data
  const { data: farmers, loading, error } = useRealTimeFarmers();

  // Use real farmers data directly
  const displayFarmers = farmers || [];

  const filteredFarmers = displayFarmers.filter(farmer => {
    // Handle search with actual database fields
    const farmerName = farmer.id || ''; // We'll need to add a name field or use farmer_code
    const farmerPhone = '';  // These will be added to profiles table
    const farmerEmail = '';
    
    const matchesSearch = searchQuery === '' || 
                         farmer.farmer_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         farmer.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilters = 
      (!filters.verification || 
        (filters.verification === 'verified' ? farmer.is_verified : !farmer.is_verified));
    
    return matchesSearch && matchesFilters;
  });

  const handleSelectFarmer = (farmerId: string) => {
    setSelectedFarmers(prev => 
      prev.includes(farmerId) 
        ? prev.filter(id => id !== farmerId)
        : [...prev, farmerId]
    );
  };

  const handleSelectAll = () => {
    setSelectedFarmers(
      selectedFarmers.length === filteredFarmers.length 
        ? [] 
        : filteredFarmers.map(f => f.id)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'destructive';
      default: return 'secondary';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <Input
                placeholder="Search farmers by name, phone, or email..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filters.state} onValueChange={(value) => setFilters({...filters, state: value})}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Haryana">Haryana</SelectItem>
                  <SelectItem value="Punjab">Punjab</SelectItem>
                  <SelectItem value="Uttar Pradesh">UP</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedFarmers.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {selectedFarmers.length} farmer(s) selected
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Bulk Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Farmer List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Farmers ({filteredFarmers.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Checkbox 
                checked={selectedFarmers.length === filteredFarmers.length}
                onCheckedChange={handleSelectAll}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredFarmers.map((farmer) => (
              <div
                key={farmer.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  checked={selectedFarmers.includes(farmer.id)}
                  onCheckedChange={() => handleSelectFarmer(farmer.id)}
                />
                
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {farmer.farmer_code ? farmer.farmer_code.slice(0, 2).toUpperCase() : 'F'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">
                      {farmer.farmer_code || `Farmer ${farmer.id.slice(0, 8)}`}
                    </h3>
                    {farmer.is_verified && (
                      <Badge variant="outline" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Joined: {new Date(farmer.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Sprout className="h-3 w-3" />
                      {farmer.total_land_acres || 0} acres
                    </span>
                    {farmer.farming_experience_years && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {farmer.farming_experience_years} yrs exp
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    {farmer.primary_crops && farmer.primary_crops.map(crop => (
                      <Badge key={crop} variant="secondary" className="text-xs">
                        {crop}
                      </Badge>
                    ))}
                    {farmer.farm_type && (
                      <Badge variant="outline" className="text-xs">
                        {farmer.farm_type}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium">
                    Opens: {farmer.total_app_opens || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Queries: {farmer.total_queries || 0}
                  </div>
                  {farmer.last_app_open && (
                    <div className="text-xs text-muted-foreground">
                      Last: {new Date(farmer.last_app_open).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onFarmerSelect(farmer)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Phone className="h-4 w-4 mr-2" />
                      Call Farmer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
