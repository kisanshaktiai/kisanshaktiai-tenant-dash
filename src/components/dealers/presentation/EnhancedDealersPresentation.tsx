import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Store, MapPin, Users, TrendingUp, Phone, Mail, Search, 
  Plus, Upload, Filter, Download, BarChart3, Map, MessageSquare,
  Gift, Target, AlertCircle, CheckCircle, Clock, Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DealerDirectory } from './tabs/DealerDirectory';
import { DealerOnboarding } from './tabs/DealerOnboarding';
import { TerritoryManagement } from './tabs/TerritoryManagement';
import { PerformanceTracking } from './tabs/PerformanceTracking';
import { CommunicationHub } from './tabs/CommunicationHub';
import { IncentiveManagement } from './tabs/IncentiveManagement';
import type { Dealer } from '@/services/DealersService';

interface EnhancedDealersPresentationProps {
  dealers: Dealer[];
  totalCount: number;
  isLoading?: boolean;
  error?: any;
  searchTerm: string;
  selectedDealers: string[];
  onSearch: (value: string) => void;
  onSelectedDealersChange: React.Dispatch<React.SetStateAction<string[]>>;
  isLive?: boolean;
  activeChannels?: number;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const EnhancedDealersPresentation: React.FC<EnhancedDealersPresentationProps> = ({
  dealers,
  totalCount,
  isLoading,
  error,
  searchTerm,
  selectedDealers,
  onSearch,
  onSelectedDealersChange,
  isLive,
  activeChannels
}) => {
  const stats = {
    active: dealers.filter(d => d.status === 'active').length,
    pending: dealers.filter(d => d.onboarding_status === 'pending').length,
    verified: dealers.filter(d => d.verification_status === 'verified').length,
    totalSales: dealers.reduce((sum, d) => sum + (d.sales_achieved || 0), 0),
    avgPerformance: dealers.reduce((sum, d) => sum + (d.performance_score || 0), 0) / (dealers.length || 1)
  };

  return (
    <div className="w-full min-h-full bg-gradient-to-br from-background via-background to-primary/5 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Enhanced Header with Animation */}
      <motion.div 
        initial="initial" 
        animate="animate" 
        variants={fadeInUp}
        className="bg-card backdrop-blur-sm border rounded-2xl p-6 shadow-xl"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Store className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Dealer Network Hub
                </h1>
                <p className="text-muted-foreground text-base lg:text-lg mt-1">
                  Manage and optimize your distribution network
                </p>
              </div>
            </div>
            
            {/* Live Status Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                <Users className="h-3 w-3" />
                {totalCount} Total Dealers
              </Badge>
              <Badge variant="default" className="gap-1.5 px-3 py-1">
                <CheckCircle className="h-3 w-3" />
                {stats.active} Active
              </Badge>
              <Badge variant="outline" className="gap-1.5 px-3 py-1">
                <Clock className="h-3 w-3" />
                {stats.pending} Pending
              </Badge>
              {isLive && (
                <Badge variant="outline" className="gap-1.5 px-3 py-1 animate-pulse">
                  <Activity className="h-3 w-3 text-green-500" />
                  Live • {activeChannels} channels
                </Badge>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import Dealers
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
              <Plus className="h-4 w-4" />
              Add Dealer
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics Dashboard */}
      <motion.div 
        initial="initial"
        animate="animate"
        variants={staggerChildren}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {[
          { label: 'Active Dealers', value: stats.active, icon: Store, color: 'text-green-500', bgColor: 'bg-green-500/10' },
          { label: 'Verified', value: stats.verified, icon: CheckCircle, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
          { label: 'Total Sales', value: `₹${(stats.totalSales / 100000).toFixed(1)}L`, icon: TrendingUp, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
          { label: 'Avg Performance', value: `${stats.avgPerformance.toFixed(1)}%`, icon: BarChart3, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
          { label: 'Coverage', value: '342 Villages', icon: MapPin, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' }
        ].map((metric, index) => (
          <motion.div key={index} variants={fadeInUp}>
            <Card className="hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold mt-1">{metric.value}</p>
                  </div>
                  <div className={cn("p-3 rounded-xl", metric.bgColor)}>
                    <metric.icon className={cn("h-5 w-5", metric.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Search and Filters Bar */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-xl p-4 border shadow-sm"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search dealers by name, code, location..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10 bg-background/50"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Advanced Filters
            </Button>
            <Button variant="outline" className="gap-2">
              <Map className="h-4 w-4" />
              Map View
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Tabs with Icons and Counts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Tabs defaultValue="directory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 bg-muted/30 p-1 rounded-xl">
            <TabsTrigger value="directory" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Directory</span>
              <Badge variant="secondary" className="ml-1">{totalCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="onboarding" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Onboarding</span>
              {stats.pending > 0 && <Badge variant="outline" className="ml-1">{stats.pending}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="territory" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">Territory</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger value="communication" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Communication</span>
            </TabsTrigger>
            <TabsTrigger value="incentives" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Gift className="h-4 w-4" />
              <span className="hidden sm:inline">Incentives</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="directory" className="animate-in fade-in-50 duration-500">
            <DealerDirectory 
              dealers={dealers}
              searchTerm={searchTerm}
              selectedDealers={selectedDealers}
              onSelectedDealersChange={onSelectedDealersChange}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="onboarding" className="animate-in fade-in-50 duration-500">
            <DealerOnboarding 
              dealers={dealers.filter(d => d.onboarding_status !== 'completed')}
            />
          </TabsContent>

          <TabsContent value="territory" className="animate-in fade-in-50 duration-500">
            <TerritoryManagement 
              dealers={dealers}
            />
          </TabsContent>

          <TabsContent value="performance" className="animate-in fade-in-50 duration-500">
            <PerformanceTracking 
              dealers={dealers}
            />
          </TabsContent>

          <TabsContent value="communication" className="animate-in fade-in-50 duration-500">
            <CommunicationHub 
              dealers={dealers}
              selectedDealers={selectedDealers}
            />
          </TabsContent>

          <TabsContent value="incentives" className="animate-in fade-in-50 duration-500">
            <IncentiveManagement 
              dealers={dealers}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};