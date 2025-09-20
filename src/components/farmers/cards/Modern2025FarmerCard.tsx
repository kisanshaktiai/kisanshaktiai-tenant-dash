import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Phone, 
  MessageCircle, 
  Eye, 
  MapPin, 
  Calendar, 
  Droplets,
  Wheat,
  TrendingUp,
  TrendingDown,
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  User,
  Sparkles,
  ChevronRight,
  BarChart3,
  Leaf,
  DollarSign,
  Clock,
  Map,
  Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useRealtimeComprehensiveFarmer } from '@/hooks/data/useRealtimeComprehensiveFarmer';
import { useAppSelector } from '@/store/hooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface Modern2025FarmerCardProps {
  farmerId: string;
  farmerData?: any;
  onViewDetails?: (farmerId: string) => void;
  onContact?: (farmerId: string, method: 'call' | 'whatsapp') => void;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
}

export const Modern2025FarmerCard: React.FC<Modern2025FarmerCardProps> = ({
  farmerId,
  farmerData: initialData,
  onViewDetails,
  onContact,
  isSelected = false,
  onSelect
}) => {
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const { currentTenant } = useAppSelector((state) => state.tenant);
  
  const { 
    farmer: farmerData, 
    isLoading, 
    error,
    realtimeStatus 
  } = useRealtimeComprehensiveFarmer(farmerId, currentTenant?.id);

  const farmer = farmerData || initialData;

  if (isLoading) {
    return (
      <Card className="h-24 flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/10">
        <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
      </Card>
    );
  }

  if (error || !farmer) {
    return (
      <Card className="h-24 flex items-center justify-center bg-gradient-to-br from-destructive/5 to-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive/60" />
      </Card>
    );
  }

  // Calculate metrics from real data
  const riskLevel = farmer.riskLevel || 'low';
  const riskColor = {
    low: 'bg-success/10 text-success border-success/20',
    medium: 'bg-warning/10 text-warning border-warning/20',
    high: 'bg-destructive/10 text-destructive border-destructive/20'
  }[riskLevel];

  const ndviScore = farmer.ndviScore || 0.75;
  const ndviTrend = farmer.ndviTrend || 'stable';
  const soilHealth = farmer.soilHealthRating || 'Good';
  const soilHealthColor = {
    'Excellent': 'text-success',
    'Good': 'text-primary',
    'Moderate': 'text-warning',
    'Poor': 'text-destructive'
  }[soilHealth] || 'text-muted-foreground';

  const weatherIcon = {
    'sunny': <Sun className="h-4 w-4 text-yellow-500" />,
    'cloudy': <Cloud className="h-4 w-4 text-gray-500" />,
    'rainy': <CloudRain className="h-4 w-4 text-blue-500" />,
    'snowy': <CloudSnow className="h-4 w-4 text-blue-300" />
  }[farmer.weatherCondition || 'sunny'] || <Sun className="h-4 w-4 text-yellow-500" />;

  const lastSeenHours = farmer.lastSeenHours || 2;
  const lastSeenStatus = lastSeenHours < 24 ? 'online' : lastSeenHours < 168 ? 'recent' : 'offline';
  const lastSeenColor = {
    'online': 'bg-success',
    'recent': 'bg-warning',
    'offline': 'bg-muted-foreground'
  }[lastSeenStatus];

  const engagementScore = farmer.engagementScore || 65;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        whileHover={{ scale: 1.01 }}
        className="relative"
      >
        <Card 
          className={cn(
            "group relative overflow-hidden transition-all duration-200 cursor-pointer",
            "bg-gradient-to-br from-background via-background to-muted/5",
            "border-border/50 hover:border-primary/30",
            "shadow-sm hover:shadow-md",
            isSelected && "ring-2 ring-primary"
          )}
          onClick={() => setShowDetailsDialog(true)}
        >
          {/* Real-time indicator */}
          {realtimeStatus?.isConnected && (
            <div className="absolute top-2 right-2 z-10">
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-success/10">
                <div className="h-1.5 w-1.5 bg-success rounded-full animate-pulse" />
                <span className="text-[9px] font-medium text-success">LIVE</span>
              </div>
            </div>
          )}

          <div className="p-3 space-y-2">
            {/* Compact Top Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <Avatar className="h-10 w-10 ring-1 ring-background">
                  <AvatarImage src={farmer.avatarUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-sm font-bold">
                    {farmer.farmerName?.charAt(0) || 'F'}
                  </AvatarFallback>
                </Avatar>

                {/* Name and Basic Info */}
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-1">
                    {farmer.farmerName || 'Unknown Farmer'}
                    {farmer.isVerified && (
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                    )}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] h-4 px-1">
                      {farmer.farmerCode || 'N/A'}
                    </Badge>
                    <Badge className={cn("text-[10px] h-4 px-1 border", riskColor)}>
                      {riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Last Seen Status */}
              <div className="flex items-center gap-1">
                <div className={cn("h-1.5 w-1.5 rounded-full", lastSeenColor)} />
                <span className="text-[10px] text-muted-foreground">
                  {lastSeenHours < 24 ? 'Active' : `${Math.floor(lastSeenHours / 24)}d`}
                </span>
              </div>
            </div>

            {/* Compact Content Grid */}
            <div className="grid grid-cols-12 gap-2">
              {/* Location & Contact */}
              <div className="col-span-3 space-y-1">
                <div className="flex items-center gap-1 text-xs">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-foreground truncate">
                    {farmer.village || 'Location'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span className="text-foreground font-medium truncate">
                    {farmer.mobileNumber?.slice(-4) || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Land & Crops */}
              <div className="col-span-5 px-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-primary">
                      {farmer.totalLandAcres || 0}
                    </span>
                    <span className="text-[10px] text-muted-foreground">acres</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {farmer.plotCount || 0} plots
                  </span>
                </div>
                <div className="flex gap-1">
                  {(farmer.primaryCrops || ['Rice']).slice(0, 2).map((crop: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-[10px] h-4 px-1">
                      <Wheat className="h-2.5 w-2.5 mr-0.5" />
                      {crop}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div className="col-span-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">NDVI</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-foreground">
                      {(ndviScore * 100).toFixed(0)}%
                    </span>
                    {ndviTrend === 'up' ? (
                      <TrendingUp className="h-2.5 w-2.5 text-success" />
                    ) : ndviTrend === 'down' ? (
                      <TrendingDown className="h-2.5 w-2.5 text-destructive" />
                    ) : (
                      <Activity className="h-2.5 w-2.5 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Soil</span>
                  <span className={cn("text-xs font-medium", soilHealthColor)}>
                    {soilHealth}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-1 border-t border-border/50">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground">Engagement</span>
                <Progress value={engagementScore} className="h-1 w-16" />
                <span className="text-[10px] font-medium">{engagementScore}%</span>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onContact?.(farmerId, 'call');
                  }}
                >
                  <Phone className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onContact?.(farmerId, 'whatsapp');
                  }}
                >
                  <MessageCircle className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Detailed Analytics Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={farmer.avatarUrl} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                  {farmer.farmerName?.charAt(0) || 'F'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{farmer.farmerName || 'Unknown Farmer'}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">
                    <Hash className="h-3 w-3 mr-1" />
                    {farmer.farmerCode || 'N/A'}
                  </Badge>
                  <Badge className={cn("border", riskColor)}>
                    Risk: {riskLevel.toUpperCase()}
                  </Badge>
                  {realtimeStatus?.isConnected && (
                    <Badge className="bg-success/10 text-success border-success/20">
                      <div className="h-2 w-2 bg-success rounded-full animate-pulse mr-1" />
                      LIVE DATA
                    </Badge>
                  )}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="land">Land & Crops</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="communication">Communication</TabsTrigger>
              <TabsTrigger value="weather">Weather</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <h3 className="text-sm font-medium mb-3">Personal Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Phone</span>
                      <span className="text-sm font-medium">{farmer.mobileNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Location</span>
                      <span className="text-sm font-medium">
                        {farmer.village}, {farmer.district}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Experience</span>
                      <span className="text-sm font-medium">{farmer.farmingExperience || 0} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tenant</span>
                      <Badge variant="outline">
                        <Shield className="h-3 w-3 mr-1" />
                        {currentTenant?.name || 'Tenant'}
                      </Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="text-sm font-medium mb-3">Engagement Metrics</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Overall Score</span>
                        <span className="text-sm font-medium">{engagementScore}%</span>
                      </div>
                      <Progress value={engagementScore} className="h-2" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Active</span>
                      <span className="text-sm font-medium">
                        {lastSeenHours < 24 ? 'Today' : `${Math.floor(lastSeenHours / 24)} days ago`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">App Usage</span>
                      <span className="text-sm font-medium">{farmer.appUsageScore || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Response Rate</span>
                      <span className="text-sm font-medium">{farmer.responseRate || 0}%</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="land" className="space-y-4">
              <Card className="p-4">
                <h3 className="text-sm font-medium mb-3">Land Holdings</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{farmer.totalLandAcres || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Acres</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{farmer.plotCount || 0}</p>
                    <p className="text-sm text-muted-foreground">Plots</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{farmer.irrigatedLandAcres || 0}</p>
                    <p className="text-sm text-muted-foreground">Irrigated</p>
                  </div>
                </div>
                <Separator className="my-3" />
                <div>
                  <p className="text-sm font-medium mb-2">Primary Crops</p>
                  <div className="flex flex-wrap gap-2">
                    {(farmer.primaryCrops || ['Rice', 'Wheat']).map((crop: string, idx: number) => (
                      <Badge key={idx} variant="secondary">
                        <Wheat className="h-3 w-3 mr-1" />
                        {crop}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <h3 className="text-sm font-medium mb-3">NDVI Analysis</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current Score</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{(ndviScore * 100).toFixed(0)}%</span>
                        {ndviTrend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-success" />
                        ) : ndviTrend === 'down' ? (
                          <TrendingDown className="h-4 w-4 text-destructive" />
                        ) : (
                          <Activity className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <Progress value={ndviScore * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Vegetation health index based on satellite imagery
                    </p>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="text-sm font-medium mb-3">Soil Health</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Rating</span>
                      <div className="flex items-center gap-2">
                        <Sparkles className={cn("h-4 w-4", soilHealthColor)} />
                        <span className={cn("text-lg font-bold", soilHealthColor)}>
                          {soilHealth}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <p className="font-medium">{farmer.soilPh || 6.5}</p>
                        <p className="text-muted-foreground">pH</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{farmer.nitrogen || 'Med'}</p>
                        <p className="text-muted-foreground">N</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{farmer.phosphorus || 'High'}</p>
                        <p className="text-muted-foreground">P</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="communication" className="space-y-4">
              <Card className="p-4">
                <h3 className="text-sm font-medium mb-3">Communication History</h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Recent interactions will appear here</p>
                  {/* Add communication history here */}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="weather" className="space-y-4">
              <Card className="p-4">
                <h3 className="text-sm font-medium mb-3">Current Weather</h3>
                <div className="flex items-center gap-4">
                  {weatherIcon}
                  <div>
                    <p className="text-2xl font-bold">{farmer.currentTemp || 28}°C</p>
                    <p className="text-sm text-muted-foreground">{farmer.weatherCondition || 'Clear'}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="flex items-center gap-1 text-sm">
                      <Droplets className="h-3 w-3" />
                      <span>{farmer.humidity || 65}%</span>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};