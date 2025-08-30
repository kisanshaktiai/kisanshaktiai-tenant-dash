
import { useGlobalThemePersistence } from '@/hooks/useGlobalThemePersistence';

export const ThemeInitializer = () => {
  useGlobalThemePersistence();
  return null; // This component doesn't render anything, just applies theme
};
