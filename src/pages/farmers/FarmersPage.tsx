
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, TrendingUp, Target, MessageSquare, 
  BarChart3, UserPlus
} from 'lucide-react';

// Import enhanced components
import { EnhancedFarmerDirectory } from './components/EnhancedFarmerDirectory';
import { FarmerProfile } from './components/FarmerProfile';
import { BulkOperations } from './components/BulkOperations';
import { EngagementTracking } from './components/EngagementTracking';
import { FarmerPipeline } from './components/FarmerPipeline';
import { LeadManagement } from './components/LeadManagement';
import { CreateFarmerContainer } from '@/components/farmers/containers/CreateFarmerContainer';

export default function FarmersPage() {
  const [activeTab, setActiveTab] = useState('directory');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Farmer Management</h1>
          <p className="text-muted-foreground">
            Comprehensive farmer network management and engagement
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="directory">
            <Users className="h-4 w-4 mr-2" />
            Directory
          </TabsTrigger>
          <TabsTrigger value="pipeline">
            <Target className="h-4 w-4 mr-2" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="engagement">
            <TrendingUp className="h-4 w-4 mr-2" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="leads">
            <UserPlus className="h-4 w-4 mr-2" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="bulk">
            <MessageSquare className="h-4 w-4 mr-2" />
            Bulk Ops
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-6">
          <EnhancedFarmerDirectory />
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <FarmerPipeline />
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
            <CardContent className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Advanced analytics dashboard coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Farmer Profile Modal */}
      {selectedFarmerId && (
        <FarmerProfile 
          farmerId={selectedFarmerId}
          onClose={() => setSelectedFarmerId(null)}
        />
      )}

      {/* Create Farmer Modal */}
      <CreateFarmerContainer
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
