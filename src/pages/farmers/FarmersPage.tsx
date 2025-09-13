
import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Users, Upload, Target, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RealtimeFarmerDirectory } from '@/components/farmers/RealtimeFarmerDirectory';
import { CreateFarmerModal } from './components/CreateFarmerModal';
import { FarmerImportModal } from './components/FarmerImportModal';
import { BulkOperations } from './components/BulkOperations';
import { EngagementTracking } from './components/EngagementTracking';
import { LeadManagement } from './components/LeadManagement';
import { FarmerStats } from './components/FarmerStats';
import { FarmerProfile } from './components/FarmerProfile';
import { AdvancedFilters } from './components/AdvancedFilters';
import { FarmerAnalytics } from './components/FarmerAnalytics';
import { CampaignCenter } from './components/CampaignCenter';
import { IntegrationHub } from './components/IntegrationHub';
import type { Farmer } from '@/services/FarmersService';

export default function FarmersPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('directory');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedFarmers, setSelectedFarmers] = useState<string[]>([]);

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

  const handleBulkExport = () => {
    // Implement bulk export functionality
    console.log('Exporting farmers:', selectedFarmers);
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8" />
            Farmer Management
          </h1>
          <p className="text-muted-foreground text-base lg:text-lg mt-2">
            Comprehensive farmer network management and engagement platform
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleBulkExport} disabled={selectedFarmers.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export ({selectedFarmers.length})
          </Button>
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import Farmers
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Farmer
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <FarmerStats />

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Search & Filter</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                {selectedFarmers.length} selected
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Advanced Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search farmers by name, phone, location, or farmer code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          {showAdvancedFilters && (
            <AdvancedFilters 
              onFiltersChange={(filters) => console.log('Filters changed:', filters)}
            />
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="directory" className="flex items-center gap-2">
            <Users className="h-4 w-4 hidden sm:block" />
            Directory
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Target className="h-4 w-4 hidden sm:block" />
            Bulk Ops
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 hidden sm:block" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="leads">Lead Mgmt</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="directory">
          <RealtimeFarmerDirectory
            onSelectFarmer={handleFarmerSelect}
            selectedFarmers={selectedFarmers}
            onSelectedFarmersChange={setSelectedFarmers}
            searchTerm={searchTerm}
          />
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

        <TabsContent value="analytics">
          <FarmerAnalytics />
        </TabsContent>

        <TabsContent value="campaigns">
          <CampaignCenter />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationHub />
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
