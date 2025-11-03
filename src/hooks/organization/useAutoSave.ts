import { useState, useEffect, useCallback, useRef } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

interface AutoSaveReturn {
  saveStatus: SaveStatus;
  saveError: Error | null;
  triggerSave: () => Promise<void>;
}

export const useAutoSave = <T>({
  data,
  onSave,
  delay = 2000,
  enabled = true,
}: AutoSaveOptions<T>): AutoSaveReturn => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const dataRef = useRef<T>(data);
  const isSavingRef = useRef(false);

  // Update ref when data changes
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const performSave = useCallback(async () => {
    if (isSavingRef.current) return;

    try {
      isSavingRef.current = true;
      setSaveStatus('saving');
      setSaveError(null);

      await onSave(dataRef.current);

      setSaveStatus('saved');
      
      // Reset to idle after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Auto-save error:', error);
      setSaveStatus('error');
      setSaveError(error as Error);

      // Retry after 5 seconds
      setTimeout(() => {
        setSaveStatus('idle');
        performSave();
      }, 5000);
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave]);

  const triggerSave = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await performSave();
  }, [performSave]);

  // Auto-save logic with debounce
  useEffect(() => {
    if (!enabled || saveStatus === 'saving') return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      performSave();
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, performSave, saveStatus]);

  return {
    saveStatus,
    saveError,
    triggerSave,
  };
};
