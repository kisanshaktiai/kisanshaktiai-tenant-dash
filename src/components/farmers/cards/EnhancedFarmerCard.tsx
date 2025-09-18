
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  MapPin, 
  Phone, 
  MessageSquare, 
  TrendingUp, 
  Wheat, 
  Droplets,
  Truck,
  Warehouse,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  Eye,
  Edit,
  MessageCircle,
  Navigation,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { ComprehensiveFarmerData } from '@/services/EnhancedFarmerDataService';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useRealtimeComprehensiveFarmer } from '@/hooks/data/useRealtimeComprehensiveFarmer';
import { format } from 'date-fns';

interface EnhancedFarmerCardProps {
  farmer: ComprehensiveFarmerData;
  viewType?: 'grid' | 'list' | 'compact' | 'kanban';
  onViewProfile?: (farmer: ComprehensiveFarmerData) => void;
  onEdit?: (farmer: ComprehensiveFarmerData) => void;
  onContact?: (farmer: ComprehensiveFarmerData, method: 'call' | 'sms' | 'whatsapp') => void;
  isSelected?: boolean;
  onSelect?: (farmerId: string, selected: boolean) => void;
  className?: string;
  showRealtimeStatus?: boolean;
}

export const EnhancedFarmerCard: React.FC<EnhancedFarmerCardProps> = ({
  farmer: initialFarmer,
  viewType = 'grid',
  onViewProfile,
  onEdit,
  onContact,
  isSelected = false,
  onSelect,
  className,
  showRealtimeStatus = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Use real-time hook to get latest farmer data
  const { farmer: realtimeFarmer, realtimeStatus, refetch } = useRealtimeComprehensiveFarmer(initialFarmer.id);
  
  // Use real-time data if available, otherwise use initial data
  const farmer = realtimeFarmer || initialFarmer;
  
  // Calculate real metrics from database data
  const totalLandArea = farmer.lands?.reduce((sum, land) => sum + (land.area_acres || 0), 0) || farmer.total_land_acres || 0;
  const cropCount = farmer.cropHistory?.reduce((crops, history) => {
    const crop = history.crop_name;
    if (crop && !crops.includes(crop)) crops.push(crop);
    return crops;
  }, [] as string[]).length || 0;
  
  const appOpens = farmer.total_app_opens || 0;
  const notesCount = farmer.notes?.length || 0;
  const landsCount = farmer.lands?.length || 0;
  
  const engagementScore = Math.min(100, Math.round(
    (appOpens * 0.5) + 
    (notesCount * 10) + 
    (landsCount * 15) +
    (farmer.is_verified ? 10 : 0)
  ));
  
  const healthScore = farmer.healthAssessments?.length > 0 
    ? Math.round(farmer.healthAssessments.reduce((sum, h) => sum + (h.overall_health_score || 50), 0) / farmer.healthAssessments.length)
    : 50;
    
  const riskLevel = engagementScore < 30 ? 'high' : engagementScore < 60 ? 'medium' : 'low';
  const lastLoginDate = farmer.metadata?.activity_data?.last_active_at || farmer.liveStatus?.lastSeen;
  const isOnline = lastLoginDate ? 
    (new Date().getTime() - new Date(lastLoginDate).getTime()) < 3600000 : false;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const farmerName = farmer.metadata?.personal_info?.full_name || farmer.farmer_code;
  const farmerInitials = farmerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'F';

  if (viewType === 'compact') {
    return (
      <Card 
        className={cn(
          "p-3 cursor-pointer transition-all duration-200 hover:shadow-md border-l-4",
          farmer.metrics.riskLevel === 'high' ? 'border-l-red-500' : 
          farmer.metrics.riskLevel === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500',
          isSelected && 'ring-2 ring-primary',
          className
        )}
        onClick={() => onViewProfile?.(farmer)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">{farmerInitials}</AvatarFallback>
              </Avatar>
                {isOnline && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
            </div>
            <div>
              <h4 className="font-medium text-sm">{farmerName}</h4>
              <p className="text-xs text-muted-foreground">{farmer.farmer_code}</p>
            </div>
          </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {totalLandArea.toFixed(1)}ac
        </Badge>
        <Badge 
          variant="outline" 
          className={cn("text-xs", getRiskColor(riskLevel))}
        >
          {riskLevel}
        </Badge>
      </div>
        </div>
      </Card>
    );
  }

  if (viewType === 'list') {
    return (
      <Card 
        className={cn(
          "p-4 cursor-pointer transition-all duration-200 hover:shadow-lg",
          isSelected && 'ring-2 ring-primary',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarFallback>{farmerInitials}</AvatarFallback>
              </Avatar>
              {isOnline && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg truncate">{farmerName}</h3>
                {farmer.is_verified && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                <Badge variant="outline" className="text-xs">
                  {farmer.farmer_code}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">
                    {farmer.metadata?.address_info?.village || 'Location'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Wheat className="w-3 h-3" />
                  <span>{totalLandArea.toFixed(1)} acres</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span className={getEngagementColor(engagementScore)}>
                    {engagementScore}% engaged
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatLastSeen(lastLoginDate || new Date().toISOString())}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end gap-1">
              <Badge 
                variant="outline" 
                className={cn("text-xs", getRiskColor(riskLevel))}
              >
                {riskLevel} risk
              </Badge>
              <div className="flex gap-1">
                {farmer.tags.slice(0, 2).map(tag => (
                  <Badge key={tag.id} variant="secondary" className="text-xs">
                    {tag.tag_name}
                  </Badge>
                ))}
                {farmer.tags.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{farmer.tags.length - 2}
                  </Badge>
                )}
              </div>
            </div>
            
            {isHovered && (
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onContact?.(farmer, 'call');
                  }}
                >
                  <Phone className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onContact?.(farmer, 'whatsapp');
                  }}
                >
                  <MessageCircle className="w-3 h-3" />
                </Button>
              </div>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onViewProfile?.(farmer)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(farmer)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Farmer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onContact?.(farmer, 'call')}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onContact?.(farmer, 'whatsapp')}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  WhatsApp
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    );
  }

  // Default grid view
  return (
    <Card 
      className={cn(
        "group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl",
        "bg-gradient-to-br from-white to-gray-50/30",
        isSelected && 'ring-2 ring-primary',
        realtimeStatus.isConnected && 'border-success/50',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewProfile?.(farmer)}
    >
      <CardContent className="p-6">
        {/* Real-time Status Indicator */}
        {showRealtimeStatus && (
          <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
            {realtimeStatus.isConnected ? (
              <div className="flex items-center gap-1 px-2 py-1 bg-success/10 rounded-full">
                <Wifi className="w-3 h-3 text-success animate-pulse" />
                <span className="text-xs text-success font-medium">Live</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-full">
                <WifiOff className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Offline</span>
              </div>
            )}
            {realtimeStatus.lastSyncTime && (
              <span className="text-xs text-muted-foreground">
                {format(realtimeStatus.lastSyncTime, 'HH:mm:ss')}
              </span>
            )}
          </div>
        )}
        
        {/* Header with Avatar and Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-14 h-14 ring-2 ring-white shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-bold">
                  {farmerInitials}
                </AvatarFallback>
              </Avatar>
              {isOnline && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors">
                {farmerName}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {farmer.farmer_code}
                </Badge>
                {farmer.is_verified && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
            </div>
          </div>
          
          <Badge 
            variant="outline" 
            className={cn("text-xs font-medium", getRiskColor(riskLevel))}
          >
            {riskLevel} risk
          </Badge>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/60 rounded-lg p-3 border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Wheat className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Land</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{totalLandArea.toFixed(1)} ac</p>
            <p className="text-xs text-gray-500">{cropCount} crops</p>
          </div>
          
          <div className="bg-white/60 rounded-lg p-3 border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Health</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{healthScore}%</p>
            <p className="text-xs text-gray-500">Avg score</p>
          </div>
        </div>

        {/* Engagement Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Engagement</span>
            <span className={cn("text-sm font-bold", getEngagementColor(engagementScore))}>
              {engagementScore}%
            </span>
          </div>
          <Progress 
            value={engagementScore} 
            className="h-2"
            // @ts-ignore - Progress component styling
            style={{
              '--progress-background': engagementScore >= 80 ? '#22c55e' :
                                     engagementScore >= 60 ? '#eab308' :
                                     engagementScore >= 40 ? '#f97316' : '#ef4444'
            } as any}
          />
        </div>

        {/* Features Icons */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {farmer.has_irrigation && (
              <div className="p-2 bg-blue-50 rounded-lg">
                <Droplets className="w-4 h-4 text-blue-600" />
              </div>
            )}
            {farmer.has_tractor && (
              <div className="p-2 bg-orange-50 rounded-lg">
                <Truck className="w-4 h-4 text-orange-600" />
              </div>
            )}
            {farmer.has_storage && (
              <div className="p-2 bg-purple-50 rounded-lg">
                <Warehouse className="w-4 h-4 text-purple-600" />
              </div>
            )}
          </div>
          
          <div className="text-right">
            <p className="text-xs text-gray-500">Last seen</p>
            <p className="text-sm font-medium text-gray-700">
              {formatLastSeen(lastLoginDate || new Date().toISOString())}
            </p>
          </div>
        </div>

        {/* Tags */}
        {farmer.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {farmer.tags.slice(0, 3).map(tag => (
              <Badge 
                key={tag.id} 
                variant="secondary" 
                className="text-xs"
                style={{ backgroundColor: tag.tag_color || undefined }}
              >
                {tag.tag_name}
              </Badge>
            ))}
            {farmer.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{farmer.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <MapPin className="w-4 h-4" />
          <span className="truncate">
            {farmer.metadata?.address_info?.village || 'Location not specified'}, 
            {farmer.metadata?.address_info?.district || 'District'}
          </span>
        </div>

        {/* Action Buttons - Show on Hover */}
        {isHovered && (
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProfile?.(farmer);
                }}
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onContact?.(farmer, 'call');
                }}
              >
                <Phone className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onContact?.(farmer, 'whatsapp');
                }}
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Manual Refresh Button - Show when not connected */}
        {!realtimeStatus.isConnected && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute bottom-2 right-2"
            onClick={(e) => {
              e.stopPropagation();
              refetch();
            }}
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
