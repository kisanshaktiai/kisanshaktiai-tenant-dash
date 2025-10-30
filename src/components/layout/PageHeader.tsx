
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  actions?: React.ReactNode;
  backButton?: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  actions,
  backButton,
  className,
  spacing = 'md'
}) => {
  const spacingClasses = {
    sm: 'mb-4',
    md: 'mb-6',
    lg: 'mb-8'
  };

  return (
    <div className={cn(spacingClasses[spacing], className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          {backButton && (
            <div className="mb-3">
              {backButton}
            </div>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {title}
            </h1>
            {badge && (
              <Badge 
                variant={badge.variant || 'outline'} 
                className="capitalize"
              >
                {badge.text}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
