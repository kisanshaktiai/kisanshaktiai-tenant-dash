
import { useEffect } from 'react';
import { useAppearanceSettings } from '@/hooks/useAppearanceSettings';
import { appearanceSettingsService } from '@/services/AppearanceSettingsService';

export const useGlobalThemePersistence = () => {
  const { settings } = useAppearanceSettings();

  // Ensure theme colors are always applied, even after navigation
  useEffect(() => {
    if (settings) {
      // Apply theme colors whenever settings are available
      appearanceSettingsService.applyThemeColors(settings);
      
      // Store in sessionStorage to persist during the session
      sessionStorage.setItem('current-theme-settings', JSON.stringify(settings));
    }
  }, [settings]);

  // Apply theme from sessionStorage if available (for immediate application)
  useEffect(() => {
    const storedSettings = sessionStorage.getItem('current-theme-settings');
    if (storedSettings && !settings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        appearanceSettingsService.applyThemeColors(parsedSettings);
      } catch (error) {
        console.warn('Failed to parse stored theme settings:', error);
      }
    }
  }, [settings]);
};
