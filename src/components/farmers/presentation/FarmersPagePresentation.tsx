
import React from 'react';
import { Plus, Search, Filter, Download, Users, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { FarmerDirectory } from '@/pages/farmers/components/FarmerDirectory';
import { CreateFarmerModal } from '@/pages/farmers/components/CreateFarmerModal';
import { FarmerImportModal } from '@/pages/farmers/components/FarmerImportModal';
import { BulkOperations } from '@/pages/farmers/components/BulkOperations';
import { EngagementTracking } from '@/pages/farmers/components/EngagementTracking';
import { LeadManagement } from '@/pages/farmers/components/LeadManagement';
import { FarmerStats } from '@/pages/farmers/components/FarmerStats';
import type { Farmer } from '@/services/FarmersService';
import { cn } from '@/lib/utils';

interface FarmersPagePresentationProps {
  farmers: Farmer[];
  totalCount: number;
  isLoading: boolean;
  error: any;
  searchTerm: string;
  selectedFarmers: string[];
  isCreateModalOpen: boolean;
  isImportModalOpen: boolean;
  onSearch: (value: string) => void;
  onCreateModalOpen: () => void;
  onCreateModalClose: () => void;
  onCreateSuccess: () => void;
  onImportModalChange: (open: boolean) => void;
  onSelectedFarmersChange: (farmers: string[]) => void;
  // Real-time props
  isLive?: boolean;
  activeChannels?: number;
}

export const FarmersPagePresentation: React.FC<FarmersPagePresentationProps> = ({
  farmers,
  totalCount,
  isLoading,
  error,
  searchTerm,
  selectedFarmers,
  isCreateModalOpen,
  isImportModalOpen,
  onSearch,
  onCreateModalOpen,
  onCreateModalClose,
  onCreateSuccess,
  onImportModalChange,
  onSelectedFarmersChange,
  isLive = false,
  activeChannels = 0
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/10">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-success/5 rounded-2xl -z-10" />
          <Card className="border-0 shadow-soft bg-gradient-to-r from-card via-card to-muted/10">
            <CardHeader className="pb-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                    <Users className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        Farmer Network Management
                      </h1>
                      <LiveIndicator isConnected={isLive} activeChannels={activeChannels} />
                    </div>
                    <p className="text-muted-foreground text-lg">
                      Comprehensive management of your farmer network and engagement analytics
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary" className="gap-1.5">
                        <TrendingUp className="h-3 w-3" />
                        {totalCount.toLocaleString()} Total Farmers
                      </Badge>
                      <Badge variant="outline" className="gap-1.5">
                        <Sparkles className="h-3 w-3" />
                        Real-time Data
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => onImportModalChange(true)}
                    className="gap-2 shadow-soft border-0 bg-muted/50 hover:bg-muted/80"
                  >
                    <Download className="h-4 w-4" />
                    Import Farmers
                  </Button>
                  <Button 
                    onClick={onCreateModalOpen}
                    className="gap-2 shadow-soft bg-gradient-primary hover:opacity-90"
                  >
                    <Plus className="h-4 w-4" />
                    Add Farmer
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Enhanced Stats Section */}
        <FarmerStats />

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
                  placeholder="Search farmers by name, phone, location, or crops..."
                  value={searchTerm}
                  onChange={(e) => onSearch(e.target.value)}
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
                    value="bulk" 
                    className="data-[state=active]:bg-background data-[state=active]:shadow-soft h-10 px-6 rounded-lg"
                  >
                    Bulk Operations
                  </TabsTrigger>
                  <TabsTrigger 
                    value="engagement" 
                    className="data-[state=active]:bg-background data-[state=active]:shadow-soft h-10 px-6 rounded-lg"
                  >
                    Engagement
                  </TabsTrigger>
                  <TabsTrigger 
                    value="leads" 
                    className="data-[state=active]:bg-background data-[state=active]:shadow-soft h-10 px-6 rounded-lg"
                  >
                    Lead Management
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="directory" className="mt-0 space-y-6">
                  <FarmerDirectory />
                </TabsContent>

                <TabsContent value="bulk" className="mt-0 space-y-6">
                  <BulkOperations selectedFarmers={selectedFarmers} />
                </TabsContent>

                <TabsContent value="engagement" className="mt-0 space-y-6">
                  <EngagementTracking />
                </TabsContent>

                <TabsContent value="leads" className="mt-0 space-y-6">
                  <LeadManagement />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Modals */}
        <CreateFarmerModal 
          isOpen={isCreateModalOpen}
          onClose={onCreateModalClose}
          onSuccess={onCreateSuccess}
        />
        
        <FarmerImportModal
          open={isImportModalOpen}
          onOpenChange={onImportModalChange}
        />
      </div>
    </div>
  );
};
