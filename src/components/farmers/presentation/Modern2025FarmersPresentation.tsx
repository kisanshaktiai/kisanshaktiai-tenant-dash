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

interface Modern2025FarmerCardProps {
  farmer: ComprehensiveFarmerData;
  onSelect?: (selected: boolean) => void;
  selected?: boolean;
  onViewDetails?: () => void;
  onContact?: (method: 'call' | 'message' | 'assign') => void;
}

const Modern2025FarmerCard: React.FC<Modern2025FarmerCardProps> = ({ 
  farmer, 
  onSelect, 
  selected, 
  onViewDetails,
  onContact 
}) => {
  const { data, isLoading } = useModern2025FarmerData(farmer.id);
  const [isLive, setIsLive] = useState(false);

  React.useEffect(() => {
    // Simulate realtime updates
    const interval = setInterval(() => {
      setIsLive(Math.random() > 0.7);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300",
        "hover:shadow-lg border-2",
        selected && "border-primary ring-2 ring-primary/20",
        isLive && "shadow-emerald-500/10"
      )}
      onClick={onViewDetails}
    >
      <CardContent className="p-0">
        <div className="flex items-stretch h-36">
          {/* Left Section - Avatar & Info */}
          <div className="w-1/4 p-4 bg-gradient-to-br from-muted/50 to-muted/30 flex flex-col items-center justify-center border-r">
            <div className="relative">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                {farmer.farmer_code?.slice(0, 2) || 'FA'}
              </div>
              {isLive && (
                <div className="absolute -top-1 -right-1">
                  <LiveIndicator isConnected={true} />
                </div>
              )}
            </div>
            <h3 className="font-semibold text-sm mt-2 text-center line-clamp-1">
              {farmer.farmer_code}
            </h3>
            <Badge 
              variant="outline" 
              className={cn("text-xs mt-1", getRiskColor(data?.riskLevel || 'low'))}
            >
              {data?.riskLevel || 'Low'} Risk
            </Badge>
          </div>

          {/* Middle Section - Land & Metrics */}
          <div className="flex-1 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {farmer.primary_crops?.[0] || 'Multiple crops'}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {farmer.total_land_acres?.toFixed(0) || 0} acres
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Land</span>
                </div>
                <p className="text-sm font-semibold">
                  {farmer.total_land_acres?.toFixed(1) || 0} acres
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Leaf className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-muted-foreground">NDVI</span>
                </div>
                <p className="text-sm font-semibold">
                  {data?.ndviScore?.toFixed(1) || 'N/A'}%
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <CircleDot className="w-3 h-3 text-amber-500" />
                  <span className="text-xs text-muted-foreground">Soil</span>
                </div>
                <p className="text-sm font-semibold">
                  {data?.soilHealthRating || 'Good'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-sky-500" />
                <span className="text-xs">
                  {data?.weatherCondition || 'Clear'} • {data?.currentTemp || 28}°C
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {data?.lastSeenHours ? `${data.lastSeenHours}h ago` : 'Never'}
              </div>
            </div>

            {/* Engagement Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Engagement</span>
                <span className="font-medium">{data?.engagementScore || 0}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
                  style={{ width: `${data?.engagementScore || 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="w-32 p-4 flex flex-col justify-center gap-2 bg-gradient-to-br from-background to-muted/20 border-l">
            <Button 
              size="sm" 
              variant="ghost" 
              className="justify-start"
              onClick={(e) => {
                e.stopPropagation();
                onContact?.('call');
              }}
            >
              <Phone className="w-3 h-3 mr-2" />
              Call
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="justify-start"
              onClick={(e) => {
                e.stopPropagation();
                onContact?.('message');
              }}
            >
              <MessageCircle className="w-3 h-3 mr-2" />
              Message
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="justify-start"
              onClick={(e) => {
                e.stopPropagation();
                onContact?.('assign');
              }}
            >
              <UserPlus className="w-3 h-3 mr-2" />
              Assign
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

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
    switch (viewType) {
      case 'compact': return 'grid-cols-1';
      case 'list': return 'grid-cols-1';
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

        {/* Farmers Grid */}
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
                selected={selectedFarmers.includes(farmer.id)}
                onSelect={(selected) => {
                  if (selected) {
                    setSelectedFarmers(prev => [...prev, farmer.id]);
                  } else {
                    setSelectedFarmers(prev => prev.filter(id => id !== farmer.id));
                  }
                }}
                onViewDetails={() => onViewFarmer(farmer)}
                onContact={(method) => onContactFarmer(farmer, method)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};