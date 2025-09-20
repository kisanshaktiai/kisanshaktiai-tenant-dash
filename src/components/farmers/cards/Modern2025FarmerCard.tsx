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
  Sprout, BarChart3, Banknote, Shield, Clock
} from 'lucide-react';
import { ComprehensiveFarmerData } from '@/services/EnhancedFarmerDataService';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';

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
  const currentTenant = useAppSelector(state => state.tenant.currentTenant);

  // Fetch farmer name from farmers table (which has these fields)
  useEffect(() => {
    const fetchFarmerName = async () => {
      if (!farmer.id || !currentTenant) return;
      
      try {
        // For now, use farmer_code as the name since user_profile is not in the schema
        // In a real implementation, you would fetch from the correct table
        const farmerDisplayName = farmer.farmer_code || 'Farmer';
        setFarmerName(farmerDisplayName);
      } catch (err) {
        console.error('Error setting farmer name:', err);
        setFarmerName(farmer.farmer_code);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarmerName();
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

  const getStatusColor = (isOnline?: boolean) => {
    return isOnline ? 'bg-green-500' : 'bg-gray-400';
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
          "group relative overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer border-border/50",
          "bg-gradient-to-br from-background via-background to-muted/5",
          "hover:scale-[1.01] hover:border-primary/40",
          isSelected && "ring-2 ring-primary shadow-xl border-primary/50",
          "h-[340px]" // Increased height for vertical layout
        )}
        onClick={() => onSelect?.(farmer)}
      >
        {/* Live Status Indicator */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-background/90">
            <Shield className="w-3 h-3 mr-1" />
            {currentTenant?.name || 'Tenant'}
          </Badge>
          <div className={cn(
            "w-2.5 h-2.5 rounded-full animate-pulse",
            getStatusColor(true) // Mock online status
          )} />
        </div>

        <CardContent className="p-5 h-full flex flex-col">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-4">
            {/* Farmer Info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-md">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${farmerName}`} />
                <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-sm font-bold">
                  {farmerName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-lg text-foreground">
                  {isLoading ? (
                    <span className="animate-pulse bg-muted rounded w-28 h-5 inline-block" />
                  ) : (
                    farmerName
                  )}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  Location: District
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                  ID: {farmer.farmer_code}
                </p>
              </div>
            </div>

            {/* Risk Badge */}
            <Badge className={cn("text-xs px-2.5 py-0.5 font-semibold", getRiskColor('low'))}>
              Low Risk
            </Badge>
          </div>

          {/* Main Data Grid - 2 columns for better organization */}
          <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
            {/* Left Column - Land & Agriculture */}
            <div className="space-y-2.5">
              {/* Land Holdings */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg p-2.5 border border-green-200/30 dark:border-green-800/30">
                <div className="flex items-center justify-between mb-1.5">
                  <Wheat className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-bold">{farmer.total_land_acres?.toFixed(1) || 0} acres</span>
                </div>
                <p className="text-[11px] text-muted-foreground font-medium">{farmer.primary_crops?.join(', ') || 'Mixed Crops'}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Progress value={70} className="h-1.5 flex-1" />
                  <span className="text-[10px] font-medium">NDVI</span>
                </div>
              </div>
              
              {/* Water & Soil */}
              <div className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30 rounded-lg p-2.5 border border-blue-200/30 dark:border-blue-800/30">
                <div className="flex items-center justify-between mb-1">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold">Irrigated</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Soil: Loamy</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Water Source: Borewell</p>
              </div>

              {/* Yield Prediction */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg p-2.5 border border-amber-200/30 dark:border-amber-800/30">
                <div className="flex items-center justify-between mb-1">
                  <Target className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-bold">{calculateYieldPrediction()} t/ha</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Expected Yield</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon('up')}
                  <span className="text-[10px] font-medium">vs last season</span>
                </div>
              </div>
            </div>

            {/* Right Column - Business & Engagement */}
            <div className="space-y-2.5">
              {/* Financial Metrics */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-lg p-2.5 border border-purple-200/30 dark:border-purple-800/30">
                <div className="flex items-center justify-between mb-1">
                  <Banknote className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-bold">₹{(financialMetrics.revenue / 1000).toFixed(0)}K</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Est. Annual Revenue</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Credit: {financialMetrics.creditScore}</p>
              </div>

              {/* Engagement Score */}
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 rounded-lg p-2.5 border border-rose-200/30 dark:border-rose-800/30">
                <div className="flex items-center justify-between mb-1">
                  <Activity className="w-4 h-4 text-rose-600" />
                  <span className={cn("text-sm font-bold", getEngagementColor(mockEngagementScore))}>
                    {mockEngagementScore}%
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">Platform Engagement</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Last: {farmer.created_at ? format(new Date(farmer.created_at), 'dd MMM') : 'Never'}
              </div>

              {/* Weather & Advisory */}
              <div className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30 rounded-lg p-2.5 border border-cyan-200/30 dark:border-cyan-800/30">
                <div className="flex items-center justify-between mb-1">
                  <Cloud className="w-4 h-4 text-cyan-600" />
                  <span className="text-xs font-semibold">28°C</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Clear Sky</p>
                <p className="text-[10px] text-green-600 font-medium mt-0.5">✓ Good for spraying</p>
              </div>
            </div>
          </div>

          {/* Additional Metrics Row - Multi-tenant SaaS specific */}
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border/50">
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1.5 text-xs">
                  <Package className="w-3.5 h-3.5 text-primary" />
                  <span className="font-semibold">{farmer.products_purchased || 0}</span>
                  <span className="text-muted-foreground">Products</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>Products Purchased</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1.5 text-xs">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  <span className="font-semibold">{farmer.dealer_interactions || 3}</span>
                  <span className="text-muted-foreground">Dealers</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>Dealer Interactions</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1.5 text-xs">
                  <BarChart3 className="w-3.5 h-3.5 text-primary" />
                  <span className="font-semibold">{farmer.campaigns_received || 5}</span>
                  <span className="text-muted-foreground">Campaigns</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>Campaigns Received</TooltipContent>
            </Tooltip>
          </div>

          {/* Action Buttons - Vertical Layout with Icons and Text */}
          <div className="flex flex-col gap-2 mt-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onCall?.(farmer);
              }}
              className="w-full justify-start gap-2.5 h-9 text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-200 group"
            >
              <Phone className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              Call Farmer
              <span className="ml-auto text-[10px] opacity-60">{farmer.mobile_number?.slice(-4) || 'N/A'}</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onMessage?.(farmer);
              }}
              className="w-full justify-start gap-2.5 h-9 text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-200 group"
            >
              <MessageSquare className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              Send Message
              <Badge variant="secondary" className="ml-auto text-[10px] px-1 py-0">WhatsApp</Badge>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onAssign?.(farmer);
              }}
              className="w-full justify-start gap-2.5 h-9 text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-200 group"
            >
              <UserPlus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              Assign to Dealer
              <Clock className="w-3 h-3 ml-auto opacity-60" />
            </Button>
          </div>
        </CardContent>

        {/* Hover Effect Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Card>
    </TooltipProvider>
  );
};