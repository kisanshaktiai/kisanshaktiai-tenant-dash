
import { useEffect } from 'react';
import { useAppearanceSettings } from '@/hooks/useAppearanceSettings';
import { appearanceSettingsService } from '@/services/AppearanceSettingsService';

export const useGlobalThemePersistence = () => {
  const { settings } = useAppearanceSettings();

  // Apply theme colors whenever settings change
  useEffect(() => {
    if (settings) {
      console.log('Applying theme from global persistence:', settings);
      
      // Always apply theme colors when settings are available
      appearanceSettingsService.applyThemeColors(settings);
      
      // Store in sessionStorage for immediate application on page load
      sessionStorage.setItem('current-theme-settings', JSON.stringify(settings));
    }
  }, [settings]);

  // Apply stored theme immediately on mount (before settings load)
  useEffect(() => {
    const storedSettings = sessionStorage.getItem('current-theme-settings');
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        console.log('Applying stored theme on mount:', parsedSettings);
        appearanceSettingsService.applyThemeColors(parsedSettings);
      } catch (error) {
        console.warn('Failed to parse stored theme settings:', error);
        sessionStorage.removeItem('current-theme-settings');
      }
    }
  }, []); // Only run on mount

  // Cleanup on unmount only if needed
  useEffect(() => {
    return () => {
      // Don't reset colors on navigation - let them persist
      console.log('Theme initializer unmounting - keeping colors');
    };
  }, []);
};
