import React, { useState, useCallback, useMemo } from 'react';
import { Search, Filter, Download, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { RealtimeFarmerCard } from '@/components/farmers/cards/RealtimeFarmerCard';
import { useFarmersQuery } from '@/hooks/data/useFarmersQuery';
import { useComprehensiveRealtime } from '@/hooks/data/useComprehensiveRealtime';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import type { Farmer } from '@/types/farmer';

interface RealtimeFarmerDirectoryProps {
  onFarmerSelect?: (farmer: any) => void;
  selectedFarmers?: string[];
  onFarmerSelectionChange?: (farmerIds: string[]) => void;
}

export const RealtimeFarmerDirectory: React.FC<RealtimeFarmerDirectoryProps> = ({
  onFarmerSelect,
  selectedFarmers = [],
  onFarmerSelectionChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Real-time sync status
  const {
    isConnected,
    activeChannels,
    lastSyncTime,
    lastError,
    syncedTables,
    pendingUpdates,
    manualRefresh,
    isLoading: isSyncing
  } = useComprehensiveRealtime();

  // Fetch farmers data
  const { 
    data: farmersData, 
    isLoading: isLoadingFarmers, 
    refetch 
  } = useFarmersQuery({
    search: searchQuery,
    limit: 50
  });

  const farmers = (farmersData?.data || []) as any[];

  // Filter farmers based on search
  const filteredFarmers = useMemo(() => {
    if (!searchQuery) return farmers;
    
    const query = searchQuery.toLowerCase();
    return farmers.filter((farmer: any) => {
      const metadata = farmer.metadata || {};
      const personalInfo = metadata.personal_info || {};
      const fullName = personalInfo.full_name || '';
      
      return (
        farmer.farmer_code?.toLowerCase().includes(query) ||
        fullName.toLowerCase().includes(query) ||
        farmer.mobile_number?.includes(query)
      );
    });
  }, [farmers, searchQuery]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      manualRefresh(),
      refetch()
    ]);
  }, [manualRefresh, refetch]);

  const handleExport = useCallback(() => {
    // Export logic here
    console.log('Exporting farmers data...');
  }, []);

  return (
    <div className="space-y-4">
      {/* Real-time Status Bar */}
      <Card className="border-none shadow-sm">
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex items-center gap-2",
                isConnected ? "text-success" : "text-muted-foreground"
              )}>
                {isConnected ? (
                  <Wifi className="h-4 w-4" />
                ) : (
                  <WifiOff className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {isConnected ? 'Real-time Sync Active' : 'Offline Mode'}
                </span>
              </div>
              
              {isConnected && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{activeChannels} channels</span>
                  <span>{syncedTables.size} tables synced</span>
                  {pendingUpdates > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {pendingUpdates} pending
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              disabled={isSyncing}
            >
              <RefreshCw className={cn(
                "h-4 w-4 mr-2",
                isSyncing && "animate-spin"
              )} />
              {isSyncing ? 'Syncing...' : 'Refresh'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {lastError && (
        <Alert variant="destructive">
          <AlertDescription>
            {lastError}. Data may not be up to date. 
            <Button
              size="sm"
              variant="link"
              className="ml-2 p-0 h-auto"
              onClick={handleRefresh}
            >
              Try manual refresh
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Filter Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search farmers by name, code, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        <Button
          variant="outline"
          onClick={handleExport}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Farmer Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{farmers.length}</div>
            <p className="text-xs text-muted-foreground">Total Farmers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {farmers.filter((f: any) => f.is_verified === true).length}
            </div>
            <p className="text-xs text-muted-foreground">Verified</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {farmers.filter(f => {
                const createdAt = new Date(f.created_at);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return createdAt > weekAgo;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">New This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {farmers.reduce((acc, f) => {
                const area = f.metadata?.farming_info?.total_land_area || 0;
                return acc + parseFloat(area);
              }, 0).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Total Acres</p>
          </CardContent>
        </Card>
      </div>

      {/* Farmers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoadingFarmers ? (
          // Loading skeletons
          Array.from({ length: 8 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredFarmers.length > 0 ? (
          filteredFarmers.map((farmer) => (
            <RealtimeFarmerCard
              key={farmer.id}
              farmer={farmer}
              onClick={() => onFarmerSelect?.(farmer)}
              isSelected={selectedFarmers.includes(farmer.id)}
              lastSyncTime={lastSyncTime}
              isConnected={isConnected}
              isPending={pendingUpdates > 0}
              onRefresh={handleRefresh}
            />
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? 'No farmers found matching your search' : 'No farmers registered yet'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};