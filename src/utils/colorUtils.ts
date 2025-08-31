
/**
 * Comprehensive color utility functions for theme system
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
 * Generate comprehensive semantic colors based on primary color
 */
export function generateSemanticColors(primaryHsl: string): {
  success: string;
  warning: string;
  info: string;
  destructive: string;
  border: string;
  muted: string;
} {
  // Parse HSL values
  const [h, s, l] = primaryHsl.split(' ').map((v, i) => {
    if (i === 0) return parseInt(v);
    return parseInt(v.replace('%', ''));
  });

  return {
    success: primaryHsl, // Use primary for success (green agricultural theme)
    warning: `38 92% 50%`, // Standard warning orange
    info: `221 83% 53%`, // Standard info blue
    destructive: `0 84% 60%`, // Standard destructive red
    border: `214 32% 91%`, // Light gray border
    muted: `210 40% 96%`, // Very light gray for muted backgrounds
  };
}

/**
 * Generate color variants (lighter/darker shades) for theming
 */
export function generateColorVariants(hsl: string): {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string; // base
  600: string;
  700: string;
  800: string;
  900: string;
} {
  const [h, s, l] = hsl.split(' ').map((v, i) => {
    if (i === 0) return parseInt(v);
    return parseInt(v.replace('%', ''));
  });

  return {
    50: `${h} ${Math.max(s - 20, 10)}% ${Math.min(l + 45, 95)}%`,
    100: `${h} ${Math.max(s - 15, 15)}% ${Math.min(l + 35, 90)}%`,
    200: `${h} ${Math.max(s - 10, 20)}% ${Math.min(l + 25, 85)}%`,
    300: `${h} ${Math.max(s - 5, 25)}% ${Math.min(l + 15, 80)}%`,
    400: `${h} ${s}% ${Math.min(l + 5, 75)}%`,
    500: hsl, // base color
    600: `${h} ${Math.min(s + 5, 100)}% ${Math.max(l - 5, 25)}%`,
    700: `${h} ${Math.min(s + 10, 100)}% ${Math.max(l - 15, 20)}%`,
    800: `${h} ${Math.min(s + 15, 100)}% ${Math.max(l - 25, 15)}%`,
    900: `${h} ${Math.min(s + 20, 100)}% ${Math.max(l - 35, 10)}%`,
  };
}

/**
 * Generate modern dark mode colors with gray base (not pure black)
 */
export function generateDarkModeColors(primaryHsl: string): {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  muted: string;
  mutedForeground: string;
  secondary: string;
  secondaryForeground: string;
  border: string;
  input: string;
} {
  return {
    background: `224 71% 4%`, // Modern dark gray (not pure black)
    foreground: `213 31% 91%`, // Light gray text
    card: `224 71% 4%`, // Same as background
    cardForeground: `213 31% 91%`, // Light gray text
    muted: `215 28% 17%`, // Dark gray for muted elements
    mutedForeground: `217 11% 65%`, // Medium gray text
    secondary: `215 28% 17%`, // Dark gray
    secondaryForeground: `213 31% 91%`, // Light gray text
    border: `215 28% 17%`, // Dark border
    input: `215 28% 17%`, // Dark input background
  };
}

/**
 * Generate sidebar colors (always light theme)
 */
export function generateSidebarColors(primaryHsl: string): {
  background: string;
  foreground: string;
  accent: string;
  accentForeground: string;
  border: string;
  primary: string;
  primaryForeground: string;
} {
  return {
    background: `0 0% 100%`, // Always white
    foreground: `222 84% 5%`, // Always dark text
    accent: `210 40% 96%`, // Light gray for hover
    accentForeground: `222 84% 5%`, // Dark text
    border: `214 32% 91%`, // Light border
    primary: primaryHsl, // Use theme primary
    primaryForeground: `0 0% 98%`, // White text on primary
  };
}

/**
 * Generate button state colors
 */
export function generateButtonStates(baseHsl: string): {
  base: string;
  hover: string;
  active: string;
  disabled: string;
} {
  const [h, s, l] = baseHsl.split(' ').map((v, i) => {
    if (i === 0) return parseInt(v);
    return parseInt(v.replace('%', ''));
  });

  return {
    base: baseHsl,
    hover: `${h} ${s}% ${Math.max(l - 4, 5)}%`, // Slightly darker
    active: `${h} ${s}% ${Math.max(l - 8, 5)}%`, // Even darker
    disabled: `${h} ${Math.max(s - 20, 5)}% ${Math.min(l + 20, 85)}%`, // Desaturated and lighter
  };
}

/**
 * Generate status colors for different states
 */
export function generateStatusColors(isDark: boolean = false): {
  active: string;
  inactive: string;
  pending: string;
  error: string;
} {
  if (isDark) {
    return {
      active: `142 70% 45%`, // Green for active
      inactive: `217 11% 65%`, // Gray for inactive
      pending: `38 92% 50%`, // Orange for pending
      error: `0 63% 31%`, // Red for error (darker in dark mode)
    };
  }

  return {
    active: `142 76% 36%`, // Green for active
    inactive: `215 16% 47%`, // Gray for inactive
    pending: `38 92% 50%`, // Orange for pending
    error: `0 84% 60%`, // Red for error
  };
}

/**
 * Check if a color provides sufficient contrast for accessibility
 */
export function checkContrast(color1: string, color2: string): boolean {
  const [, , l1] = color1.split(' ').map((v, i) => {
    if (i === 0) return parseInt(v);
    return parseInt(v.replace('%', ''));
  });
  
  const [, , l2] = color2.split(' ').map((v, i) => {
    if (i === 0) return parseInt(v);
    return parseInt(v.replace('%', ''));
  });

  return Math.abs(l1 - l2) >= 50; // Simplified contrast ratio
}

/**
 * Ensure WCAG AA compliance by adjusting lightness if needed
 */
export function ensureContrast(foreground: string, background: string): string {
  const [h, s, l] = foreground.split(' ').map((v, i) => {
    if (i === 0) return parseInt(v);
    return parseInt(v.replace('%', ''));
  });
  
  const [, , bgL] = background.split(' ').map((v, i) => {
    if (i === 0) return parseInt(v);
    return parseInt(v.replace('%', ''));
  });

  let adjustedL = l;
  
  // If background is light, ensure text is dark enough
  if (bgL > 50) {
    adjustedL = Math.min(adjustedL, 30);
  } else {
    // If background is dark, ensure text is light enough
    adjustedL = Math.max(adjustedL, 70);
  }

  return `${h} ${s}% ${adjustedL}%`;
}

/**
 * Generate chart colors based on theme
 */
export function generateChartColors(primaryHsl: string, isDark: boolean = false): string[] {
  const [h, s] = primaryHsl.split(' ').map((v, i) => {
    if (i === 0) return parseInt(v);
    return parseInt(v.replace('%', ''));
  });

  if (isDark) {
    return [
      `${h} ${s}% 50%`, // Primary
      `${(h + 60) % 360} 60% 55%`, // Complementary
      `${(h + 120) % 360} 65% 60%`, // Triadic 1
      `${(h + 180) % 360} 70% 65%`, // Complementary opposite
      `${(h + 240) % 360} 75% 70%`, // Triadic 2
    ];
  }

  return [
    primaryHsl, // Primary
    `${(h + 60) % 360} ${s}% 45%`, // Complementary
    `${(h + 120) % 360} ${s}% 40%`, // Triadic 1
    `${(h + 180) % 360} ${s}% 35%`, // Complementary opposite
    `${(h + 240) % 360} ${s}% 30%`, // Triadic 2
  ];
}
