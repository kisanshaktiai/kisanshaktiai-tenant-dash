
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Users, 
  UserCheck, 
  TrendingUp,
  Filter,
  Download,
  MoreHorizontal,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import { EnhancedCreateFarmerContainer } from './EnhancedCreateFarmerContainer';
import { useFarmersData } from '@/hooks/data/useFarmersData';
import { useAppSelector } from '@/store/hooks';

export const FarmersPageContainer: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { data: farmersData, isLoading, refetch } = useFarmersData();

  const farmers = farmersData?.data || [];
  const totalCount = farmersData?.count || 0;

  const handleCreateSuccess = (result: any) => {
    console.log('Farmer created successfully:', result);
    refetch(); // Refresh the farmers list
  };

  const filteredFarmers = farmers.filter(farmer => 
    farmer.farmer_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (farmer as any).phone_number?.includes(searchTerm)
  );

  const verifiedCount = farmers.filter(farmer => farmer.is_verified).length;
  const activeCount = farmers.filter(farmer => farmer.total_app_opens > 0).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Farmers</h1>
          <p className="text-muted-foreground">
            Manage your farmer network and registrations
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Farmer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedCount}</div>
            <p className="text-xs text-muted-foreground">
              {totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {farmers.filter(f => {
                const created = new Date(f.created_at);
                const now = new Date();
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              New registrations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search farmers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Farmers List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Farmers ({filteredFarmers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredFarmers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No farmers found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 
                  'No farmers match your search criteria.' : 
                  'Get started by adding your first farmer.'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Farmer
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFarmers.map((farmer) => (
                <div
                  key={farmer.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          {farmer.farmer_code || 'Unnamed Farmer'}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {farmer.farmer_code}
                        </Badge>
                        {farmer.is_verified && (
                          <Badge variant="default" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          Contact Info Available
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {farmer.total_land_acres || 0} acres
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Farm Location
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right text-sm">
                      <div className="font-medium">
                        {farmer.primary_crops?.slice(0, 2).join(', ') || 'No crops'}
                        {farmer.primary_crops?.length > 2 && ' +' + (farmer.primary_crops.length - 2)}
                      </div>
                      <div className="text-gray-500">
                        {farmer.farming_experience_years || 0} years experience
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Farmer Dialog */}
      <EnhancedCreateFarmerContainer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};
