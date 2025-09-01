
// Centralized font configuration for world-class typography
export const FONT_CONFIG = {
  // Primary font stacks with fallbacks
  primary: {
    name: 'Inter',
    stack: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    weights: [300, 400, 500, 600, 700],
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
  },
  
  // Secondary font for headings and special text
  secondary: {
    name: 'Poppins',
    stack: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    weights: [400, 500, 600, 700],
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'
  },
  
  // Monospace font for code and technical content
  mono: {
    name: 'JetBrains Mono',
    stack: '"JetBrains Mono", "Fira Code", "Monaco", "Consolas", "Ubuntu Mono", monospace',
    weights: [400, 500, 600],
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap'
  }
} as const;

// Available font options for the appearance settings
export const FONT_OPTIONS = [
  {
    value: 'Inter',
    label: 'Inter (Recommended)',
    description: 'Modern, highly readable sans-serif',
    category: 'Sans Serif'
  },
  {
    value: 'Poppins',
    label: 'Poppins',
    description: 'Friendly, geometric sans-serif',
    category: 'Sans Serif'
  },
  {
    value: 'System',
    label: 'System Default',
    description: 'Use system native fonts',
    category: 'System'
  },
  {
    value: 'Roboto',
    label: 'Roboto',
    description: 'Google\'s modern sans-serif',
    category: 'Sans Serif'
  },
  {
    value: 'Open Sans',
    label: 'Open Sans',
    description: 'Friendly and readable',
    category: 'Sans Serif'
  },
  {
    value: 'Lato',
    label: 'Lato',
    description: 'Humanist sans-serif',
    category: 'Sans Serif'
  }
] as const;

// Font loading utility
export const loadGoogleFonts = (fontNames: string[]) => {
  const fontsToLoad: string[] = [];
  
  fontNames.forEach(fontName => {
    const fontConfig = Object.values(FONT_CONFIG).find(config => config.name === fontName);
    if (fontConfig) {
      fontsToLoad.push(fontConfig.googleFontsUrl);
    }
  });

  // Remove existing font links
  const existingLinks = document.querySelectorAll('link[data-font-loader]');
  existingLinks.forEach(link => link.remove());

  // Add new font links
  fontsToLoad.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.setAttribute('data-font-loader', 'true');
    document.head.appendChild(link);
  });
};

// Get font stack for a given font name
export const getFontStack = (fontName: string): string => {
  switch (fontName) {
    case 'Inter':
      return FONT_CONFIG.primary.stack;
    case 'Poppins':
      return FONT_CONFIG.secondary.stack;
    case 'JetBrains Mono':
      return FONT_CONFIG.mono.stack;
    case 'System':
      return '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    case 'Roboto':
      return '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    case 'Open Sans':
      return '"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    case 'Lato':
      return '"Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    default:
      return FONT_CONFIG.primary.stack;
  }
};
