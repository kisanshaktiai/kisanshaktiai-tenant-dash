import React, { useState } from 'react';
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
  CheckCircle,
  MoreHorizontal,
  Eye,
  Edit,
  MessageCircle
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Farmer } from '@/hooks/data/farmers/useRealtimeFarmersData';

interface SimpleFarmerCardProps {
  farmer: Farmer;
  viewType?: 'grid' | 'list' | 'compact';
  onViewProfile?: (farmer: Farmer) => void;
  onEdit?: (farmer: Farmer) => void;
  onContact?: (farmer: Farmer, method: 'call' | 'sms' | 'whatsapp') => void;
  isSelected?: boolean;
  onSelect?: (farmerId: string, selected: boolean) => void;
  className?: string;
}

export const SimpleFarmerCard: React.FC<SimpleFarmerCardProps> = ({
  farmer,
  viewType = 'grid',
  onViewProfile,
  onEdit,
  onContact,
  isSelected = false,
  onSelect,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate engagement score based on app opens
  const engagementScore = farmer.total_app_opens ? Math.min(100, (farmer.total_app_opens / 50) * 100) : 0;
  
  // Check if online (active in last 24 hours)
  const isOnline = farmer.last_app_open ? 
    new Date(farmer.last_app_open).getTime() > Date.now() - 86400000 : false;
  
  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatLastSeen = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const farmerName = farmer.full_name || farmer.farmer_code;
  const farmerInitials = farmerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'F';

  if (viewType === 'compact') {
    return (
      <Card 
        className={cn(
          "p-3 cursor-pointer transition-all duration-200 hover:shadow-md",
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
            {farmer.total_land_acres && (
              <Badge variant="outline" className="text-xs">
                {farmer.total_land_acres}ac
              </Badge>
            )}
            {farmer.is_verified && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
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
                  <Phone className="w-3 h-3" />
                  <span className="truncate">{farmer.mobile_number || 'No phone'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wheat className="w-3 h-3" />
                  <span>{farmer.total_land_acres || 0} acres</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span className={getEngagementColor(engagementScore)}>
                    {Math.round(engagementScore)}% engaged
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatLastSeen(farmer.last_app_open)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
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
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewProfile?.(farmer)}
    >
      <CardContent className="p-6">
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
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/60 rounded-lg p-3 border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Wheat className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Land</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{farmer.total_land_acres || 0} ac</p>
            {farmer.primary_crop && (
              <p className="text-xs text-gray-500">{farmer.primary_crop}</p>
            )}
          </div>
          
          <div className="bg-white/60 rounded-lg p-3 border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Activity</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{farmer.total_app_opens || 0}</p>
            <p className="text-xs text-gray-500">App opens</p>
          </div>
        </div>

        {/* Engagement Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Engagement</span>
            <span className={cn("text-sm font-bold", getEngagementColor(engagementScore))}>
              {Math.round(engagementScore)}%
            </span>
          </div>
          <Progress 
            value={engagementScore} 
            className="h-2"
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
              {formatLastSeen(farmer.last_app_open)}
            </p>
          </div>
        </div>

        {/* Contact Info */}
        {farmer.mobile_number && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Phone className="w-4 h-4" />
            <span>{farmer.mobile_number}</span>
          </div>
        )}

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
      </CardContent>
    </Card>
  );
};