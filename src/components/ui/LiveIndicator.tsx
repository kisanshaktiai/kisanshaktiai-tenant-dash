
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveIndicatorProps {
  isConnected: boolean;
  activeChannels?: number;
  className?: string;
  showText?: boolean;
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({ 
  isConnected, 
  activeChannels = 0, 
  className,
  showText = true 
}) => {
  return (
    <Badge 
      variant={isConnected ? "default" : "destructive"} 
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 text-xs font-medium",
        className
      )}
    >
      <div className="flex items-center gap-1">
        {isConnected ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
        <div 
          className={cn(
            "h-2 w-2 rounded-full",
            isConnected ? "bg-success animate-pulse" : "bg-destructive"
          )} 
        />
      </div>
      {showText && (
        <span>
          {isConnected ? `Live (${activeChannels})` : 'Offline'}
        </span>
      )}
    </Badge>
  );
};
