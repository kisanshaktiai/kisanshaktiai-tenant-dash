
import React from 'react';
import { cn } from '@/lib/utils';

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

export const PageContent: React.FC<PageContentProps> = ({
  children,
  className,
  spacing = 'md'
}) => {
  const spacingClasses = {
    sm: 'space-y-4',
    md: 'space-y-6',
    lg: 'space-y-8'
  };

  return (
    <div className={cn(spacingClasses[spacing], className)}>
      {children}
    </div>
  );
};
