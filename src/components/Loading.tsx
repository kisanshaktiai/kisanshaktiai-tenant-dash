
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  timeout?: number;
}

const Loading: React.FC<LoadingProps> = ({ 
  message = 'Loading...', 
  size = 'md',
  timeout = 10000 // 10 second timeout by default
}) => {
  const [showTimeout, setShowTimeout] = useState(false);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  useEffect(() => {
    if (timeout > 0) {
      const timer = setTimeout(() => {
        setShowTimeout(true);
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [timeout]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <Loader2 className={`animate-spin text-primary ${sizeClasses[size]}`} />
      <p className="text-sm text-muted-foreground">{message}</p>
      {showTimeout && (
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">Taking longer than expected...</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-xs text-primary hover:underline"
          >
            Try refreshing the page
          </button>
        </div>
      )}
    </div>
  );
};

export default Loading;
