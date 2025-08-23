
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MapPin, TrendingUp, MessageSquare, Award, Settings, Plus, Search } from 'lucide-react';
import type { EnhancedDealer } from '@/types/dealer';
import { DealerDirectory } from '@/pages/dealers/components/DealerDirectory';
import { TerritoryManagement } from '@/pages/dealers/components/TerritoryManagement';
import { PerformanceTracking } from '@/pages/dealers/components/PerformanceTracking';
import { CommunicationTools } from '@/pages/dealers/components/CommunicationTools';
import { IncentiveManagement } from '@/pages/dealers/components/IncentiveManagement';
import { DealerOnboarding } from '@/pages/dealers/components/DealerOnboarding';

interface DealersPagePresentationProps {
  dealers: EnhancedDealer[];
  totalCount: number;
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
  selectedDealers: string[];
  onSearch: (value: string) => void;
  onSelectedDealersChange: (dealers: string[]) => void;
  isLive?: boolean;
  activeChannels?: number;
}

export const DealersPagePresentation: React.FC<DealersPagePresentationProps> = ({
  dealers,
  totalCount,
  isLoading,
  error,
  searchTerm,
  selectedDealers,
  onSearch,
  onSelectedDealersChange,
  isLive,
  activeChannels,
}) => {
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading dealers: {error.message}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Dealers',
      value: totalCount.toLocaleString(),
      icon: Users,
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: 'Active Dealers',
      value: dealers.filter(d => d.is_active).length.toLocaleString(),
      icon: Users,
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      title: 'Territories',
      value: '24',
      icon: MapPin,
      change: '+3%',
      changeType: 'positive' as const,
    },
    {
      title: 'Avg Performance',
      value: '87.5%',
      icon: TrendingUp,
      change: '+5.2%',
      changeType: 'positive' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dealer Network</h1>
          <p className="text-muted-foreground">
            Manage your dealer network and monitor performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Dealer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className={stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                        {stat.change}
                      </span>{' '}
                      from last month
                    </p>
                  </div>
                  <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="directory" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="directory" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Directory
          </TabsTrigger>
          <TabsTrigger value="onboarding" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Onboarding
          </TabsTrigger>
          <TabsTrigger value="territories" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Territories
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="communications" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Communications
          </TabsTrigger>
          <TabsTrigger value="incentives" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Incentives
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory">
          <DealerDirectory 
            dealers={dealers}
            loading={isLoading}
            searchTerm={searchTerm}
            onSearch={onSearch}
            selectedDealers={selectedDealers}
            onSelectedDealersChange={onSelectedDealersChange}
          />
        </TabsContent>

        <TabsContent value="onboarding">
          <DealerOnboarding />
        </TabsContent>

        <TabsContent value="territories">
          <TerritoryManagement />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceTracking />
        </TabsContent>

        <TabsContent value="communications">
          <CommunicationTools />
        </TabsContent>

        <TabsContent value="incentives">
          <IncentiveManagement />
        </TabsContent>
      </Tabs>

      {/* Status Indicator */}
      {isLive && (
        <div className="fixed bottom-4 right-4">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Live ({activeChannels} channels)
          </Badge>
        </div>
      )}
    </div>
  );
};
