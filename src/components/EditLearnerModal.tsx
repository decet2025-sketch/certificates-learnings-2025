'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/forms/FormField';
import { LoadingButton } from '@/components/ui/loading';
import { AdminLearner } from '@/types/api';
import { adminApi } from '@/lib/api/admin-api';
import { showSuccessToast, showErrorToast } from '@/components/ui/toast';

// Validation schema
const editLearnerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  organization_website: z.string().min(1, 'Organization is required'),
});

type EditLearnerInput = z.infer<typeof editLearnerSchema>;

interface EditLearnerModalProps {
  learner: AdminLearner | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditLearnerModal({
  learner,
  isOpen,
  onClose,
  onSuccess,
}: EditLearnerModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditLearnerInput>({
    resolver: zodResolver(editLearnerSchema),
    defaultValues: {
      name: '',
      organization_website: '',
    },
  });

  
  // Update form values when learner changes
  useEffect(() => {
    if (learner) {
      reset({
        name: learner.learner_info.name,
        organization_website: learner.learner_info.organization_website,
      });
    } else {
      reset({
        name: '',
        organization_website: '',
      });
    }
  }, [learner, reset]);

  const onSubmit = async (data: EditLearnerInput) => {
    if (!learner) return;

    setIsLoading(true);
    try {
      const updateData: any = {
        learner_email: learner.learner_info.email,
        organization_website: learner.learner_info.organization_website,
        new_website: data.organization_website, // Always send the organization website from form
        name: data.name,
        email: learner.learner_info.email, // Send the original email value as-is
      };

      const result = await adminApi.updateLearner(updateData);

      showSuccessToast('Success', result.message);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update learner:', error);
      showErrorToast('Error', 'Failed to update learner. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Learner</DialogTitle>
          <DialogDescription>
            Update the learner's name and organization website.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField<EditLearnerInput>
            name="name"
            label="Name"
            placeholder="Enter learner name"
            required
            register={register}
            error={errors.name}
            disabled={isLoading}
          />

          
          <FormField<EditLearnerInput>
            name="organization_website"
            label="Organization Website"
            placeholder="Enter organization website"
            required
            register={register}
            error={errors.organization_website}
            disabled={isLoading}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              isLoading={isLoading}
              disabled={isSubmitting}
            >
              Update Learner
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}