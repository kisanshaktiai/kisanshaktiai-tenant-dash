
import { useState, useEffect } from 'react';

interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

const breakpoints: BreakpointConfig = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function useResponsiveBreakpoints() {
  const [windowWidth, setWindowWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return breakpoints.lg; // Default to desktop size during SSR
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    
    // Set initial width
    setWindowWidth(window.innerWidth);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < breakpoints.sm;
  const isTablet = windowWidth >= breakpoints.sm && windowWidth < breakpoints.lg;
  const isDesktop = windowWidth >= breakpoints.lg;
  const isLargeDesktop = windowWidth >= breakpoints.xl;

  const currentBreakpoint = Object.entries(breakpoints)
    .reverse()
    .find(([, width]) => windowWidth >= width)?.[0] || 'xs';

  return {
    windowWidth,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    currentBreakpoint,
    breakpoints,
    // Utility functions
    isAtLeast: (breakpoint: keyof BreakpointConfig) => windowWidth >= breakpoints[breakpoint],
    isBelow: (breakpoint: keyof BreakpointConfig) => windowWidth < breakpoints[breakpoint],
  };
}
