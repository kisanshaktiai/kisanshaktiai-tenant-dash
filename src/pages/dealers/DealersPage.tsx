
import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { DealerDirectory } from './components/DealerDirectory';
import { TerritoryManagement } from './components/TerritoryManagement';
import { PerformanceTracking } from './components/PerformanceTracking';
import { CommunicationTools } from './components/CommunicationTools';
import { IncentiveManagement } from './components/IncentiveManagement';
import { DealerOnboarding } from './components/DealerOnboarding';

export default function DealersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Store className="h-8 w-8" />
            Dealer Network
          </h1>
          <p className="text-muted-foreground">
            Manage your dealer network and distribution channels
          </p>
        </div>
        <div className="flex space-x-2">
          <PermissionGuard permission="dealers.create">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Dealer
            </Button>
          </PermissionGuard>
        </div>
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
                placeholder="Search dealers by name, location, or territory..."
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
          <TabsTrigger value="territory">Territory</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <PermissionGuard permission="dealers.edit">
            <TabsTrigger value="incentives">Incentives</TabsTrigger>
          </PermissionGuard>
          <PermissionGuard permission="dealers.create">
            <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          </PermissionGuard>
        </TabsList>

        <TabsContent value="directory">
          <DealerDirectory searchTerm={searchTerm} />
        </TabsContent>

        <TabsContent value="territory">
          <TerritoryManagement />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceTracking />
        </TabsContent>

        <TabsContent value="communication">
          <CommunicationTools />
        </TabsContent>

        <PermissionGuard permission="dealers.edit">
          <TabsContent value="incentives">
            <IncentiveManagement />
          </TabsContent>
        </PermissionGuard>

        <PermissionGuard permission="dealers.create">
          <TabsContent value="onboarding">
            <DealerOnboarding />
          </TabsContent>
        </PermissionGuard>
      </Tabs>
    </div>
  );
}
