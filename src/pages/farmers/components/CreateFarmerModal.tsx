
import React from 'react';
import { EnhancedCreateFarmerContainer } from '@/components/farmers/containers/EnhancedCreateFarmerContainer';

interface CreateFarmerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateFarmerModal: React.FC<CreateFarmerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  return (
    <EnhancedCreateFarmerContainer
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};
