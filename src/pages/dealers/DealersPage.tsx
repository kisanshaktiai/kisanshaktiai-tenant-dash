
import React, { useState } from 'react';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRealTimeDealersQuery } from '@/hooks/data/useRealTimeDealersQuery';
import { DealerDirectory } from './components/DealerDirectory';
import { DealerOnboarding } from './components/DealerOnboarding';
import { TerritoryManagement } from './components/TerritoryManagement';
import { PerformanceTracking } from './components/PerformanceTracking';
import { CommunicationTools } from './components/CommunicationTools';
import { IncentiveManagement } from './components/IncentiveManagement';

export const DealersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDealers, setSelectedDealers] = useState<string[]>([]);

  const {
    data: dealersData,
    isLoading,
    error
  } = useRealTimeDealersQuery({
    search: searchTerm,
    limit: 50,
  });

  const dealers = dealersData?.data || [];
  const totalCount = dealersData?.count || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dealer Network</h1>
          <p className="text-muted-foreground">
            Manage your dealer network and track their performance
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Dealers
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Dealer
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search dealers by name, code, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="directory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="directory">Directory</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="territories">Territories</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="incentives">Incentives</TabsTrigger>
        </TabsList>

        <TabsContent value="directory">
          <DealerDirectory />
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

        <TabsContent value="communication">
          <CommunicationTools />
        </TabsContent>

        <TabsContent value="incentives">
          <IncentiveManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DealersPage;
