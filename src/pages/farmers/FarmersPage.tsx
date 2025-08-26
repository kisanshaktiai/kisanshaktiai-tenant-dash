
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, TrendingUp, Database } from 'lucide-react';
import { FarmersPageContainer } from '@/components/farmers/containers/FarmersPageContainer';
import { CreateFarmerContainer } from '@/components/farmers/containers/CreateFarmerContainer';
import { FarmerPipeline } from './components/FarmerPipeline';

export const FarmersPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Farmer Management</h1>
          <p className="text-muted-foreground">
            Manage your farmer network and track engagement
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="directory" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Directory
          </TabsTrigger>
          <TabsTrigger value="add-farmer" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add Farmer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <FarmersPageContainer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <FarmerPipeline />
        </TabsContent>

        <TabsContent value="directory" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <FarmersPageContainer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-farmer" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <CreateFarmerContainer 
                isOpen={true}
                onClose={() => setActiveTab('overview')}
                onSuccess={() => setActiveTab('overview')}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
