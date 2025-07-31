
import React, { useState } from 'react';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRealTimeFarmersQuery } from '@/hooks/data/useRealTimeFarmersQuery';
import { CreateFarmerModal } from './components/CreateFarmerModal';
import { FarmerDirectory } from './components/FarmerDirectory';
import { FarmerStats } from './components/FarmerStats';
import { BulkOperations } from './components/BulkOperations';
import { EngagementTracking } from './components/EngagementTracking';
import { LeadManagement } from './components/LeadManagement';
import { FarmerImportModal } from './components/FarmerImportModal';
import type { Farmer } from '@/services/FarmersService';

export const FarmersPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFarmers, setSelectedFarmers] = useState<string[]>([]);

  // Use the new query hook with real-time updates
  const {
    data: farmersData,
    isLoading,
    error,
    refetch
  } = useRealTimeFarmersQuery({
    search: searchTerm,
    limit: 50,
  });

  const farmers = (farmersData as any)?.data || [];
  const totalCount = (farmersData as any)?.count || 0;

  const handleCreateSuccess = () => {
    // No need to manually refetch - React Query handles this automatically
    setIsCreateModalOpen(false);
  };

  const handleImportSuccess = () => {
    setIsImportModalOpen(false);
    refetch(); // Refresh the list after bulk import
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // The query will automatically refetch with the new search term
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Farmer Management</h1>
          <p className="text-muted-foreground">
            Manage your farmer network and track their engagement
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsImportModalOpen(true)}
          >
            <Download className="mr-2 h-4 w-4" />
            Import Farmers
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Farmer
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search farmers by name, code, or crops..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="directory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="directory">Directory</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="bulk-ops">Bulk Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-4">
          <FarmerStats />
          <div className="bg-white rounded-lg p-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-8">
                Error loading farmers: {error.message}
              </div>
            ) : (
              <div>
                <p className="mb-4">Total Farmers: {totalCount}</p>
                <div className="grid gap-4">
                  {farmers.map((farmer: Farmer) => (
                    <div key={farmer.id} className="border rounded p-4">
                      <h3 className="font-semibold">{farmer.farmer_code}</h3>
                      <p className="text-sm text-muted-foreground">
                        Experience: {farmer.farming_experience_years} years
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Land: {farmer.total_land_acres} acres
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <FarmerStats />
        </TabsContent>

        <TabsContent value="engagement">
          <EngagementTracking />
        </TabsContent>

        <TabsContent value="leads">
          <LeadManagement />
        </TabsContent>

        <TabsContent value="bulk-ops">
          <BulkOperations selectedFarmers={selectedFarmers} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateFarmerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <FarmerImportModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
};

// Default export for App.tsx compatibility
export default FarmersPage;
