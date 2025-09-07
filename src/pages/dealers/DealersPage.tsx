
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Store, 
  Sparkles, 
  TrendingUp,
  Users,
  Target,
  TrendingDown,
  Award,
  ArrowUp,
  ArrowDown,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { AddDealerForm } from '@/components/dealers/forms/AddDealerForm';
import { useRealTimeDealersQuery } from '@/hooks/data/useRealTimeDealersQuery';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import DealerDirectory from './components/DealerDirectory';
import TerritoryManagement from './components/TerritoryManagement';
import PerformanceTracking from './components/PerformanceTracking';
import CommunicationTools from './components/CommunicationTools';
import IncentiveManagement from './components/IncentiveManagement';
import DealerOnboarding from './components/DealerOnboarding';

export default function DealersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDealers, setSelectedDealers] = useState<string[]>([]);
  
  // Fetch dealers data with real-time updates
  const { 
    data: dealersData, 
    isLoading,
    isLive,
    activeChannels 
  } = useRealTimeDealersQuery({
    search: searchTerm,
    limit: 100
  });
  
  const dealers = dealersData?.data || [];
  const totalCount = dealersData?.count || 0;
  
  // Calculate statistics
  const stats = {
    total: totalCount,
    active: dealers.filter(d => d.status === 'active').length,
    pending: dealers.filter(d => d.onboarding_status === 'pending').length,
    verified: dealers.filter(d => d.verification_status === 'verified').length,
    totalSales: dealers.reduce((sum, d) => sum + (d.sales_achieved || 0), 0),
    avgPerformance: dealers.length > 0 
      ? dealers.reduce((sum, d) => sum + (d.performance_score || 0), 0) / dealers.length
      : 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/10">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 lg:space-y-8">
        {/* Add Dealer Form Modal */}
        <AddDealerForm 
          open={isCreateModalOpen} 
          onOpenChange={setIsCreateModalOpen} 
        />
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
                      className="gap-2 shadow-soft bg-gradient-primary hover:opacity-90 transition-all duration-200 hover:scale-105"
                    >
                      <Plus className="h-4 w-4" />
                      Add New Dealer
                    </Button>
                  </div>
                </PermissionGuard>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-soft bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Dealers</p>
                    <div className="flex items-baseline gap-2">
                      {isLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <h2 className="text-3xl font-bold">{stats.total}</h2>
                      )}
                      <Badge variant="secondary" className="gap-1">
                        <ArrowUp className="h-3 w-3" />
                        12%
                      </Badge>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-soft bg-gradient-to-br from-green-500/10 to-green-500/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Dealers</p>
                    <div className="flex items-baseline gap-2">
                      {isLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <h2 className="text-3xl font-bold">{stats.active}</h2>
                      )}
                      <span className="text-sm text-green-600">
                        {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-soft bg-gradient-to-br from-amber-500/10 to-amber-500/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                    <div className="flex items-baseline gap-2">
                      {isLoading ? (
                        <Skeleton className="h-8 w-20" />
                      ) : (
                        <h2 className="text-3xl font-bold">₹{(stats.totalSales / 100000).toFixed(1)}L</h2>
                      )}
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Target className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 shadow-soft bg-gradient-to-br from-blue-500/10 to-blue-500/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Performance</p>
                    <div className="flex items-baseline gap-2">
                      {isLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <h2 className="text-3xl font-bold">{stats.avgPerformance.toFixed(1)}%</h2>
                      )}
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
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
              {/* Additional Add Dealer Button for Testing */}
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                variant="default"
                className="gap-2 h-11 shadow-soft"
              >
                <Plus className="h-4 w-4" />
                Quick Add Dealer
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
