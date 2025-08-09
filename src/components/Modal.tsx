
import React, { useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  primaryAction,
  secondaryAction,
  className,
  size = 'md',
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handlePrimaryAction = useCallback(() => {
    if (primaryAction && !primaryAction.disabled) {
      primaryAction.onClick();
    }
  }, [primaryAction]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Only handle keyboard events when modal is open
    if (!open) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        handleClose();
        break;
      
      case 'Enter':
        // Don't trigger primary action if focus is inside a textarea
        const activeElement = document.activeElement;
        if (activeElement?.tagName === 'TEXTAREA') {
          return;
        }
        
        // Don't trigger if focus is on a button (let the button handle it)
        if (activeElement?.tagName === 'BUTTON') {
          return;
        }

        // Don't trigger if we're in a form field that should handle enter
        if (activeElement?.tagName === 'INPUT' && 
            (activeElement as HTMLInputElement).type !== 'submit') {
          return;
        }

        if (primaryAction && !primaryAction.disabled) {
          event.preventDefault();
          handlePrimaryAction();
        }
        break;
    }
  }, [open, handleClose, handlePrimaryAction, primaryAction]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Generate unique IDs for accessibility
  const titleId = title ? `modal-title-${Math.random().toString(36).substr(2, 9)}` : undefined;
  const descriptionId = description ? `modal-description-${Math.random().toString(36).substr(2, 9)}` : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={contentRef}
        className={`${sizeClasses[size]} ${className || ''}`}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        {(title || description) && (
          <DialogHeader>
            {title && (
              <DialogTitle id={titleId}>
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription id={descriptionId}>
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}

        <div className="py-4">
          {children}
        </div>

        {(footer || primaryAction || secondaryAction) && (
          <DialogFooter>
            {footer || (
              <div className="flex gap-2 justify-end">
                {secondaryAction && (
                  <Button
                    variant="outline"
                    onClick={secondaryAction.onClick}
                    disabled={secondaryAction.disabled}
                  >
                    {secondaryAction.label}
                  </Button>
                )}
                {primaryAction && (
                  <Button
                    ref={primaryButtonRef}
                    variant={primaryAction.variant || 'default'}
                    onClick={primaryAction.onClick}
                    disabled={primaryAction.disabled}
                  >
                    {primaryAction.label}
                  </Button>
                )}
              </div>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
