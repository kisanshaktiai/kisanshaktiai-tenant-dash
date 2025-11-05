import { CheckCircle2, Loader2, XCircle, CloudOff } from 'lucide-react';
import { SaveStatus } from '@/hooks/organization/useAutoSave';
import { motion, AnimatePresence } from 'framer-motion';

interface SaveIndicatorProps {
  status: SaveStatus;
  error?: Error | null;
}

export const SaveIndicator = ({ status, error }: SaveIndicatorProps) => {
  return (
    <AnimatePresence mode="wait">
      {status !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="flex items-center gap-2 text-sm"
        >
          {status === 'saving' && (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-muted-foreground">Saving...</span>
            </>
          )}
          {status === 'saved' && (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-green-500">Saved</span>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-destructive">
                {error ? 'Error saving. Retrying...' : 'Failed to save'}
              </span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
