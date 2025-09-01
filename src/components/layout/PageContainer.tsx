
import React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  fullHeight?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  noPadding = false,
  fullHeight = false
}) => {
  return (
    <div className={cn(
      "w-full",
      fullHeight ? "h-full" : "min-h-full",
      !noPadding && "p-2 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6",
      className
    )}>
      {children}
    </div>
  );
};
