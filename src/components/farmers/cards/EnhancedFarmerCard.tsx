import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Navigation
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { type Farmer } from '@/hooks/data/farmers/useRealtimeFarmersData';

interface EnhancedFarmerCardProps {
  farmer: Farmer;
  viewType?: 'grid' | 'list' | 'compact' | 'kanban';
  onViewProfile?: (farmer: Farmer) => void;
  onEdit?: (farmer: Farmer) => void;
  onContact?: (farmer: Farmer, method: 'call' | 'sms' | 'whatsapp') => void;
  isSelected?: boolean;
  onSelect?: (farmerId: string, selected: boolean) => void;
  className?: string;
}

export const EnhancedFarmerCard: React.FC<EnhancedFarmerCardProps> = ({
  farmer,
  viewType = 'grid',
  onViewProfile,
  onEdit,
  onContact,
  isSelected = false,
  onSelect,
  className
}) => {
  const [isChecked, setIsChecked] = useState(isSelected);

  const handleCheckboxChange = () => {
    const newState = !isChecked;
    setIsChecked(newState);
    onSelect?.(farmer.id, newState);
  };

  // Calculate engagement score based on available data
  const engagementScore = farmer.total_app_opens ? Math.min(100, (farmer.total_app_opens / 50) * 100) : 0;
  
  // Calculate risk level based on available data
  const getRiskLevel = () => {
    if (!farmer.last_app_open) return 'high';
    const daysSinceLastOpen = Math.floor(
      (new Date().getTime() - new Date(farmer.last_app_open).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLastOpen > 30) return 'high';
    if (daysSinceLastOpen > 14) return 'medium';
    return 'low';
  };

  const riskLevel = getRiskLevel();

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="w-3 h-3" />;
      case 'medium': return <Clock className="w-3 h-3" />;
      case 'high': return <AlertTriangle className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  if (viewType === 'compact') {
    return (
      <div className={cn(
        "flex items-center p-3 hover:bg-muted/50 border-b transition-colors",
        isChecked && "bg-primary/5",
        className
      )}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleCheckboxChange}
          className="mr-3"
        />
        <Avatar className="h-8 w-8 mr-3">
          <AvatarFallback className="text-xs">
            {farmer.full_name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{farmer.full_name}</span>
            <Badge variant="outline" className="text-xs">{farmer.farmer_code}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{farmer.primary_crop || 'N/A'}</span>
          <span>{farmer.total_land_acres ? `${farmer.total_land_acres} acres` : 'N/A'}</span>
          <Badge className={cn("text-xs", getRiskColor(riskLevel))}>
            {getRiskIcon(riskLevel)}
            <span className="ml-1">{riskLevel}</span>
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewProfile?.(farmer)}
          className="ml-2"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  if (viewType === 'list') {
    return (
      <Card className={cn(
        "hover:shadow-md transition-all duration-200",
        isChecked && "ring-2 ring-primary ring-opacity-50",
        className
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleCheckboxChange}
              className="flex-shrink-0"
            />
            
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {farmer.full_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{farmer.full_name}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {farmer.farmer_code}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {farmer.mobile_number}
                    </span>
                    {farmer.primary_crop && (
                      <span className="flex items-center gap-1">
                        <Wheat className="w-3 h-3" />
                        {farmer.primary_crop}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={cn("text-xs", getRiskColor(riskLevel))}>
                    {getRiskIcon(riskLevel)}
                    <span className="ml-1">{riskLevel} risk</span>
                  </Badge>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewProfile?.(farmer)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit?.(farmer)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onContact?.(farmer, 'call')}>
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onContact?.(farmer, 'whatsapp')}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{farmer.total_land_acres || 0} acres</span>
                </div>
                {farmer.has_irrigation && (
                  <div className="flex items-center gap-1">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Irrigation</span>
                  </div>
                )}
                {farmer.has_tractor && (
                  <div className="flex items-center gap-1">
                    <Truck className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Tractor</span>
                  </div>
                )}
                {farmer.has_storage && (
                  <div className="flex items-center gap-1">
                    <Warehouse className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">Storage</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (default)
  return (
    <Card className={cn(
      "hover:shadow-lg transition-all duration-200 cursor-pointer",
      isChecked && "ring-2 ring-primary ring-opacity-50",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleCheckboxChange}
              onClick={(e) => e.stopPropagation()}
            />
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {farmer.full_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{farmer.full_name}</h3>
              <p className="text-sm text-muted-foreground">{farmer.farmer_code}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewProfile?.(farmer)}>
                <Eye className="w-4 h-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(farmer)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onContact?.(farmer, 'call')}>
                <Phone className="w-4 h-4 mr-2" />
                Call
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onContact?.(farmer, 'sms')}>
                <MessageSquare className="w-4 h-4 mr-2" />
                SMS
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onContact?.(farmer, 'whatsapp')}>
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span>{farmer.mobile_number}</span>
          </div>
          
          {farmer.primary_crop && (
            <div className="flex items-center gap-2 text-sm">
              <Wheat className="w-4 h-4 text-muted-foreground" />
              <span>{farmer.primary_crop}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>{farmer.total_land_acres || 0} acres</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <span>App Opens: {farmer.total_app_opens || 0}</span>
          </div>

          {farmer.last_app_open && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Last active: {format(new Date(farmer.last_app_open), 'MMM dd, yyyy')}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-4">
          {farmer.has_irrigation && (
            <Badge variant="secondary" className="text-xs">
              <Droplets className="w-3 h-3 mr-1" />
              Irrigation
            </Badge>
          )}
          {farmer.has_tractor && (
            <Badge variant="secondary" className="text-xs">
              <Truck className="w-3 h-3 mr-1" />
              Tractor
            </Badge>
          )}
          {farmer.has_storage && (
            <Badge variant="secondary" className="text-xs">
              <Warehouse className="w-3 h-3 mr-1" />
              Storage
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <Badge className={cn("text-xs", getRiskColor(riskLevel))}>
            {getRiskIcon(riskLevel)}
            <span className="ml-1">{riskLevel} risk</span>
          </Badge>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewProfile?.(farmer)}
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            {onContact && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onContact(farmer, 'whatsapp')}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Contact
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};