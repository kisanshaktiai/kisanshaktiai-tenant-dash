import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Plus, Wifi, WifiOff, Grid3X3, List, AlertCircle } from 'lucide-react';
import { useFarmerLandsRealtime } from '@/hooks/data/useFarmerLandsRealtime';
import { ModernLandCard } from '@/components/farmers/cards/ModernLandCard';
import { AddLandModal } from '@/components/farmers/forms/AddLandModal';
import { motion } from 'framer-motion';

interface FarmerLandHoldingsProps {
  farmerId: string;
}

export const FarmerLandHoldings: React.FC<FarmerLandHoldingsProps> = ({ farmerId }) => {
  const [isAddLandOpen, setIsAddLandOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { lands, stats, isLoading, error, isLive, refetch } = useFarmerLandsRealtime(farmerId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="p-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <p className="text-destructive">Failed to load land holdings</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold">Land Holdings</h3>
          {isLive ? (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse">
              <Wifi className="w-3 h-3 mr-1" />
              Live
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-muted">
              <WifiOff className="w-3 h-3 mr-1" />
              Synced
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Stats Badges */}
          <div className="hidden md:flex gap-2">
            <Badge variant="secondary">{stats.totalAreaAcres.toFixed(1)} acres</Badge>
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-400">{stats.irrigatedArea.toFixed(1)} irrigated</Badge>
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400">{stats.uniqueCrops.length} crops</Badge>
          </div>
          
          {/* View Toggle */}
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          
          <Button onClick={() => setIsAddLandOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Land
          </Button>
        </div>
      </div>

      {/* Mobile Stats */}
      <div className="flex md:hidden gap-2 overflow-x-auto pb-2">
        <Badge variant="secondary">{stats.totalAreaAcres.toFixed(1)} acres</Badge>
        <Badge variant="secondary">{stats.irrigatedArea.toFixed(1)} irrigated</Badge>
        <Badge variant="secondary">{stats.uniqueCrops.length} crops</Badge>
        {stats.averageNDVI !== null && (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400">
            Avg NDVI: {stats.averageNDVI.toFixed(2)}
          </Badge>
        )}
      </div>

      {/* Land Cards Grid */}
      {lands && lands.length > 0 ? (
        <motion.div 
          className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {lands.map((land) => (
            <ModernLandCard
              key={land.id}
              land={land}
              isHighlighted={isLive}
              onView={(id) => console.log('View land:', id)}
            />
          ))}
        </motion.div>
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="p-12 text-center">
            <MapPin className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Land Holdings</h3>
            <p className="text-muted-foreground mb-6">Add your first land parcel to start tracking</p>
            <Button onClick={() => setIsAddLandOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Land
            </Button>
          </CardContent>
        </Card>
      )}

      <AddLandModal
        isOpen={isAddLandOpen}
        onClose={() => setIsAddLandOpen(false)}
        farmerId={farmerId}
        onSuccess={() => {
          refetch();
          setIsAddLandOpen(false);
        }}
      />
    </div>
  );
};