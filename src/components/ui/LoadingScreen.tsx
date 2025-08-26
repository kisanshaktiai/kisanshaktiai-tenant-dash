
import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-primary/20"></div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Loading...</h3>
          <p className="text-sm text-muted-foreground">Please wait while we prepare your workspace</p>
        </div>
      </div>
    </div>
  );
};
