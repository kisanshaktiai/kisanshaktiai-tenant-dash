
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BarChart3, List, Target } from 'lucide-react';
import { CampaignDashboard } from './campaigns/components/CampaignDashboard';
import { CampaignList } from './campaigns/components/CampaignList';
import { CampaignWizard } from './campaigns/components/CampaignWizard';
import { useCreateCampaignMutation } from '@/hooks/data/useCampaignsQuery';
import { Campaign } from '@/types/campaign';

const CampaignsPage = () => {
  const [showWizard, setShowWizard] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [viewingAnalytics, setViewingAnalytics] = useState<Campaign | null>(null);
  
  const createCampaignMutation = useCreateCampaignMutation();

  const handleCreateCampaign = async (campaignData: Partial<Campaign>) => {
    try {
      await createCampaignMutation.mutateAsync(campaignData);
      setShowWizard(false);
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setShowWizard(true);
  };

  const handleViewAnalytics = (campaign: Campaign) => {
    setViewingAnalytics(campaign);
  };

  if (showWizard) {
    return (
      <div className="p-6">
        <CampaignWizard
          onComplete={handleCreateCampaign}
          onCancel={() => {
            setShowWizard(false);
            setEditingCampaign(null);
          }}
          initialData={editingCampaign || undefined}
        />
      </div>
    );
  }

  if (viewingAnalytics) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Campaign Analytics</h1>
            <p className="text-muted-foreground">
              Detailed performance metrics for "{viewingAnalytics.name}"
            </p>
          </div>
          <Button variant="outline" onClick={() => setViewingAnalytics(null)}>
            Back to Campaigns
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>
              Analytics data for this campaign will be available here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Campaign analytics dashboard coming soon...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">
            Create and manage your marketing campaigns
          </p>
        </div>
        <Button onClick={() => setShowWizard(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            All Campaigns
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <CampaignDashboard />
        </TabsContent>

        <TabsContent value="campaigns">
          <CampaignList 
            onEdit={handleEditCampaign}
            onViewAnalytics={handleViewAnalytics}
          />
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Templates</CardTitle>
              <CardDescription>
                Pre-built templates to get you started quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    name: 'New Product Launch',
                    description: 'Announce new products to your farmer network',
                    type: 'promotional',
                    icon: '🚀'
                  },
                  {
                    name: 'Seasonal Farming Tips',
                    description: 'Educational content for seasonal farming practices',
                    type: 'educational',
                    icon: '🌱'
                  },
                  {
                    name: 'Government Scheme Alert',
                    description: 'Notify farmers about new government schemes',
                    type: 'government_scheme',
                    icon: '🏛️'
                  },
                  {
                    name: 'Weather Alert',
                    description: 'Emergency weather and farming alerts',
                    type: 'seasonal',
                    icon: '⛈️'
                  },
                  {
                    name: 'Payment Reminder',
                    description: 'Gentle reminders for pending payments',
                    type: 'promotional',
                    icon: '💰'
                  },
                  {
                    name: 'Harvest Success Story',
                    description: 'Share success stories to inspire farmers',
                    type: 'educational',
                    icon: '🏆'
                  }
                ].map((template) => (
                  <Card key={template.name} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{template.icon}</span>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                      </div>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampaignsPage;
