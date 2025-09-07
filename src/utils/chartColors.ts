/**
 * Utility functions for handling chart colors with CSS variables
 */

/**
 * Get computed color value from CSS variable
 * Converts CSS HSL variable format to proper color string for Chart.js
 */
export const getChartColor = (cssVar: string, opacity?: number): string => {
  // Get the CSS variable value from the root element
  const root = getComputedStyle(document.documentElement);
  const hslValue = root.getPropertyValue(cssVar).trim();
  
  if (!hslValue) {
    // Fallback colors if CSS variable is not found
    const fallbacks: Record<string, string> = {
      '--primary': '221.2 83.2% 53.3%',
      '--secondary': '210 40% 96.1%', 
      '--accent': '210 40% 96.1%',
      '--muted': '210 40% 96.1%',
      '--success': '142 76% 36%',
      '--warning': '45 93% 47%',
      '--destructive': '0 84.2% 60.2%',
    };
    const fallback = fallbacks[cssVar] || '0 0% 50%';
    return opacity !== undefined ? `hsla(${fallback}, ${opacity})` : `hsl(${fallback})`;
  }
  
  // Return properly formatted HSL/HSLA string
  return opacity !== undefined ? `hsla(${hslValue}, ${opacity})` : `hsl(${hslValue})`;
};

/**
 * Get multiple chart colors with proper formatting
 */
export const getChartColors = (opacity?: number): {
  primary: string;
  secondary: string;
  accent: string;
  muted: string;
  success: string;
  warning: string;
  destructive: string;
} => {
  return {
    primary: getChartColor('--primary', opacity),
    secondary: getChartColor('--secondary', opacity),
    accent: getChartColor('--accent', opacity),
    muted: getChartColor('--muted', opacity),
    success: getChartColor('--success', opacity),
    warning: getChartColor('--warning', opacity),
    destructive: getChartColor('--destructive', opacity),
  };
};

/**
 * Generate gradient for Chart.js
 */
export const createChartGradient = (
  ctx: CanvasRenderingContext2D,
  cssVar: string,
  height: number
): CanvasGradient => {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  const color = getChartColor(cssVar);
  gradient.addColorStop(0, `${color.replace('hsl', 'hsla').replace(')', ', 0.3)')}`);
  gradient.addColorStop(1, `${color.replace('hsl', 'hsla').replace(')', ', 0)')}`);
  return gradient;
};