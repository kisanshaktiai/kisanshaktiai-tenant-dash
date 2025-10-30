import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { 
  Phone, MessageSquare, UserPlus, MapPin, Leaf, 
  TrendingUp, Activity, Wheat, Sprout, Droplets,
  Wifi, WifiOff, Shield, Package, Users, BarChart3
} from 'lucide-react';
import { ComprehensiveFarmerData } from '@/services/EnhancedFarmerDataService';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
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
  const [userProfile, setUserProfile] = useState<any>(null);
  const currentTenant = useAppSelector(state => state.tenant.currentTenant);
  
  const { data: ndviSnapshot } = useNDVIData(farmer.id);

  useEffect(() => {
    const fetchFarmerData = async () => {
      if (!farmer.id || !currentTenant) return;
      
      try {
        // Fetch farmer and user profile data in parallel
        const [farmerResult, profileResult] = await Promise.all([
          supabase
            .from('farmers')
            .select('*')
            .eq('id', farmer.id)
            .eq('tenant_id', currentTenant.id)
            .single(),
          supabase
            .from('user_profiles')
            .select('*')
            .eq('id', farmer.id)
            .single()
        ]);

        if (farmerResult.data) {
          setRealtimeData(farmerResult.data);
          
          // Priority: display_name > full_name > farmer_name > farmer_code
          let displayName = farmerResult.data.farmer_code;
          if (profileResult.data) {
            setUserProfile(profileResult.data);
            displayName = profileResult.data.display_name || 
                         profileResult.data.full_name || 
                         farmerResult.data.farmer_name || 
                         farmerResult.data.farmer_code;
          } else if (farmerResult.data.farmer_name) {
            displayName = farmerResult.data.farmer_name;
          }
          
          setFarmerName(displayName);
          
          // Check online status (last 5 minutes)
          if (farmerResult.data.last_login_at) {
            const lastLogin = new Date(farmerResult.data.last_login_at);
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

    // Real-time subscription
    const channel = supabase
      .channel(`farmer-${farmer.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'farmers',
        filter: `id=eq.${farmer.id}`
      }, (payload) => {
        if (payload.new) {
          setRealtimeData(payload.new);
          const data = payload.new as any;
          if (data.last_login_at) {
            const lastLogin = new Date(data.last_login_at);
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            setIsOnline(lastLogin > fiveMinutesAgo);
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [farmer.id, farmer.farmer_code, currentTenant]);

  const getRiskColor = (level?: string) => {
    const riskLevel = level?.toLowerCase() || 'low';
    switch(riskLevel) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      default: return 'bg-success text-success-foreground';
    }
  };

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const mockEngagementScore = Math.floor(Math.random() * 40) + 60;

  return (
    <TooltipProvider>
      <Card 
        className={cn(
          "group relative overflow-hidden transition-all duration-300 cursor-pointer",
          "backdrop-blur-xl bg-background/80 border-border/50",
          "hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)]",
          "hover:scale-[1.02] hover:border-primary/40",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-transparent",
          "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
          isSelected && "ring-2 ring-primary shadow-xl border-primary/50"
        )}
        onClick={() => setShowDetailModal(true)}
      >
        {/* Glass-morphic gradient overlay */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        
        {/* Live Status Indicator */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-background/90 backdrop-blur-sm border-border/50">
            <Shield className="w-3 h-3 mr-1" />
            {currentTenant?.name || 'Tenant'}
          </Badge>
          <Tooltip>
            <TooltipTrigger>
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-sm transition-all duration-300",
                isOnline ? "bg-success/10" : "bg-muted/80"
              )}>
                {isOnline ? (
                  <Wifi className="w-3 h-3 text-success" />
                ) : (
                  <WifiOff className="w-3 h-3 text-muted-foreground" />
                )}
                <div className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  isOnline ? "bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-muted-foreground"
                )} />
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-background/95 backdrop-blur-sm">
              {isOnline ? 'Online Now' : `Last seen: ${realtimeData?.last_login_at ? format(new Date(realtimeData.last_login_at), 'dd MMM, HH:mm') : 'Never'}`}
            </TooltipContent>
          </Tooltip>
        </div>

        <CardContent className="p-4 relative z-10">
          {/* Header - Farmer Info */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-primary/30 shadow-lg ring-2 ring-background">
                <AvatarImage src={userProfile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${farmerName}`} />
                <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-sm font-bold">
                  {farmerName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  {isLoading ? (
                    <span className="animate-pulse bg-muted rounded w-24 h-5 inline-block" />
                  ) : (
                    farmerName
                  )}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {realtimeData?.village || 'Location'}
                </p>
              </div>
            </div>

            {/* Risk Badge */}
            <Badge className={cn("text-xs px-3 py-1 font-semibold shadow-sm", getRiskColor('low'))}>
              Low Risk
            </Badge>
          </div>

          {/* Smart Metric Cards - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Land & NDVI */}
            <div className="relative overflow-hidden rounded-xl p-3 backdrop-blur-sm bg-success/10 border border-success/20 hover:bg-success/15 transition-all duration-300 group/card">
              <div className="absolute top-0 right-0 w-16 h-16 bg-success/5 rounded-full -mr-8 -mt-8" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <Wheat className="w-4 h-4 text-success" />
                  <span className="text-sm font-bold text-foreground">{realtimeData?.land_in_acres || farmer.total_land_acres?.toFixed(1) || 0} ac</span>
                </div>
                <p className="text-[11px] text-muted-foreground font-medium mb-2">{realtimeData?.primary_crop || 'Mixed Crops'}</p>
                {ndviSnapshot && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">NDVI</span>
                      <span className="font-bold text-success">{ndviSnapshot.ndvi.toFixed(2)}</span>
                    </div>
                    <Progress value={ndviSnapshot.ndvi * 100} className="h-1.5 bg-success/20" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Soil Health */}
            <div className="relative overflow-hidden rounded-xl p-3 backdrop-blur-sm bg-warning/10 border border-warning/20 hover:bg-warning/15 transition-all duration-300 group/card">
              <div className="absolute top-0 right-0 w-16 h-16 bg-warning/5 rounded-full -mr-8 -mt-8" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <Sprout className="w-4 h-4 text-warning" />
                  <span className="text-sm font-semibold text-foreground">Soil</span>
                </div>
                <p className="text-[11px] text-muted-foreground font-medium">{realtimeData?.soil_type || 'Loamy'}</p>
                <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                  pH: <span className="font-semibold">{realtimeData?.soil_ph || '6.5-7.0'}</span>
                </p>
              </div>
            </div>

            {/* Irrigation */}
            <div className="relative overflow-hidden rounded-xl p-3 backdrop-blur-sm bg-info/10 border border-info/20 hover:bg-info/15 transition-all duration-300 group/card">
              <div className="absolute top-0 right-0 w-16 h-16 bg-info/5 rounded-full -mr-8 -mt-8" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <Droplets className="w-4 h-4 text-info" />
                  <span className="text-sm font-semibold text-foreground">Water</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{realtimeData?.irrigation_type || 'Borewell'}</p>
                <p className="text-[10px] text-muted-foreground mt-1.5">{realtimeData?.water_source || 'Irrigated'}</p>
              </div>
            </div>

            {/* Engagement */}
            <div className="relative overflow-hidden rounded-xl p-3 backdrop-blur-sm bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-all duration-300 group/card">
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -mr-8 -mt-8" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className={cn("text-sm font-bold", getEngagementColor(mockEngagementScore))}>
                    {mockEngagementScore}%
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-1">Engagement</p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span>Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* NDVI Vegetation Health Section */}
          {ndviSnapshot && (
            <div className="mb-3 p-2.5 bg-gradient-to-br from-success/5 to-success/10 dark:from-success/10 dark:to-success/5 rounded-lg border border-success/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-success" />
                  <span className="text-xs font-semibold">Vegetation Health</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn(
                    "text-[10px] px-2 py-0.5 border",
                    ndviSnapshot.ndvi >= 0.7 ? "bg-success/10 text-success border-success/30" :
                    ndviSnapshot.ndvi >= 0.5 ? "bg-success/10 text-success border-success/30" :
                    ndviSnapshot.ndvi >= 0.3 ? "bg-warning/10 text-warning border-warning/30" :
                    "bg-destructive/10 text-destructive border-destructive/30"
                  )}>
                    {ndviSnapshot.ndvi >= 0.7 ? "Excellent" :
                     ndviSnapshot.ndvi >= 0.5 ? "Good" :
                     ndviSnapshot.ndvi >= 0.3 ? "Moderate" : "Poor"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px] hover:bg-success/20"
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

          {/* Quick Stats */}
          <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-primary" />
              <span className="font-semibold text-foreground">{realtimeData?.product_count || 3}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span className="font-semibold text-foreground">{realtimeData?.dealer_count || 2}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-primary" />
              <span className="font-semibold text-foreground">{realtimeData?.campaign_count || 5}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCall?.(farmer);
                  }}
                  className="flex-1 h-9 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                >
                  <Phone className="w-3.5 h-3.5 mr-1.5" />
                  Call
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-background/95 backdrop-blur-sm">
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
                  className="flex-1 h-9 hover:bg-success hover:text-success-foreground hover:border-success transition-all duration-200"
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                  Msg
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-background/95 backdrop-blur-sm">Send WhatsApp</TooltipContent>
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
                  className="flex-1 h-9 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-200"
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                  Assign
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-background/95 backdrop-blur-sm">Assign to Dealer</TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showVegetationModal && (
        <VegetationTrendsModal
          isOpen={showVegetationModal}
          onClose={() => setShowVegetationModal(false)}
          farmerId={farmer.id}
          farmerName={farmerName}
        />
      )}

      {showDetailModal && (
        <FarmerDetailModal
          farmer={farmer}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </TooltipProvider>
  );
};
