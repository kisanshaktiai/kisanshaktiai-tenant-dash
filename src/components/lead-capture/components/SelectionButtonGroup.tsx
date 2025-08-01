
import React from 'react';
import { cn } from '@/lib/utils';
import { SelectionOption } from '../types/LeadFormTypes';

interface SelectionButtonGroupProps {
  options: SelectionOption[];
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  required?: boolean;
  error?: string;
}

export const SelectionButtonGroup: React.FC<SelectionButtonGroupProps> = ({
  options,
  value,
  onChange,
  className,
  columns = 2,
  required = false,
  error
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className={cn('grid gap-3', gridCols[columns])}>
        {options.map((option) => {
          const isSelected = value === option.value;
          const IconComponent = option.icon;
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                'group relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200',
                'hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'min-h-[80px] text-center',
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-primary/2',
                error && !isSelected && 'border-destructive/50'
              )}
              aria-pressed={isSelected}
              aria-describedby={option.description ? `${option.value}-desc` : undefined}
            >
              {IconComponent && (
                <IconComponent 
                  className={cn(
                    'h-5 w-5 mb-2 transition-colors',
                    isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                  )} 
                />
              )}
              <span className={cn(
                'text-sm font-medium transition-colors',
                isSelected ? 'text-primary' : 'text-foreground'
              )}>
                {option.label}
              </span>
              {option.description && (
                <span 
                  id={`${option.value}-desc`}
                  className="text-xs text-muted-foreground mt-1 leading-tight"
                >
                  {option.description}
                </span>
              )}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="text-sm text-destructive mt-2" role="alert">
          {error}
        </p>
      )}
      {required && !value && (
        <p className="text-xs text-muted-foreground mt-1">
          * Please select an option to continue
        </p>
      )}
    </div>
  );
};
