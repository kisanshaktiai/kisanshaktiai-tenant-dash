
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw } from 'lucide-react';

interface DisconnectBannerProps {
  isReconnecting: boolean;
  reconnectAttempts: number;
  onReconnect: () => void;
}

export const DisconnectBanner: React.FC<DisconnectBannerProps> = ({
  isReconnecting,
  reconnectAttempts,
  onReconnect,
}) => {
  return (
    <Alert 
      className="fixed top-16 left-4 right-4 z-40 border-warning bg-warning/10"
      role="status"
      aria-live="polite"
    >
      <WifiOff className="h-4 w-4 text-warning" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          {isReconnecting 
            ? `Reconnecting... (attempt ${reconnectAttempts})` 
            : 'Connection lost. Live updates are paused.'
          }
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onReconnect}
          disabled={isReconnecting}
          className="ml-4"
        >
          {isReconnecting ? (
            <>
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Reconnecting
            </>
          ) : (
            'Reconnect'
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
};
