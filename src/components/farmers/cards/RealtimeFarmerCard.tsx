import React, { memo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Square, Phone, MapPin, Tag, Wifi, WifiOff, RefreshCw, Clock, MoreHorizontal, User, Calendar, TrendingUp, DollarSign, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRealtimeFarmer } from '@/hooks/data/useRealtimeFarmers';
import { cn } from '@/lib/utils';
import type { Farmer } from '@/services/FarmersService';

interface RealtimeFarmerCardProps {
  farmer: Farmer;
  isSelected: boolean;
  onSelect: (farmerId: string, selected: boolean) => void;
  onSelectFarmer: (farmer: Farmer) => void;
  showSyncStatus?: boolean;
}

export const RealtimeFarmerCard = memo<RealtimeFarmerCardProps>(({
  farmer,
  isSelected,
  onSelect,
  onSelectFarmer,
  showSyncStatus = true,
}) => {
  const { isLive, lastUpdate } = useRealtimeFarmer(farmer.id);
  
  // Calculate engagement score from real data
  const engagementScore = Math.min(100, Math.round(
    ((farmer.total_app_opens || 0) * 0.5) + 
    ((farmer.total_queries || 0) * 2) +
    (farmer.is_verified ? 20 : 0) +
    (farmer.total_land_acres ? Math.min(farmer.total_land_acres * 2, 30) : 0)
  ));
  
  // Determine activity status based on last login
  const isActive = farmer.last_login_at ? 
    (new Date().getTime() - new Date(farmer.last_login_at).getTime()) < 7 * 24 * 60 * 60 * 1000 : false;

  const handleCheckboxClick = () => {
    onSelect(farmer.id, !isSelected);
  };

  const handleViewProfile = () => {
    onSelectFarmer(farmer);
  };

  return (
    <Card className={cn(
      "p-4 transition-all duration-200",
      isLive ? "border-success/50" : "border-border",
      "hover:shadow-md"
    )}>
      <div className="flex flex-col gap-3">
        {/* Header with sync status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isSelected ? (
              <CheckSquare 
                className="h-5 w-5 text-primary cursor-pointer" 
                onClick={handleCheckboxClick}
              />
            ) : (
              <Square 
                className="h-5 w-5 text-muted-foreground cursor-pointer" 
                onClick={handleCheckboxClick}
              />
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base">
                  {farmer.farmer_name || farmer.farmer_code || 'Unknown Farmer'}
                </h3>
                {farmer.is_verified && (
                  <Badge variant="secondary" className="text-xs">Verified</Badge>
                )}
                {farmer.is_active && (
                  <Badge variant="outline" className="text-xs text-success">Active</Badge>
                )}
              </div>
              {farmer.farmer_code && (
                <span className="text-xs text-muted-foreground">ID: {farmer.farmer_code}</span>
              )}
            </div>
          </div>

          {/* Sync status indicator */}
          {showSyncStatus && (
            <div className="flex items-center gap-2 text-xs">
              {isLive ? (
                <>
                  <Wifi className="h-3 w-3 text-success animate-pulse" />
                  <span className="text-success">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Offline</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Farmer Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {farmer.mobile_number && (
            <div className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="truncate">{farmer.mobile_number}</span>
            </div>
          )}
          {farmer.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="truncate">{farmer.location}</span>
            </div>
          )}
          {farmer.total_land_acres !== null && (
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{farmer.total_land_acres} acres</span>
            </div>
          )}
          {farmer.farming_experience_years !== null && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{farmer.farming_experience_years} years exp.</span>
            </div>
          )}
          {farmer.annual_income_range && (
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="truncate">{farmer.annual_income_range}</span>
            </div>
          )}
          {farmer.language_preference && (
            <div className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="truncate">{farmer.language_preference}</span>
            </div>
          )}
        </div>

        {/* Crops and Features */}
        <div className="flex flex-wrap gap-2">
          {farmer.primary_crops && farmer.primary_crops.length > 0 && farmer.primary_crops.map((crop, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              <Tag className="h-3 w-3 mr-1" />
              {crop}
            </Badge>
          ))}
          {farmer.farm_type && (
            <Badge variant="secondary" className="text-xs">{farmer.farm_type}</Badge>
          )}
          {farmer.has_irrigation && (
            <Badge variant="secondary" className="text-xs">
              {farmer.irrigation_type || 'Irrigation'}
            </Badge>
          )}
          {farmer.has_tractor && (
            <Badge variant="secondary" className="text-xs">Tractor</Badge>
          )}
          {farmer.has_storage && (
            <Badge variant="secondary" className="text-xs">Storage</Badge>
          )}
        </div>

        {/* Actions and Last Sync */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewProfile}
              className="text-xs"
            >
              View Profile
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleViewProfile}>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Edit Farmer
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Send Message
                </DropdownMenuItem>
                <DropdownMenuItem>
                  View Activities
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  Remove Farmer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Last sync time */}
          {lastUpdate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Synced {format(lastUpdate, 'HH:mm:ss')}</span>
            </div>
          )}
        </div>

        {/* Real-time activity indicators */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {farmer.total_app_opens !== null && (
              <span>App Opens: {farmer.total_app_opens}</span>
            )}
            {farmer.total_queries !== null && (
              <span>Queries: {farmer.total_queries}</span>
            )}
            {farmer.last_login_at && (
              <span>Last Login: {format(new Date(farmer.last_login_at), 'MMM dd')}</span>
            )}
            {farmer.app_install_date && (
              <span>Since: {format(new Date(farmer.app_install_date), 'MMM yyyy')}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <RefreshCw className={cn(
              "h-3 w-3",
              isLive && "animate-spin text-primary"
            )} />
            <span>{isLive ? 'Auto-syncing' : 'Manual sync'}</span>
          </div>
        </div>
      </div>
    </Card>
  );
});

RealtimeFarmerCard.displayName = 'RealtimeFarmerCard';