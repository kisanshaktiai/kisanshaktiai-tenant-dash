import { Users, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EditingIndicatorProps {
  activeUsers: Array<{
    userId: string;
    userName: string;
    editingField?: string;
  }>;
  fieldName?: string;
  isLocked?: boolean;
}

export const EditingIndicator = ({ activeUsers, fieldName, isLocked }: EditingIndicatorProps) => {
  const editingUsers = fieldName
    ? activeUsers.filter((u) => u.editingField === fieldName)
    : activeUsers;

  if (editingUsers.length === 0 && !isLocked) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
          >
            {isLocked ? (
              <>
                <Lock className="h-3 w-3" />
                <span>Locked</span>
              </>
            ) : (
              <>
                <Users className="h-3 w-3" />
                <span>{editingUsers.length} editing</span>
              </>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            {editingUsers.map((user) => (
              <div key={user.userId} className="text-xs">
                {user.userName} is editing
                {user.editingField && ` ${user.editingField}`}
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
