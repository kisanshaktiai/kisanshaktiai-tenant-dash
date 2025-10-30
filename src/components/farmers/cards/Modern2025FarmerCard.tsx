import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { 
  Phone, MessageSquare, UserPlus, MapPin, Droplets, Leaf, 
  TrendingUp, TrendingDown, Minus, Calendar, Activity,
  Wheat, Cloud, ThermometerSun, Zap, Target, DollarSign,
  Timer, Tractor, Package, AlertTriangle, Building2, Users,
  Sprout, BarChart3, Banknote, Shield, Clock, TreePine,
  Wifi, WifiOff
} from 'lucide-react';
import { ComprehensiveFarmerData } from '@/services/EnhancedFarmerDataService';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
import { VegetationSnapshotCard } from '../VegetationSnapshotCard';
import { VegetationTrendsModal } from '../VegetationTrendsModal';
import { useNDVIData } from '@/hooks/data/useNDVIData';
import { FarmerDetailModal } from '../modals/FarmerDetailModal';

interface Modern2025FarmerCardProps {
  farmer: ComprehensiveFarmerData;
  onSelect?: (farmer: ComprehensiveFarmerData) => void;
  onCall?: (farmer: ComprehensiveFarmerData) => void;
  onMessage?: (farmer: ComprehensiveFarmerData) => void;
  onAssign?: (farmer: ComprehensiveFarmerData) => void;
  isSelected?: boolean;
}

export const Modern2025FarmerCard: React.FC<Modern2025FarmerCardProps> = ({
  farmer,
  onSelect,
  onCall,
  onMessage,
  onAssign,
  isSelected = false
}) => {
  const [farmerName, setFarmerName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showVegetationModal, setShowVegetationModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [realtimeData, setRealtimeData] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);
  const currentTenant = useAppSelector(state => state.tenant.currentTenant);
  
  // Fetch NDVI data
  const { data: ndviSnapshot } = useNDVIData(farmer.id);

  // Fetch farmer name and real-time data from farmers table
  useEffect(() => {
    const fetchFarmerData = async () => {
      if (!farmer.id || !currentTenant) return;
      
      try {
        // Fetch real-time farmer data
        const { data, error } = await supabase
          .from('farmers')
          .select('*')
          .eq('id', farmer.id)
          .eq('tenant_id', currentTenant.id)
          .single();

        if (data && !error) {
          setRealtimeData(data);
          // Show farmer_name if available, fallback to farmer_code
          setFarmerName(data.farmer_name || data.farmer_code || 'Farmer');
          
          // Check if user is online (last login within 5 minutes)
          if (data.last_login_at) {
            const lastLogin = new Date(data.last_login_at);
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            setIsOnline(lastLogin > fiveMinutesAgo);
          }
        } else {
          setFarmerName(farmer.farmer_code || 'Farmer');
        }
      } catch (err) {
        console.error('Error fetching farmer data:', err);
        setFarmerName(farmer.farmer_code);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarmerData();

    // Set up real-time subscription
    const channel = supabase
      .channel(`farmer-${farmer.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'farmers',
          filter: `id=eq.${farmer.id}`
        },
        (payload) => {
          console.log('Farmer update:', payload);
          if (payload.new) {
            setRealtimeData(payload.new);
            // Show farmer_name if available, fallback to farmer_code
            setFarmerName((payload.new as any).farmer_name || (payload.new as any).farmer_code || 'Farmer');
            
            // Update online status
            const data = payload.new as any;
            if (data.last_login_at) {
              const lastLogin = new Date(data.last_login_at);
              const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
              setIsOnline(lastLogin > fiveMinutesAgo);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [farmer.id, farmer.farmer_code, currentTenant]);

  const getRiskColor = (level?: string) => {
    const riskLevel = level?.toLowerCase() || 'low';
    switch(riskLevel) {
      case 'high': return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
      case 'medium': return 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white';
      default: return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
    }
  };

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend?: string) => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getStatusColor = () => {
    return isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400';
  };

  // Calculate yield prediction based on mock data
  const calculateYieldPrediction = () => {
    const avgYield = (3.2 + Math.random() * 1.5).toFixed(1);
    return avgYield;
  };

  // Calculate financial metrics (Mock data for SaaS demo)
  const calculateFinancialMetrics = () => {
    const baseRevenue = farmer.total_land_acres ? farmer.total_land_acres * 25000 : 0;
    const variance = Math.random() * 0.3 - 0.15; // +/- 15% variance
    return {
      revenue: Math.round(baseRevenue * (1 + variance)),
      creditScore: Math.floor(Math.random() * 200) + 600, // 600-800 range
      loanEligibility: Math.round(baseRevenue * 0.4)
    };
  };

  const financialMetrics = calculateFinancialMetrics();
  const mockEngagementScore = Math.floor(Math.random() * 40) + 60; // 60-100 range

  return (
    <TooltipProvider>
      <Card 
        className={cn(
          "group relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer border-border/50",
          "bg-gradient-to-br from-background via-background to-muted/5",
          "hover:scale-[1.01] hover:border-primary/40",
          isSelected && "ring-2 ring-primary shadow-xl border-primary/50",
          "h-auto" // Dynamic height instead of fixed
        )}
        onClick={() => setShowDetailModal(true)}
      >
        {/* Live Status Indicator */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {/* Warning for lands without boundaries */}
          {farmer.total_land_acres && farmer.total_land_acres > 0 && !farmer.lands?.some((l: any) => l.boundary) && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-yellow-50 text-yellow-800 border-yellow-300">
              <AlertTriangle className="w-3 h-3 mr-1" />
              No GPS Data
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-background/90">
            <Shield className="w-3 h-3 mr-1" />
            {currentTenant?.name || 'Tenant'}
          </Badge>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1 px-2 py-1 bg-background/90 rounded-full">
                {isOnline ? (
                  <Wifi className="w-3 h-3 text-green-500" />
                ) : (
                  <WifiOff className="w-3 h-3 text-gray-400" />
                )}
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  getStatusColor()
                )} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {isOnline ? 'Online' : `Last seen: ${realtimeData?.last_login_at ? format(new Date(realtimeData.last_login_at), 'dd MMM, HH:mm') : 'Never'}`}
            </TooltipContent>
          </Tooltip>
        </div>

        <CardContent className="p-4 h-full flex flex-col">{/* Reduced padding */}
          {/* Header Section - Compact */}
          <div className="flex items-start justify-between mb-3">
            {/* Farmer Info */}
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${farmerName}`} />
                <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-xs font-bold">
                  {farmerName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sm text-foreground">
                  {isLoading ? (
                    <span className="animate-pulse bg-muted rounded w-20 h-4 inline-block" />
                  ) : (
                    farmerName
                  )}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {realtimeData?.village || 'District'}
                </p>
              </div>
            </div>

            {/* Risk Badge */}
            <Badge className={cn("text-xs px-2 py-0.5 font-semibold", getRiskColor('low'))}>
              Low Risk
            </Badge>
          </div>

          {/* Main Data Grid - Compact 2x2 layout */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* Land & NDVI */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg p-2 border border-green-200/30 dark:border-green-800/30">
              <div className="flex items-center justify-between mb-1">
                <Wheat className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-bold">{realtimeData?.land_in_acres || farmer.total_land_acres?.toFixed(1) || 0} acres</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium">{realtimeData?.primary_crop || 'Mixed Crops'}</p>
              {ndviSnapshot && (
                <div className="flex items-center gap-1 mt-1">
                  <Progress 
                    value={ndviSnapshot.ndvi * 100} 
                    className="h-1 flex-1" 
                  />
                  <span className="text-[9px] font-medium">NDVI: {ndviSnapshot.ndvi.toFixed(2)}</span>
                </div>
              )}
            </div>
            
            {/* Soil Type */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg p-2 border border-amber-200/30 dark:border-amber-800/30">
              <div className="flex items-center justify-between mb-1">
                <Sprout className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs font-semibold">Soil</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium">{realtimeData?.soil_type || 'Loamy'}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">pH: {realtimeData?.soil_ph || '6.5-7.0'}</p>
            </div>

            {/* Water/Irrigation */}
            <div className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30 rounded-lg p-2 border border-blue-200/30 dark:border-blue-800/30">
              <div className="flex items-center justify-between mb-1">
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-semibold">Water</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{realtimeData?.irrigation_type || 'Borewell'}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{realtimeData?.water_source || 'Irrigated'}</p>
            </div>

            {/* Engagement */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 rounded-lg p-2 border border-rose-200/30 dark:border-rose-800/30">
              <div className="flex items-center justify-between mb-1">
                <Activity className="w-3.5 h-3.5 text-rose-600" />
                <span className={cn("text-xs font-bold", getEngagementColor(mockEngagementScore))}>
                  {mockEngagementScore}%
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">Engagement</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">
                Last: {realtimeData?.last_login_at ? format(new Date(realtimeData.last_login_at), 'dd MMM') : 'Never'}
              </p>
            </div>
          </div>

          {/* NDVI Vegetation Health Section - Compact */}
          {ndviSnapshot && (
            <div className="mb-2 p-2 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200/30 dark:border-green-800/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <TreePine className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs font-semibold">Vegetation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn(
                    "text-[10px] px-1.5 py-0",
                    ndviSnapshot.ndvi >= 0.7 ? "bg-green-100 text-green-800" :
                    ndviSnapshot.ndvi >= 0.5 ? "bg-emerald-100 text-emerald-800" :
                    ndviSnapshot.ndvi >= 0.3 ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  )}>
                    {ndviSnapshot.ndvi >= 0.7 ? "Excellent" :
                     ndviSnapshot.ndvi >= 0.5 ? "Good" :
                     ndviSnapshot.ndvi >= 0.3 ? "Moderate" : "Poor"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-2 text-[10px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowVegetationModal(true);
                    }}
                  >
                    Details →
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Additional Metrics Row - Compact */}
          <div className="flex items-center gap-3 mb-2 text-xs">
            <div className="flex items-center gap-1">
              <Package className="w-3 h-3 text-primary" />
              <span className="font-semibold">{realtimeData?.product_count || 3}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-primary" />
              <span className="font-semibold">{realtimeData?.dealer_count || 2}</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3 text-primary" />
              <span className="font-semibold">{realtimeData?.campaign_count || 5}</span>
            </div>
          </div>

          {/* Action Buttons - Horizontal compact layout */}
          <div className="flex gap-1 mt-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCall?.(farmer);
                  }}
                  className="flex-1 h-8 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span className="ml-1 text-xs">Call</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Call {realtimeData?.mobile_number || farmer.mobile_number || 'N/A'}
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMessage?.(farmer);
                  }}
                  className="flex-1 h-8 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="ml-1 text-xs">Msg</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Send WhatsApp</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssign?.(farmer);
                  }}
                  className="flex-1 h-8 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="ml-1 text-xs">Assign</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Assign to Dealer</TooltipContent>
            </Tooltip>
          </div>
        </CardContent>

        {/* Hover Effect Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Card>
      
      {/* Vegetation Trends Modal */}
      <VegetationTrendsModal
        isOpen={showVegetationModal}
        onClose={() => setShowVegetationModal(false)}
        farmerId={farmer.id}
        farmerName={farmerName || farmer.farmer_code}
      />
      
      {/* Comprehensive Farmer Detail Modal */}
      {showDetailModal && (
        <FarmerDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          farmer={farmer}
          realtimeData={realtimeData}
        />
      )}
    </TooltipProvider>
  );
};