
import { useEffect } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAppearanceSettings } from '@/hooks/useAppearanceSettings';

export const useThemeWithSettings = () => {
  const { theme, setTheme } = useTheme();
  const { settings } = useAppearanceSettings();

  useEffect(() => {
    if (settings?.theme_mode && settings.theme_mode !== theme) {
      setTheme(settings.theme_mode);
    }
  }, [settings?.theme_mode, theme, setTheme]);

  return { theme, setTheme, settings };
};
