
import React from 'react';
import { CreateFarmerContainer } from '@/components/farmers/containers/CreateFarmerContainer';

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
    <CreateFarmerContainer
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};
