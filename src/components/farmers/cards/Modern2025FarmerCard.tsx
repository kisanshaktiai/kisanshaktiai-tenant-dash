import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealtimeComprehensiveFarmer } from '@/hooks/data/useRealtimeComprehensiveFarmer';
import { useAppSelector } from '@/store/hooks';

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
  const [isExpanded, setIsExpanded] = useState(false);
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
      <Card className="h-48 flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm">
        <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
      </Card>
    );
  }

  if (error || !farmer) {
    return (
      <Card className="h-48 flex items-center justify-center bg-gradient-to-br from-destructive/5 to-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive/60" />
      </Card>
    );
  }

  // Calculate metrics
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
    'sunny': <Sun className="h-5 w-5 text-yellow-500" />,
    'cloudy': <Cloud className="h-5 w-5 text-gray-500" />,
    'rainy': <CloudRain className="h-5 w-5 text-blue-500" />,
    'snowy': <CloudSnow className="h-5 w-5 text-blue-300" />
  }[farmer.weatherCondition || 'sunny'] || <Sun className="h-5 w-5 text-yellow-500" />;

  const lastSeenHours = farmer.lastSeenHours || 2;
  const lastSeenStatus = lastSeenHours < 24 ? 'online' : lastSeenHours < 168 ? 'recent' : 'offline';
  const lastSeenColor = {
    'online': 'bg-success',
    'recent': 'bg-warning',
    'offline': 'bg-muted-foreground'
  }[lastSeenStatus];

  const engagementScore = farmer.engagementScore || 65;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
      className="relative"
    >
      <Card 
        className={cn(
          "group relative overflow-hidden transition-all duration-300",
          "bg-gradient-to-br from-background via-background to-muted/5",
          "border-border/50 hover:border-primary/30",
          "shadow-lg hover:shadow-2xl",
          "backdrop-blur-sm",
          isExpanded && "ring-2 ring-primary/20",
          isSelected && "ring-2 ring-primary"
        )}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Real-time indicator */}
        {realtimeStatus?.isConnected && (
          <div className="absolute top-2 right-2 z-10">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 backdrop-blur-sm">
              <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
              <span className="text-[10px] font-medium text-success">LIVE</span>
            </div>
          </div>
        )}

        <div className="p-6 space-y-4">
          {/* Top Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <Avatar className="h-14 w-14 ring-2 ring-background shadow-lg">
                <AvatarImage src={farmer.avatarUrl} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-lg">
                  {farmer.farmerName?.charAt(0) || 'F'}
                </AvatarFallback>
              </Avatar>

              {/* Name and Basic Info */}
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  {farmer.farmerName || 'Unknown Farmer'}
                  {farmer.isVerified && (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  )}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant="outline" className="text-xs font-mono">
                    {farmer.farmerCode || 'N/A'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    {currentTenant?.name || 'Tenant'}
                  </Badge>
                  <Badge className={cn("text-xs border", riskColor)}>
                    {riskLevel.toUpperCase()} RISK
                  </Badge>
                </div>
              </div>
            </div>

            {/* Last Seen Status */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", lastSeenColor)} />
                    <span className="text-xs text-muted-foreground">
                      {lastSeenHours < 24 ? 'Active' : `${Math.floor(lastSeenHours / 24)}d ago`}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Last seen {lastSeenHours} hours ago</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-4">
            {/* Left Section - Contact & Location */}
            <div className="col-span-3 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {farmer.village || 'Location'}, {farmer.district}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">
                    {farmer.mobileNumber || 'No phone'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {farmer.farmingExperience || 0} years exp
                  </span>
                </div>
              </div>
            </div>

            {/* Center Section - Land & Crops */}
            <div className="col-span-5 space-y-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Land Holdings</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-primary">
                        {farmer.totalLandAcres || 0}
                      </span>
                      <span className="text-sm text-muted-foreground">acres</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Plots</p>
                    <span className="text-lg font-semibold text-foreground">
                      {farmer.plotCount || 0}
                    </span>
                  </div>
                </div>
                
                {/* Crops */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {(farmer.primaryCrops || ['Rice', 'Wheat']).slice(0, 3).map((crop: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      <Wheat className="h-3 w-3 mr-1" />
                      {crop}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* NDVI & Soil Health */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">NDVI</span>
                    {ndviTrend === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-success" />
                    ) : ndviTrend === 'down' ? (
                      <TrendingDown className="h-3 w-3 text-destructive" />
                    ) : (
                      <Activity className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-foreground">
                      {(ndviScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-primary to-primary/60"
                      initial={{ width: 0 }}
                      animate={{ width: `${ndviScore * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Soil</span>
                    <Sparkles className={cn("h-3 w-3", soilHealthColor)} />
                  </div>
                  <span className={cn("text-lg font-bold", soilHealthColor)}>
                    {soilHealth}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Section - Weather & Actions */}
            <div className="col-span-4 space-y-3">
              {/* Weather Widget */}
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/5 to-blue-500/10 border border-blue-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {weatherIcon}
                    <div>
                      <p className="text-lg font-bold text-foreground">
                        {farmer.currentTemp || 28}°C
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {farmer.weatherCondition || 'Clear'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Droplets className="h-3 w-3" />
                      {farmer.humidity || 65}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onContact?.(farmerId, 'call')}
                >
                  <Phone className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onContact?.(farmerId, 'whatsapp')}
                >
                  <MessageCircle className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  className="flex-1"
                  onClick={() => onViewDetails?.(farmerId)}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Section - Engagement */}
          <div className="pt-3 border-t border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Engagement Score</span>
                  <span className="text-xs font-medium text-foreground">{engagementScore}%</span>
                </div>
                <Progress 
                  value={engagementScore} 
                  className="h-2 bg-muted/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Expansion Animation */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 pointer-events-none"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-[2px]" />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};