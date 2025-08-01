
import React from 'react';
import { cn } from '@/lib/utils';
import { FormProgress } from '../types/LeadFormTypes';

interface ProgressIndicatorProps {
  progress: FormProgress;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  className
}) => {
  const progressPercentage = (progress.completedFields.length / progress.totalSteps) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Form Progress</span>
        <span className="font-medium text-primary">
          {progress.completedFields.length} of {progress.totalSteps} completed
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div 
          className="bg-gradient-primary h-full transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="w-2 h-2 rounded-full bg-success" />
        <span>Almost there! Just a few more details.</span>
      </div>
    </div>
  );
};
