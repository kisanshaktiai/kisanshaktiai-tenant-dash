
import { useEffect } from 'react';
import { useAppearanceSettings } from '@/hooks/useAppearanceSettings';
import { appearanceSettingsService } from '@/services/AppearanceSettingsService';

// DEPRECATED: This hook is no longer used. Theme application is now centralized in ThemeInitializer.
// Kept for backward compatibility but does nothing to prevent duplicate theme applications.
export const useGlobalThemePersistence = () => {
  // No-op: ThemeInitializer handles all theme application now
};
