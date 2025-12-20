import React from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppVersion } from '@/hooks/useAppVersion';

export const UpdateBanner: React.FC = () => {
  const { needsUpdate, version, applyUpdate, dismissUpdate } = useAppVersion();

  if (!needsUpdate || !version) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        <span className="text-sm font-medium">
          New version {version.version} available
          {version.release_notes && ` - ${version.release_notes}`}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={applyUpdate}
          className="h-7 text-xs"
        >
          Update Now
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={dismissUpdate}
          className="h-7 w-7 p-0 hover:bg-primary-foreground/10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
