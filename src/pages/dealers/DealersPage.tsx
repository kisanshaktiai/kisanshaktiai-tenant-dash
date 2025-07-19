import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Users, MapPin, TrendingUp, MessageSquare, 
  Settings, Award, Download
} from 'lucide-react';
import { useRealTimeDealers } from '@/hooks/useRealTimeData';
import { DealerDirectory } from './components/DealerDirectory';
import { DealerOnboarding } from './components/DealerOnboarding';
import { TerritoryManagement } from './components/TerritoryManagement';
import { PerformanceTracking } from './components/PerformanceTracking';
import { CommunicationTools } from './components/CommunicationTools';
import { IncentiveManagement } from './components/IncentiveManagement';

const DealersPage = () => {
  const [activeTab, setActiveTab] = useState('directory');
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const { data: dealers, loading, error } = useRealTimeDealers();

  const dealerStats = {
    totalDealers: dealers.length,
    activeDealers: dealers.filter(d => d.is_active).length,
    territories: 45,
    // Since verification_status doesn't exist in the basic Dealer type, 
    // we'll count inactive dealers as pending onboarding
    pendingOnboarding: dealers.filter(d => !d.is_active).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dealer Network</h1>
          <p className="text-muted-foreground">
            Manage your dealer network, territories, and performance tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button onClick={() => setShowOnboardingModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Dealer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dealers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dealerStats.totalDealers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Dealers</CardTitle>
            <Users className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dealerStats.activeDealers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Territories</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dealerStats.territories}</div>
            <p className="text-xs text-muted-foreground">
              95% coverage achieved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Settings className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{dealerStats.pendingOnboarding}</div>
            <p className="text-xs text-muted-foreground">
              Require onboarding
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="directory">
            <Users className="mr-2 h-4 w-4" />
            Directory
          </TabsTrigger>
          <TabsTrigger value="territories">
            <MapPin className="mr-2 h-4 w-4" />
            Territories
          </TabsTrigger>
          <TabsTrigger value="performance">
            <TrendingUp className="mr-2 h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="communication">
            <MessageSquare className="mr-2 h-4 w-4" />
            Communication
          </TabsTrigger>
          <TabsTrigger value="incentives">
            <Award className="mr-2 h-4 w-4" />
            Incentives
          </TabsTrigger>
          <TabsTrigger value="onboarding">
            <Settings className="mr-2 h-4 w-4" />
            Onboarding
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory">
          <DealerDirectory dealers={dealers} loading={loading} />
        </TabsContent>

        <TabsContent value="territories">
          <TerritoryManagement />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceTracking />
        </TabsContent>

        <TabsContent value="communication">
          <CommunicationTools />
        </TabsContent>

        <TabsContent value="incentives">
          <IncentiveManagement />
        </TabsContent>

        <TabsContent value="onboarding">
          <DealerOnboarding />
        </TabsContent>
      </Tabs>

      {/* Onboarding Modal */}
      {showOnboardingModal && (
        <DealerOnboarding 
          isModal={true}
          onClose={() => setShowOnboardingModal(false)}
        />
      )}
    </div>
  );
};

export default DealersPage;
