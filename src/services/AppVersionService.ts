import { supabase } from '@/integrations/supabase/client';

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

const APP_KEY = 'tenant_portal';
const LOCAL_VERSION_KEY = 'app_version_hash';

class AppVersionService {
  private static instance: AppVersionService;
  private currentVersion: AppVersion | null = null;
  private checkInProgress = false;

  static getInstance(): AppVersionService {
    if (!AppVersionService.instance) {
      AppVersionService.instance = new AppVersionService();
    }
    return AppVersionService.instance;
  }

  async getCurrentVersion(): Promise<AppVersion | null> {
    if (this.currentVersion) return this.currentVersion;

    try {
      const { data, error } = await supabase
        .from('app_versions')
        .select('id, version, build_hash, force_update, min_supported_version, release_notes, features_added, bugs_fixed, breaking_changes')
        .eq('app_key', APP_KEY)
        .eq('is_current', true)
        .single();

      if (error || !data) return null;

      this.currentVersion = {
        id: data.id,
        version: data.version,
        build_hash: data.build_hash,
        force_update: data.force_update ?? false,
        min_supported_version: data.min_supported_version,
        release_notes: data.release_notes,
        features_added: (data.features_added as string[]) ?? [],
        bugs_fixed: (data.bugs_fixed as string[]) ?? [],
        breaking_changes: (data.breaking_changes as string[]) ?? [],
      };

      return this.currentVersion;
    } catch {
      return null;
    }
  }

  getStoredBuildHash(): string | null {
    return localStorage.getItem(LOCAL_VERSION_KEY);
  }

  storeBuildHash(hash: string): void {
    localStorage.setItem(LOCAL_VERSION_KEY, hash);
  }

  async checkForUpdates(): Promise<{ needsUpdate: boolean; forceUpdate: boolean; version: AppVersion | null }> {
    if (this.checkInProgress) {
      return { needsUpdate: false, forceUpdate: false, version: null };
    }

    this.checkInProgress = true;

    try {
      const version = await this.getCurrentVersion();
      if (!version) {
        return { needsUpdate: false, forceUpdate: false, version: null };
      }

      const storedHash = this.getStoredBuildHash();
      
      // First time or hash mismatch means update needed
      if (!storedHash) {
        this.storeBuildHash(version.build_hash);
        return { needsUpdate: false, forceUpdate: false, version };
      }

      const needsUpdate = storedHash !== version.build_hash;
      
      return {
        needsUpdate,
        forceUpdate: needsUpdate && version.force_update,
        version,
      };
    } finally {
      this.checkInProgress = false;
    }
  }

  applyUpdate(): void {
    const version = this.currentVersion;
    if (version) {
      this.storeBuildHash(version.build_hash);
    }
    // Force reload to get new assets
    window.location.reload();
  }

  clearCache(): void {
    this.currentVersion = null;
  }
}

export const appVersionService = AppVersionService.getInstance();
