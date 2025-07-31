
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { FarmerFormData } from '@/hooks/business/useFarmerValidation';
import type { ValidationErrors } from '@/hooks/core/useFormValidation';
import { PersonalInfoFields } from './forms/PersonalInfoFields';
import { AddressFields } from './forms/AddressFields';
import { FarmingInfoFields } from './forms/FarmingInfoFields';

interface CreateFarmerFormProps {
  isOpen: boolean;
  formData: FarmerFormData;
  errors: ValidationErrors;
  isSubmitting: boolean;
  onFormChange: (field: keyof FarmerFormData, value: any) => void;
  onSubmit: (data: FarmerFormData) => void;
  onClose: () => void;
}

const formSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  village: z.string().min(1, 'Village is required'),
  taluka: z.string().optional(),
  district: z.string().min(1, 'District is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(6, 'Pincode is required'),
  farmingExperience: z.string().min(1, 'Farming experience is required'),
  totalLandSize: z.string().min(1, 'Land size is required'),
  irrigationSource: z.string().optional(),
  hasStorage: z.boolean(),
  hasTractor: z.boolean(),
  primaryCrops: z.array(z.string()).min(1, 'At least one crop is required'),
  notes: z.string().optional(),
});

export const CreateFarmerForm: React.FC<CreateFarmerFormProps> = ({
  isOpen,
  formData,
  errors,
  isSubmitting,
  onFormChange,
  onSubmit,
  onClose,
}) => {
  const form = useForm<FarmerFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: formData,
    values: formData,
  });

  const handleFormSubmit = (data: FarmerFormData) => {
    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Farmer</DialogTitle>
          <DialogDescription>
            Fill in the farmer's information to add them to your network.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <PersonalInfoFields
              control={form.control}
              errors={errors}
              onFormChange={onFormChange}
            />

            <AddressFields
              control={form.control}
              errors={errors}
              onFormChange={onFormChange}
            />

            <FarmingInfoFields
              control={form.control}
              errors={errors}
              formData={formData}
              onFormChange={onFormChange}
            />

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Farmer
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
