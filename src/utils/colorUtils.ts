
/**
 * Color utility functions for appearance customization
 */

/**
 * Convert HEX color to HSL format
 * @param hex - HEX color string (e.g., "#10b981")
 * @returns HSL string in format "h s% l%" (e.g., "160 84% 39%")
 */
export function hexToHsl(hex: string): string {
  // Remove the hash if present
  hex = hex.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  
  // Convert to degrees and percentages
  const hDeg = Math.round(h * 360);
  const sPercent = Math.round(s * 100);
  const lPercent = Math.round(l * 100);
  
  return `${hDeg} ${sPercent}% ${lPercent}%`;
}

/**
 * Generate darker/lighter variants of a color for sidebar theme
 */
export function generateSidebarColors(primaryHsl: string): {
  background: string;
  foreground: string;
  accent: string;
  accentForeground: string;
  border: string;
} {
  // Parse HSL values
  const [h, s, l] = primaryHsl.split(' ').map((v, i) => {
    if (i === 0) return parseInt(v);
    return parseInt(v.replace('%', ''));
  });
  
  return {
    background: `${h} ${Math.max(s - 10, 15)}% ${Math.max(l - 70, 8)}%`,
    foreground: `${h} ${Math.max(s - 40, 15)}% ${Math.min(l + 60, 90)}%`,
    accent: `${h} ${Math.max(s - 10, 15)}% ${Math.max(l - 55, 15)}%`,
    accentForeground: `${h} ${Math.max(s - 40, 15)}% ${Math.min(l + 60, 90)}%`,
    border: `${h} ${Math.max(s - 10, 15)}% ${Math.max(l - 50, 20)}%`,
  };
}
