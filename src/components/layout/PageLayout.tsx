
import React from 'react';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className,
  maxWidth = 'none',
  padding = 'md'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3 lg:p-4',
    md: 'p-4 lg:p-6',
    lg: 'p-6 lg:p-8'
  };

  const maxWidthClasses = {
    none: 'w-full max-w-none',
    sm: 'w-full max-w-sm mx-auto',
    md: 'w-full max-w-md mx-auto',
    lg: 'w-full max-w-lg mx-auto',
    xl: 'w-full max-w-xl mx-auto',
    '2xl': 'w-full max-w-2xl mx-auto',
    '7xl': 'w-full max-w-7xl mx-auto',
    full: 'w-full'
  };

  return (
    <div className={cn(
      'min-h-full bg-background',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
};
