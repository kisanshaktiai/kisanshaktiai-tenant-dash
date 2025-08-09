
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  const statusText = isConnected ? `Live (${activeChannels})` : 'Offline';
  const tooltipText = isConnected 
    ? "Connected to live data feed" 
    : "Disconnected from live updates";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={isConnected ? "default" : "destructive"} 
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 text-xs font-medium cursor-default",
              className
            )}
            role="status"
            aria-live="polite"
            aria-label={`Connection status: ${statusText}`}
          >
            <div className="flex items-center gap-1">
              {isConnected ? (
                <Wifi className="h-3 w-3" aria-hidden="true" />
              ) : (
                <WifiOff className="h-3 w-3" aria-hidden="true" />
              )}
              <div 
                className={cn(
                  "h-2 w-2 rounded-full",
                  isConnected ? "bg-success animate-pulse" : "bg-destructive"
                )} 
                aria-hidden="true"
              /> 
            </div>
            {showText && (
              <span>{statusText}</span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
