
import { useEffect } from 'react';
import { useAppearanceSettings } from '@/hooks/useAppearanceSettings';
import { appearanceSettingsService } from '@/services/AppearanceSettingsService';

export const ThemeInitializer = () => {
  const { settings } = useAppearanceSettings();

  // Apply theme from settings when they load (throttled to prevent loops)
  useEffect(() => {
    if (!settings) return;
    
    const lastAppliedKey = 'theme-initializer-applied';
    const lastAppliedTime = sessionStorage.getItem(lastAppliedKey);
    const now = Date.now();
    
    // Only apply if not applied in the last 2 seconds
    if (!lastAppliedTime || (now - parseInt(lastAppliedTime)) > 2000) {
      console.log('Applying theme from settings:', settings);
      appearanceSettingsService.applyThemeColors(settings);
      
      // Store in sessionStorage for immediate application on page load
      sessionStorage.setItem('current-theme-settings', JSON.stringify(settings));
      sessionStorage.setItem(lastAppliedKey, now.toString());
    }
  }, [settings?.id]); // Only depend on settings ID

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
