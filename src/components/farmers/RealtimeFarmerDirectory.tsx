import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Wifi, WifiOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRealtimeFarmers } from '@/hooks/data/useRealtimeFarmers';
import { RealtimeFarmerCard } from './cards/RealtimeFarmerCard';
import { format } from 'date-fns';
import type { Farmer } from '@/services/EnhancedFarmerDataService';

interface RealtimeFarmerDirectoryProps {
  onSelectFarmer: (farmer: Farmer) => void;
  selectedFarmers?: string[];
  onSelectedFarmersChange?: (farmers: string[]) => void;
  searchTerm?: string;
}

export const RealtimeFarmerDirectory: React.FC<RealtimeFarmerDirectoryProps> = ({
  onSelectFarmer,
  selectedFarmers = [],
  onSelectedFarmersChange,
  searchTerm = '',
}) => {
  const { 
    farmers, 
    count, 
    isLoading, 
    error, 
    realtimeStatus, 
    refetch 
  } = useRealtimeFarmers({
    search: searchTerm,
    limit: 50,
  });

  const handleSelectFarmer = useCallback((farmerId: string, selected: boolean) => {
    if (onSelectedFarmersChange) {
      if (selected) {
        onSelectedFarmersChange([...selectedFarmers, farmerId]);
      } else {
        onSelectedFarmersChange(selectedFarmers.filter(id => id !== farmerId));
      }
    }
  }, [selectedFarmers, onSelectedFarmersChange]);

  const handleSelectAll = useCallback(() => {
    if (onSelectedFarmersChange) {
      if (selectedFarmers.length === farmers.length) {
        onSelectedFarmersChange([]);
      } else {
        onSelectedFarmersChange(farmers.map(f => f.id));
      }
    }
  }, [farmers, selectedFarmers, onSelectedFarmersChange]);

  // Filter farmers based on search term
  const filteredFarmers = useMemo(() => {
    if (!searchTerm) return farmers;
    
    const term = searchTerm.toLowerCase();
    return farmers.filter(farmer => 
      farmer.farmer_code?.toLowerCase().includes(term) ||
      farmer.primary_crops?.some(crop => crop.toLowerCase().includes(term))
    );
  }, [farmers, searchTerm]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 animate-spin text-primary" />
            <span>Loading farmers...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load farmers: {error instanceof Error ? error.message : 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Real-time Status Bar */}
      <Card>
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-sm font-medium">Real-time Sync Status</CardTitle>
              {realtimeStatus.isConnected ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  Connected ({realtimeStatus.channelCount} channels)
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <WifiOff className="h-3 w-3" />
                  Disconnected
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {realtimeStatus.lastSyncTime && (
                <span className="text-xs text-muted-foreground">
                  Last sync: {format(realtimeStatus.lastSyncTime, 'HH:mm:ss')}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Manual Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        {realtimeStatus.syncError && (
          <CardContent className="pt-0">
            <Alert variant="destructive" className="mb-0">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Sync error: {realtimeStatus.syncError}. Using fallback polling mode.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Selection Controls */}
      <Card>
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedFarmers.length === filteredFarmers.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Badge variant="secondary">
                {selectedFarmers.length} of {count} selected
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-sm text-muted-foreground">
                {filteredFarmers.length} farmers loaded
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Farmers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFarmers.map((farmer) => (
          <RealtimeFarmerCard
            key={farmer.id}
            farmer={farmer}
            isSelected={selectedFarmers.includes(farmer.id)}
            onSelect={handleSelectFarmer}
            onSelectFarmer={onSelectFarmer}
            showSyncStatus={true}
          />
        ))}
      </div>

      {filteredFarmers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-lg font-medium">No farmers found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchTerm ? 'Try adjusting your search criteria' : 'Add your first farmer to get started'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};