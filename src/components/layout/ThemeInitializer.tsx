
import { useEffect } from 'react';
import { useAppearanceSettings } from '@/hooks/useAppearanceSettings';
import { appearanceSettingsService } from '@/services/AppearanceSettingsService';

export const ThemeInitializer = () => {
  const { settings } = useAppearanceSettings();

  // Apply theme from settings when they load
  useEffect(() => {
    if (settings) {
      console.log('Applying theme from settings:', settings);
      appearanceSettingsService.applyThemeColors(settings);
      
      // Store in sessionStorage for immediate application on page load
      sessionStorage.setItem('current-theme-settings', JSON.stringify(settings));
    }
  }, [settings]);

  // Apply stored theme immediately on mount (before settings load from DB)
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

  return null; // This component doesn't render anything, just applies theme
};
