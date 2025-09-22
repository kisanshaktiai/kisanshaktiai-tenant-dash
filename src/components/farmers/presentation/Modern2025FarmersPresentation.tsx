import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  LayoutGrid, 
  RefreshCw,
  TrendingUp,
  Activity,
  AlertTriangle,
  Phone,
  MessageCircle,
  UserPlus,
  ChevronDown,
  MapPin,
  Clock,
  Droplets,
  Leaf,
  Cloud,
  CircleDot,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComprehensiveFarmerData } from '@/services/EnhancedFarmerDataService';
import { useModern2025FarmerData } from '@/hooks/data/useModern2025FarmerData';
import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { format } from 'date-fns';
import { Modern2025FarmerCard } from '@/components/farmers/cards/Modern2025FarmerCard';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  gradient: string;
  trend?: number;
  pulse?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, icon, gradient, trend, pulse }) => (
  <div className={cn(
    "relative overflow-hidden rounded-2xl p-6 transition-all duration-300",
    "hover:shadow-xl hover:scale-[1.02] cursor-pointer",
    "bg-gradient-to-br", gradient,
    pulse && "animate-pulse-subtle"
  )}>
    <div className="flex justify-between items-start">
      <div className="space-y-1">
        <p className="text-sm font-medium opacity-90">{title}</p>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        {subtitle && (
          <p className="text-xs opacity-75 mt-1">{subtitle}</p>
        )}
      </div>
      <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
        {icon}
      </div>
    </div>
    {trend !== undefined && (
      <div className="absolute bottom-2 right-2">
        <Badge 
          variant={trend > 0 ? "default" : "secondary"} 
          className="text-xs bg-white/20 backdrop-blur-sm border-0"
        >
          {trend > 0 ? '+' : ''}{trend}%
        </Badge>
      </div>
    )}
  </div>
);

// Using the imported Modern2025FarmerCard from the cards folder

interface Modern2025FarmersPresentationProps {
  farmers: ComprehensiveFarmerData[];
  isLoading: boolean;
  metrics?: {
    totalFarmers: number;
    activeFarmers: number;
    averageEngagement: number;
    riskDistribution: {
      low: number;
      medium: number;
      high: number;
    };
  };
  onCreateFarmer: () => void;
  onRefresh: () => void;
  onViewFarmer: (farmer: ComprehensiveFarmerData) => void;
  onContactFarmer: (farmer: ComprehensiveFarmerData, method: 'call' | 'message' | 'assign') => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  viewType: 'grid' | 'list' | 'compact';
  onViewTypeChange: (type: 'grid' | 'list' | 'compact') => void;
}

export const Modern2025FarmersPresentation: React.FC<Modern2025FarmersPresentationProps> = ({
  farmers,
  isLoading,
  metrics,
  onCreateFarmer,
  onRefresh,
  onViewFarmer,
  onContactFarmer,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  viewType,
  onViewTypeChange
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFarmers, setSelectedFarmers] = useState<string[]>([]);

  const getGridCols = () => {
    if (viewType === 'list') return '';
    switch (viewType) {
      case 'compact': return 'grid-cols-1';
      case 'grid': 
      default: return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Farmer Network
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time insights and management for your farmer network
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={onRefresh} 
              disabled={isLoading}
              className="border-2"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              Refresh
            </Button>
            <Button onClick={onCreateFarmer} className="shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Farmer
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Farmers"
            value={metrics?.totalFarmers.toLocaleString() || '0'}
            subtitle={`${farmers.length} displayed`}
            icon={<Users className="w-5 h-5 text-white" />}
            gradient="from-blue-500 to-blue-600 text-white"
            trend={5}
          />
          <MetricCard
            title="Active Farmers"
            value={metrics?.activeFarmers.toLocaleString() || '0'}
            subtitle={`${Math.round((metrics?.activeFarmers || 0) / (metrics?.totalFarmers || 1) * 100)}% engagement`}
            icon={<Activity className="w-5 h-5 text-white" />}
            gradient="from-emerald-500 to-emerald-600 text-white"
            trend={12}
            pulse={true}
          />
          <MetricCard
            title="Avg Engagement"
            value={`${Math.round(metrics?.averageEngagement || 0)}%`}
            subtitle="Platform interaction"
            icon={<TrendingUp className="w-5 h-5 text-white" />}
            gradient="from-purple-500 to-purple-600 text-white"
            trend={8}
          />
          <MetricCard
            title="High Risk"
            value={metrics?.riskDistribution.high || '0'}
            subtitle="Needs attention"
            icon={<AlertTriangle className="w-5 h-5 text-white" />}
            gradient="from-orange-500 to-orange-600 text-white"
            trend={-3}
          />
        </div>

        {/* Search & Filters Bar - Sticky */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border rounded-xl shadow-sm p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search farmers..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 border-2 focus:border-primary"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "border-2",
                  showFilters && "bg-primary text-primary-foreground"
                )}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                <ChevronDown className={cn(
                  "h-4 w-4 ml-2 transition-transform",
                  showFilters && "rotate-180"
                )} />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="w-40 border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date Added</SelectItem>
                  <SelectItem value="farmer_code">Farmer Code</SelectItem>
                  <SelectItem value="total_land_acres">Land Size</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border-2 rounded-lg bg-muted/50">
                {(['grid', 'list', 'compact'] as const).map(type => (
                  <Button
                    key={type}
                    variant={viewType === type ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onViewTypeChange(type)}
                    className="border-0 rounded-none first:rounded-l-lg last:rounded-r-lg"
                  >
                    {type === 'grid' && <Grid3X3 className="w-4 h-4" />}
                    {type === 'list' && <List className="w-4 h-4" />}
                    {type === 'compact' && <LayoutGrid className="w-4 h-4" />}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Farmers Grid/Table */}
        {viewType === 'list' ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground">Name</th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground">Code</th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground">Risk</th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground">Crop</th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground">Land</th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground">NDVI</th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground">Engagement</th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12">
                          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                          <p className="text-muted-foreground">Loading farmers...</p>
                        </td>
                      </tr>
                    ) : farmers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12">
                          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No farmers found</h3>
                          <p className="text-muted-foreground">Add your first farmer to get started</p>
                        </td>
                      </tr>
                    ) : (
                      farmers.map(farmer => (
                        <tr key={farmer.id} className="hover:bg-muted/50 transition-colors">
                          <td colSpan={8}>
                            <Modern2025FarmerCard
                              farmer={farmer}
                              isSelected={selectedFarmers.includes(farmer.id)}
                              onSelect={() => {
                                if (selectedFarmers.includes(farmer.id)) {
                                  setSelectedFarmers(prev => prev.filter(id => id !== farmer.id));
                                } else {
                                  setSelectedFarmers(prev => [...prev, farmer.id]);
                                }
                              }}
                              onCall={() => onContactFarmer(farmer, 'call')}
                              onMessage={() => onContactFarmer(farmer, 'message')}
                              onAssign={() => onContactFarmer(farmer, 'assign')}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className={cn("grid gap-4", getGridCols())}>
            {isLoading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading farmers...</p>
                </div>
              </div>
            ) : farmers.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No farmers found</h3>
                <p className="text-muted-foreground">Add your first farmer to get started</p>
              </div>
            ) : (
              farmers.map(farmer => (
                <Modern2025FarmerCard
                  key={farmer.id}
                  farmer={farmer}
                  isSelected={selectedFarmers.includes(farmer.id)}
                  onSelect={() => {
                    if (selectedFarmers.includes(farmer.id)) {
                      setSelectedFarmers(prev => prev.filter(id => id !== farmer.id));
                    } else {
                      setSelectedFarmers(prev => [...prev, farmer.id]);
                    }
                  }}
                  onCall={() => onContactFarmer(farmer, 'call')}
                  onMessage={() => onContactFarmer(farmer, 'message')}
                  onAssign={() => onContactFarmer(farmer, 'assign')}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};