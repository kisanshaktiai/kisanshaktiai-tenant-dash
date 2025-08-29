
import React from 'react';
import { Plus, Search, Filter, Download, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { FarmerDirectory } from '@/pages/farmers/components/FarmerDirectory';
import { CreateFarmerModal } from '@/pages/farmers/components/CreateFarmerModal';
import { FarmerImportModal } from '@/pages/farmers/components/FarmerImportModal';
import { BulkOperations } from '@/pages/farmers/components/BulkOperations';
import { EngagementTracking } from '@/pages/farmers/components/EngagementTracking';
import { LeadManagement } from '@/pages/farmers/components/LeadManagement';
import { FarmerStats } from '@/pages/farmers/components/FarmerStats';
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
  // Real-time props
  isLive?: boolean;
  activeChannels?: number;
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
  isLive = false,
  activeChannels = 0
}) => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-8 w-8" />
              Farmer Management
            </h1>
            <p className="text-muted-foreground">
              Manage your farmer network and track their engagement
            </p>
          </div>
          <LiveIndicator isConnected={isLive} activeChannels={activeChannels} />
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => onImportModalChange(true)}>
            <Download className="mr-2 h-4 w-4" />
            Import Farmers
          </Button>
          <Button onClick={onCreateModalOpen}>
            <Plus className="mr-2 h-4 w-4" />
            Add Farmer
          </Button>
        </div>
      </div>

      {/* Stats */}
      <FarmerStats />

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search farmers by name, phone, or location..."
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="directory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="directory">Directory</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="leads">Lead Management</TabsTrigger>
        </TabsList>

        <TabsContent value="directory">
          <FarmerDirectory />
        </TabsContent>

        <TabsContent value="bulk">
          <BulkOperations selectedFarmers={selectedFarmers} />
        </TabsContent>

        <TabsContent value="engagement">
          <EngagementTracking />
        </TabsContent>

        <TabsContent value="leads">
          <LeadManagement />
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
