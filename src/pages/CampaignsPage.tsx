
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Megaphone, Calendar, Users, BarChart3, Play, Pause, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { CampaignWizard } from '@/components/campaigns/CampaignWizard';
import { campaignService, Campaign } from '@/services/CampaignService';
import { toast } from 'sonner';

export default function CampaignsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await campaignService.getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'draft': return 'bg-gray-500';
      case 'scheduled': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-purple-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeColor = (type: Campaign['campaign_type']) => {
    switch (type) {
      case 'promotional': return 'bg-purple-500';
      case 'educational': return 'bg-blue-500';
      case 'seasonal': return 'bg-orange-500';
      case 'government_scheme': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleCampaignAction = async (action: string, campaignId: string) => {
    try {
      switch (action) {
        case 'start':
          await campaignService.updateCampaign(campaignId, { status: 'active' });
          toast.success('Campaign started successfully');
          break;
        case 'pause':
          await campaignService.updateCampaign(campaignId, { status: 'paused' });
          toast.success('Campaign paused');
          break;
        case 'stop':
          await campaignService.updateCampaign(campaignId, { status: 'completed' });
          toast.success('Campaign stopped');
          break;
        case 'execute':
          await campaignService.executeCampaign(campaignId);
          toast.success('Campaign execution started');
          break;
      }
      loadCampaigns();
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error('Failed to update campaign');
    }
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const draftCampaigns = campaigns.filter(c => c.status === 'draft').length;
  const totalReach = campaigns.reduce((sum, c) => sum + c.target_audience_size, 0);
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.total_budget || 0), 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent_budget, 0);
  const budgetUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="h-8 w-8" />
            Campaign Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage promotional and educational campaigns
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Reports
          </Button>
          <PermissionGuard permission="campaigns.create">
            <Button onClick={() => setWizardOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {draftCampaigns} drafts pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReach.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Target audience size
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetUtilization}%</div>
            <p className="text-xs text-muted-foreground">
              ₹{totalSpent.toLocaleString()} of ₹{totalBudget.toLocaleString()}
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
              {campaigns.filter(c => 
                new Date(c.created_at).getMonth() === new Date().getMonth()
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Campaigns launched
            </p>
          </CardContent>
        </Card>
      </div>

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
                placeholder="Search campaigns by name, type, or status..."
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
      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">All Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="audiences">Audiences</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
                    <div className="h-3 bg-muted rounded w-full mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredCampaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">{campaign.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {campaign.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-3">
                            <Badge className={`${getTypeColor(campaign.campaign_type)} text-white`}>
                              {campaign.campaign_type.replace('_', ' ')}
                            </Badge>
                            <Badge className={`${getStatusColor(campaign.status)} text-white`}>
                              {campaign.status}
                            </Badge>
                            {campaign.start_date && (
                              <span className="text-sm text-muted-foreground">
                                {new Date(campaign.start_date).toLocaleDateString()}
                                {campaign.end_date && ` - ${new Date(campaign.end_date).toLocaleDateString()}`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Target Reach</div>
                        <div className="text-lg font-semibold">
                          {campaign.target_audience_size.toLocaleString()}
                        </div>
                        {campaign.total_budget && (
                          <div className="text-sm text-muted-foreground">
                            Budget: ₹{campaign.spent_budget.toLocaleString()} / ₹{campaign.total_budget.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Channels:</span>
                          {campaign.channels?.map((channel) => (
                            <Badge key={channel} variant="outline">{channel.toUpperCase()}</Badge>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <PermissionGuard permission="campaigns.view">
                            <Button variant="outline" size="sm">View Details</Button>
                          </PermissionGuard>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {campaign.status === 'draft' && (
                                <DropdownMenuItem onClick={() => handleCampaignAction('start', campaign.id)}>
                                  <Play className="w-4 h-4 mr-2" />
                                  Start Campaign
                                </DropdownMenuItem>
                              )}
                              {campaign.status === 'active' && (
                                <DropdownMenuItem onClick={() => handleCampaignAction('pause', campaign.id)}>
                                  <Pause className="w-4 h-4 mr-2" />
                                  Pause Campaign
                                </DropdownMenuItem>
                              )}
                              {campaign.status === 'scheduled' && (
                                <DropdownMenuItem onClick={() => handleCampaignAction('execute', campaign.id)}>
                                  Execute Now
                                </DropdownMenuItem>
                              )}
                              <PermissionGuard permission="campaigns.edit">
                                <DropdownMenuItem>Edit Campaign</DropdownMenuItem>
                              </PermissionGuard>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">85%</div>
                  <div className="text-sm text-blue-700">Avg Delivery Rate</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">42%</div>
                  <div className="text-sm text-green-700">Avg Open Rate</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">15%</div>
                  <div className="text-sm text-yellow-700">Avg Click Rate</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">4.2%</div>
                  <div className="text-sm text-purple-700">Avg Conversion Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Pre-built campaign templates for quick setup.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audiences">
          <Card>
            <CardHeader>
              <CardTitle>Target Audiences & Segments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Manage and segment your target audiences.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automations">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Automations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Set up automated campaign triggers and workflows.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CampaignWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        campaignId={selectedCampaign}
      />
    </div>
  );
}
