
import React from 'react';
import { Search, Bell, Settings, User, Command, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/lib/utils';

interface EnhancedTopbarProps {
  onOpenCommandPalette: () => void;
  onToggleNotifications: () => void;
  isRealTimeConnected: boolean;
  activeChannels: number;
}

export const EnhancedTopbar: React.FC<EnhancedTopbarProps> = ({
  onOpenCommandPalette,
  onToggleNotifications,
  isRealTimeConnected,
  activeChannels
}) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { user } = useAppSelector((state) => state.auth);

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Section - Search */}
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search farmers, dealers, products... (Ctrl+K)"
              className="pl-9 pr-4 bg-muted/50 border-0 focus-visible:bg-background transition-colors"
              onClick={onOpenCommandPalette}
              readOnly
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                <Command className="h-3 w-3 mr-1" />
                K
              </Badge>
            </div>
          </div>
        </div>

        {/* Center Section - Tenant Info */}
        <div className="flex items-center gap-2">
          {currentTenant && (
            <div className="text-center">
              <div className="text-sm font-semibold">{currentTenant.name}</div>
              <div className="text-xs text-muted-foreground capitalize">
                {currentTenant.subscription_plan?.replace('_', ' ')} Plan
              </div>
            </div>
          )}
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Real-time Status */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50">
            {isRealTimeConnected ? (
              <Wifi className="h-4 w-4 text-success" />
            ) : (
              <WifiOff className="h-4 w-4 text-destructive" />
            )}
            <span className="text-xs text-muted-foreground">
              {activeChannels} Live
            </span>
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative"
            onClick={onToggleNotifications}
          >
            <Bell className="h-5 w-5" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              3
            </Badge>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="sm">
            <Settings className="h-5 w-5" />
          </Button>

          {/* User Avatar */}
          <div className="flex items-center gap-2 ml-2">
            <Avatar className="h-8 w-8 ring-2 ring-primary/20">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-sm">
              <div className="font-medium">{user?.user_metadata?.full_name || 'User'}</div>
              <div className="text-xs text-muted-foreground">Online</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
