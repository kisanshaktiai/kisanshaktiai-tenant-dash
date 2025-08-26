
import React, { lazy, Suspense } from 'react';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Users, Plus, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Lazy load farmer components
const FarmersPageContainer = lazy(() => 
  import('@/components/farmers/containers/FarmersPageContainer').then(module => ({
    default: module.FarmersPageContainer
  }))
);

const LazyFarmersPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              Farmers
            </span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your farmer network and track their activities
          </p>
        </div>
        
        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-primary to-primary/90">
            <Plus className="h-4 w-4" />
            Add Farmer
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-card to-card/80 border border-border/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Farmers</p>
              <p className="text-2xl font-bold">1,234</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300">
              +12%
            </Badge>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-card to-card/80 border border-border/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active This Month</p>
              <p className="text-2xl font-bold">987</p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
              80%
            </Badge>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-card to-card/80 border border-border/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">New This Week</p>
              <p className="text-2xl font-bold">47</p>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
              +5
            </Badge>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-card to-card/80 border border-border/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Land Size</p>
              <p className="text-2xl font-bold">2.3 <span className="text-sm font-normal">acres</span></p>
            </div>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">
              Stable
            </Badge>
          </div>
        </div>
      </div>
      
      <Suspense fallback={<LoadingScreen />}>
        <FarmersPageContainer />
      </Suspense>
    </div>
  );
};

export default LazyFarmersPage;
