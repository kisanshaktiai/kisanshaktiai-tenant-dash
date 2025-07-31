
import React from 'react';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateFarmerModal } from '@/pages/farmers/components/CreateFarmerModal';
import { FarmerStats } from '@/pages/farmers/components/FarmerStats';
import { BulkOperations } from '@/pages/farmers/components/BulkOperations';
import { EngagementTracking } from '@/pages/farmers/components/EngagementTracking';
import { LeadManagement } from '@/pages/farmers/components/LeadManagement';
import { FarmerImportModal } from '@/pages/farmers/components/FarmerImportModal';
import type { Farmer } from '@/services/FarmersService';

interface FarmersPagePresentationProps {
  farmers: Farmer[];
  totalCount: number;
  isLoading: boolean;
  error: any;
  searchTerm: string;
  selectedFarmers: string[];
  isCreateModalOpen: boolean;
  isImportModalOpen: boolean;
  onSearch: (value: string) => void;
  onCreateModalOpen: () => void;
  onCreateModalClose: () => void;
  onCreateSuccess: () => void;
  onImportModalChange: (open: boolean) => void;
  onSelectedFarmersChange: (farmers: string[]) => void;
}

export const FarmersPagePresentation: React.FC<FarmersPagePresentationProps> = ({
  farmers,
  totalCount,
  isLoading,
  error,
  searchTerm,
  selectedFarmers,
  isCreateModalOpen,
  isImportModalOpen,
  onSearch,
  onCreateModalOpen,
  onCreateModalClose,
  onCreateSuccess,
  onImportModalChange,
  onSelectedFarmersChange,
}) => {
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
            onClick={() => onImportModalChange(true)}
          >
            <Download className="mr-2 h-4 w-4" />
            Import Farmers
          </Button>
          <Button onClick={onCreateModalOpen}>
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
                onChange={(e) => onSearch(e.target.value)}
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
          <BulkOperations />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateFarmerModal
        isOpen={isCreateModalOpen}
        onClose={onCreateModalClose}
        onSuccess={onCreateSuccess}
      />

      <FarmerImportModal
        open={isImportModalOpen}
        onOpenChange={onImportModalChange}
      />
    </div>
  );
};
