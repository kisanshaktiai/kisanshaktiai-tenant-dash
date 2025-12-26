import { useState, useEffect, useCallback } from 'react';
import { appVersionService } from '@/services/AppVersionService';

interface AppVersion {
  id: string;
  version: string;
  build_hash: string;
  force_update: boolean;
  min_supported_version: string | null;
  release_notes: string | null;
  features_added: string[];
  bugs_fixed: string[];
  breaking_changes: string[];
}

interface UseAppVersionResult {
  version: AppVersion | null;
  needsUpdate: boolean;
  forceUpdate: boolean;
  isChecking: boolean;
  applyUpdate: () => void;
  dismissUpdate: () => void;
}

export const useAppVersion = (): UseAppVersionResult => {
  const [version, setVersion] = useState<AppVersion | null>(null);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkVersion = async () => {
      const result = await appVersionService.checkForUpdates();
      
      if (mounted) {
        setVersion(result.version);
        setNeedsUpdate(result.needsUpdate);
        setForceUpdate(result.forceUpdate);
        setIsChecking(false);

        // Auto-apply if force update is required
        if (result.forceUpdate) {
          appVersionService.applyUpdate();
        }
      }
    };

    checkVersion();

    return () => {
      mounted = false;
    };
  }, []);

  const applyUpdate = useCallback(() => {
    appVersionService.applyUpdate();
  }, []);

  const dismissUpdate = useCallback(() => {
    setDismissed(true);
    setNeedsUpdate(false);
  }, []);

  return {
    version,
    needsUpdate: needsUpdate && !dismissed,
    forceUpdate,
    isChecking,
    applyUpdate,
    dismissUpdate,
  };
};
