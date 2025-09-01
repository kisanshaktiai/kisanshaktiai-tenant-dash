
import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Store, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PermissionGuard } from '@/components/guards/PermissionGuard';
import DealerDirectory from './components/DealerDirectory';
import TerritoryManagement from './components/TerritoryManagement';
import PerformanceTracking from './components/PerformanceTracking';
import CommunicationTools from './components/CommunicationTools';
import IncentiveManagement from './components/IncentiveManagement';
import DealerOnboarding from './components/DealerOnboarding';

export default function DealersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/10">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 lg:space-y-8">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-2xl -z-10" />
          <Card className="border-0 shadow-soft bg-gradient-to-r from-card via-card to-muted/10">
            <CardHeader className="pb-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                    <Store className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      Dealer Network Hub
                    </h1>
                    <p className="text-muted-foreground text-base lg:text-lg">
                      Manage your distribution network and optimize dealer performance
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary" className="gap-1.5">
                        <TrendingUp className="h-3 w-3" />
                        Active Network
                      </Badge>
                      <Badge variant="outline" className="gap-1.5">
                        <Sparkles className="h-3 w-3" />
                        Real-time Updates
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <PermissionGuard permission="dealers.create">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      variant="outline"
                      className="gap-2 shadow-soft border-0 bg-muted/50 hover:bg-muted/80"
                    >
                      <Download className="h-4 w-4" />
                      Export Data
                    </Button>
                    <Button 
                      onClick={() => setIsCreateModalOpen(true)}
                      className="gap-2 shadow-soft bg-gradient-primary hover:opacity-90"
                    >
                      <Plus className="h-4 w-4" />
                      Add Dealer
                    </Button>
                  </div>
                </PermissionGuard>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Enhanced Search Section */}
        <Card className="border-0 shadow-soft bg-gradient-to-r from-card to-muted/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
                <Input
                  placeholder="Search dealers by name, location, territory, or performance..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-0 bg-muted/50 focus:bg-background transition-colors"
                />
              </div>
              <Button 
                variant="outline" 
                className="gap-2 h-11 border-0 bg-muted/50 hover:bg-muted/80 shadow-soft"
              >
                <Filter className="h-4 w-4" />
                Advanced Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Tabs Section */}
        <Card className="border-0 shadow-soft">
          <CardContent className="p-0">
            <Tabs defaultValue="directory" className="w-full">
              <div className="border-b bg-muted/30 px-6">
                <TabsList className="h-12 bg-transparent border-0 gap-6">
                  <TabsTrigger 
                    value="directory" 
                    className="data-[state=active]:bg-background data-[state=active]:shadow-soft h-10 px-6 rounded-lg"
                  >
                    Directory
                  </TabsTrigger>
                  <TabsTrigger 
                    value="territory" 
                    className="data-[state=active]:bg-background data-[state=active]:shadow-soft h-10 px-6 rounded-lg"
                  >
                    Territory
                  </TabsTrigger>
                  <TabsTrigger 
                    value="performance" 
                    className="data-[state=active]:bg-background data-[state=active]:shadow-soft h-10 px-6 rounded-lg"
                  >
                    Performance
                  </TabsTrigger>
                  <TabsTrigger 
                    value="communication" 
                    className="data-[state=active]:bg-background data-[state=active]:shadow-soft h-10 px-6 rounded-lg"
                  >
                    Communication
                  </TabsTrigger>
                  <PermissionGuard permission="dealers.edit">
                    <TabsTrigger 
                      value="incentives" 
                      className="data-[state=active]:bg-background data-[state=active]:shadow-soft h-10 px-6 rounded-lg"
                    >
                      Incentives
                    </TabsTrigger>
                  </PermissionGuard>
                  <PermissionGuard permission="dealers.create">
                    <TabsTrigger 
                      value="onboarding" 
                      className="data-[state=active]:bg-background data-[state=active]:shadow-soft h-10 px-6 rounded-lg"
                    >
                      Onboarding
                    </TabsTrigger>
                  </PermissionGuard>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="directory" className="mt-0 space-y-6">
                  <DealerDirectory searchTerm={searchTerm} />
                </TabsContent>

                <TabsContent value="territory" className="mt-0 space-y-6">
                  <TerritoryManagement />
                </TabsContent>

                <TabsContent value="performance" className="mt-0 space-y-6">
                  <PerformanceTracking />
                </TabsContent>

                <TabsContent value="communication" className="mt-0 space-y-6">
                  <CommunicationTools />
                </TabsContent>

                <PermissionGuard permission="dealers.edit">
                  <TabsContent value="incentives" className="mt-0 space-y-6">
                    <IncentiveManagement />
                  </TabsContent>
                </PermissionGuard>

                <PermissionGuard permission="dealers.create">
                  <TabsContent value="onboarding" className="mt-0 space-y-6">
                    <DealerOnboarding />
                  </TabsContent>
                </PermissionGuard>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
