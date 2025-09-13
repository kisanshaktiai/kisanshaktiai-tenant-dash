import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Phone, 
  Calendar, 
  TrendingUp, 
  Wifi, 
  WifiOff,
  RefreshCw,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface RealtimeFarmerCardProps {
  farmer: any;
  onClick?: () => void;
  isSelected?: boolean;
  lastSyncTime?: Date | null;
  isConnected?: boolean;
  isPending?: boolean;
  onRefresh?: () => void;
}

export const RealtimeFarmerCard: React.FC<RealtimeFarmerCardProps> = ({
  farmer,
  onClick,
  isSelected = false,
  lastSyncTime,
  isConnected = false,
  isPending = false,
  onRefresh
}) => {
  const formatSyncTime = (time: Date | null) => {
    if (!time) return 'Never synced';
    return formatDistanceToNow(time, { addSuffix: true });
  };

  const getSyncStatusColor = () => {
    if (!isConnected) return 'text-muted-foreground';
    if (isPending) return 'text-warning';
    return 'text-success';
  };

  const getSyncStatusIcon = () => {
    if (!isConnected) return <WifiOff className="h-3 w-3" />;
    if (isPending) return <RefreshCw className="h-3 w-3 animate-spin" />;
    return <Wifi className="h-3 w-3" />;
  };

  if (!farmer) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const metadata = farmer.metadata || {};
  const personalInfo = metadata.personal_info || {};
  const addressInfo = metadata.address_info || {};
  const farmingInfo = metadata.farming_info || {};

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-lg relative overflow-hidden",
        isSelected && "ring-2 ring-primary",
        isPending && "opacity-75"
      )}
      onClick={onClick}
    >
      {/* Real-time sync indicator */}
      <div className="absolute top-2 right-2 z-10">
        <div className="flex items-center gap-1">
          <div className={cn("flex items-center gap-1", getSyncStatusColor())}>
            {getSyncStatusIcon()}
            <span className="text-[10px] font-medium">
              {isConnected ? (isPending ? 'Syncing...' : 'Live') : 'Offline'}
            </span>
          </div>
          {onRefresh && !isConnected && (
            <Button
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onRefresh();
              }}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={personalInfo.profile_picture || ''} 
                alt={personalInfo.full_name || farmer.farmer_code} 
              />
              <AvatarFallback>
                {(personalInfo.full_name || farmer.farmer_code || 'F').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="font-semibold text-base">
                {personalInfo.full_name || farmer.farmer_code}
              </h3>
              <p className="text-xs text-muted-foreground">
                {farmer.farmer_code}
              </p>
            </div>
          </div>
          
          <Badge 
            variant="secondary"
            className={cn(
              "text-xs",
              farmer.verification_status === 'verified' && "bg-success/10 text-success border-success/20"
            )}
          >
            {farmer.verification_status || 'pending'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Contact Info */}
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{farmer.mobile_number}</span>
        </div>
        
        {/* Location */}
        {(addressInfo.village || addressInfo.district) && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="truncate">
              {[addressInfo.village, addressInfo.district].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
        
        {/* Farming Info */}
        {farmingInfo.total_land_area && (
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{farmingInfo.total_land_area} acres</span>
          </div>
        )}

        {/* Active Crops */}
        {farmingInfo.primary_crops && farmingInfo.primary_crops.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {farmingInfo.primary_crops.slice(0, 3).map((crop: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {crop}
              </Badge>
            ))}
            {farmingInfo.primary_crops.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{farmingInfo.primary_crops.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        {/* Last Sync Time */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Updated {formatSyncTime(lastSyncTime)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};