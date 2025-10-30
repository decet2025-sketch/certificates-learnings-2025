'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/forms/FormField';
import { LoadingButton } from '@/components/ui/loading';
import { Plus } from 'lucide-react';
import {
  createOrganizationSchema,
  CreateOrganizationInput,
} from '@/lib/validations';
import { useOrganizationsStore } from '@/stores/organizationsStore';
import { useUIStore } from '@/stores/uiStore';
import {
  showSuccessToast,
  showErrorToast,
} from '@/components/ui/toast';

interface AddOrganizationModalProps {
  children?: React.ReactNode;
}

export function AddOrganizationModal({
  children,
}: AddOrganizationModalProps) {
  const [open, setOpen] = useState(false);
  const { createOrganization, isLoading } = useOrganizationsStore();
  const { setModalOpen } = useUIStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: '',
      website: '',
      sopEmail: '',
      sopPassword: '',
    },
  });

  const onSubmit = async (data: CreateOrganizationInput) => {
    try {
      // @ts-ignore
      await createOrganization({
        name: data.name,
        website: data.website,
        sopEmail: data.sopEmail,
        sopPassword: data.sopPassword,
        status: 'active',
        totalLearners: 0,
        totalCourses: 0,
      });

      showSuccessToast(
        'Organization Added',
        'The organization has been successfully added to the system.'
      );

      reset();
      setOpen(false);
      setModalOpen('addOrganization', false);
    } catch (error) {
      console.error('Error adding organization:', error);
      showErrorToast(
        'Error Adding Organization',
        'Failed to add the organization. Please try again.'
      );
    }
  };

  const handleClose = () => {
    reset();
    setOpen(false);
    setModalOpen('addOrganization', false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Organization</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Add New Organization
          </DialogTitle>
          <DialogDescription>
            Fill in the details to add a new organization partner.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-6 py-4"
        >
          <FormField
            name="name"
            label="Organization Name"
            placeholder="Enter organization name"
            required
            register={register}
            error={errors.name}
            description="The name of the organization that will be displayed in the system"
          />

          <FormField
            name="website"
            label="Website URL"
            type="text"
            placeholder="https://example.com"
            required
            register={register}
            error={errors.website}
            description="The official website URL of the organization"
          />

          <FormField
            name="sopEmail"
            label="POC Email"
            type="email"
            placeholder="poc@example.com"
            required
            register={register}
            error={errors.sopEmail}
            description="The email address for the Point of Contact (POC) for this organization"
          />

          <FormField
            name="sopPassword"
            label="POC Password"
            type="password"
            placeholder="Enter secure password"
            required
            register={register}
            error={errors.sopPassword}
            description="A secure password for the POC account. Must be at least 8 characters with uppercase, lowercase, number, and special character."
          />
        </form>

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting || isLoading}
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            isLoading={isSubmitting || isLoading}
            loadingText="Adding Organization..."
            onClick={handleSubmit(onSubmit)}
            className="flex items-center space-x-2"
          >
            <span>Add Organization</span>
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
