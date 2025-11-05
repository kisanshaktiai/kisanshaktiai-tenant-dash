
import { useEffect } from 'react';
import { useAppearanceSettings } from '@/hooks/useAppearanceSettings';
import { appearanceSettingsService } from '@/services/AppearanceSettingsService';

export const ThemeInitializer = () => {
  const { settings } = useAppearanceSettings();

  // SINGLE GLOBAL THEME APPLICATION POINT
  // Apply stored theme immediately on mount (before settings load from DB)
  useEffect(() => {
    const storedSettings = sessionStorage.getItem('current-theme-settings');
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        appearanceSettingsService.applyThemeColors(parsedSettings);
      } catch (error) {
        sessionStorage.removeItem('current-theme-settings');
      }
    }
  }, []); // Only run once on mount

  // Apply theme when settings first load or change (with debounce)
  useEffect(() => {
    if (!settings) return;
    
    const timeoutId = setTimeout(() => {
      appearanceSettingsService.applyThemeColors(settings);
      sessionStorage.setItem('current-theme-settings', JSON.stringify(settings));
    }, 100); // 100ms debounce to batch rapid changes
    
    return () => clearTimeout(timeoutId);
  }, [settings?.id]); // Only when settings ID changes

  return null;
};
