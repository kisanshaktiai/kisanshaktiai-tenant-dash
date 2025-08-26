
import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FarmersPageContainer } from '@/components/farmers/containers/FarmersPageContainer';
import { CreateFarmerModal } from './components/CreateFarmerModal';
import { FarmerImportModal } from './components/FarmerImportModal';
import { BulkOperations } from './components/BulkOperations';
import { EngagementTracking } from './components/EngagementTracking';
import { LeadManagement } from './components/LeadManagement';
import { FarmerStats } from './components/FarmerStats';
import { FarmerProfile } from './components/FarmerProfile';
import { EnhancedFarmerDirectory } from './components/EnhancedFarmerDirectory';
import type { Farmer } from '@/services/FarmersService';

export default function FarmersPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
  };

  const handleImportModalChange = (open: boolean) => {
    setIsImportModalOpen(open);
  };

  const handleFarmerSelect = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
  };

  const handleCloseFarmerProfile = () => {
    setSelectedFarmer(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8" />
            Farmer Management
          </h1>
          <p className="text-muted-foreground">
            Manage your farmer network and track their engagement
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            Import Farmers
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
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
                onChange={(e) => setSearchTerm(e.target.value)}
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
          <EnhancedFarmerDirectory onSelectFarmer={handleFarmerSelect} />
        </TabsContent>

        <TabsContent value="bulk">
          <BulkOperations />
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
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
      
      <FarmerImportModal
        open={isImportModalOpen}
        onOpenChange={handleImportModalChange}
      />

      {/* Farmer Profile Modal */}
      {selectedFarmer && (
        <FarmerProfile 
          farmer={selectedFarmer}
          onClose={handleCloseFarmerProfile}
        />
      )}
    </div>
  );
}
