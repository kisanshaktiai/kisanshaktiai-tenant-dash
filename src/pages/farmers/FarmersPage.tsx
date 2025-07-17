import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, Filter, Download, Upload, Plus, Users, 
  MapPin, Phone, Mail, Calendar, MoreHorizontal,
  Eye, Edit, MessageSquare, UserCheck, TrendingUp
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { FarmerDirectory } from './components/FarmerDirectory';
import { FarmerProfile } from './components/FarmerProfile';
import { BulkOperations } from './components/BulkOperations';
import { EngagementTracking } from './components/EngagementTracking';
import { LeadManagement } from './components/LeadManagement';
import { FarmerImportModal } from './components/FarmerImportModal';
import { CreateFarmerModal } from './components/CreateFarmerModal';
import { FarmerStats } from './components/FarmerStats';

const FarmersPage = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const [activeTab, setActiveTab] = useState('directory');
  const [selectedFarmer, setSelectedFarmer] = useState<any>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Farmer Management</h1>
          <p className="text-muted-foreground">
            Manage your farmer network, track engagement, and optimize operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowImportModal(true)}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Farmer
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <FarmerStats />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="directory">
            <Users className="mr-2 h-4 w-4" />
            Directory
          </TabsTrigger>
          <TabsTrigger value="engagement">
            <TrendingUp className="mr-2 h-4 w-4" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="leads">
            <UserCheck className="mr-2 h-4 w-4" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="bulk">
            <MessageSquare className="mr-2 h-4 w-4" />
            Bulk Operations
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-6">
          <FarmerDirectory 
            onFarmerSelect={setSelectedFarmer}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <EngagementTracking />
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <LeadManagement />
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <BulkOperations />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Farmer Analytics</CardTitle>
              <CardDescription>
                Comprehensive insights into your farmer network performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Advanced analytics dashboard coming soon...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <FarmerImportModal 
        open={showImportModal}
        onOpenChange={setShowImportModal}
      />
      
      <CreateFarmerModal 
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />

      {/* Farmer Profile Sidebar */}
      {selectedFarmer && (
        <FarmerProfile 
          farmer={selectedFarmer}
          onClose={() => setSelectedFarmer(null)}
        />
      )}
    </div>
  );
};

export default FarmersPage;