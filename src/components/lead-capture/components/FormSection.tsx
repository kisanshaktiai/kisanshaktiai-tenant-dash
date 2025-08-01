
import React from 'react';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  isVisible?: boolean;
  step?: number;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className,
  isVisible = true,
  step
}) => {
  if (!isVisible) return null;

  return (
    <div className={cn(
      'space-y-4 animate-fade-in',
      className
    )}>
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          {step && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">{step}</span>
            </div>
          )}
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed pl-11">
            {description}
          </p>
        )}
      </div>
      <div className="pl-11 space-y-4">
        {children}
      </div>
    </div>
  );
};
