
import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'compact' | 'spacious';
  maxWidth?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  variant = 'default',
  maxWidth = 'none'
}) => {
  const paddingClasses = {
    compact: 'p-1 sm:p-2 lg:p-3',
    default: 'p-2 sm:p-4 lg:p-6',
    spacious: 'p-3 sm:p-6 lg:p-8'
  };

  const maxWidthClasses = {
    none: 'max-w-none',
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  };

  return (
    <div className={cn(
      'w-full mx-auto',
      paddingClasses[variant],
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  );
};
