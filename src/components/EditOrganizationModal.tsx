'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading';
import { Save, X } from 'lucide-react';

interface EditOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    sopEmail: string;
    website: string;
  }) => void;
  organization: {
    id: string;
    name: string;
    sopEmail: string;
    website: string;
  } | null;
  isLoading?: boolean;
}

export function EditOrganizationModal({
  isOpen,
  onClose,
  onSave,
  organization,
  isLoading = false,
}: EditOrganizationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    sopEmail: '',
    website: '',
  });

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        sopEmail: organization.sopEmail || '',
        website: organization.website || '',
      });
    }
  }, [organization]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid =
    formData.sopEmail.trim() !== '' && formData.website.trim() !== '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Organization
          </DialogTitle>
          <DialogDescription>
            Update the organization details below. POC email and
            website are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter organization name (optional)"
            />
            <p className="text-xs text-muted-foreground">
              This is optional and can be left blank
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sopEmail">POC Email *</Label>
            <Input
              id="sopEmail"
              type="email"
              value={formData.sopEmail}
              onChange={(e) =>
                handleChange('sopEmail', e.target.value)
              }
              placeholder="Enter POC email address"
              required
            />
            <p className="text-xs text-muted-foreground">
              This email will be used for POC communications
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website *</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) =>
                handleChange('website', e.target.value)
              }
              placeholder="https://example.com"
              required
            />
            <p className="text-xs text-muted-foreground">
              This serves as the unique identifier for the
              organization
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              isLoading={isLoading}
              loadingText="Saving..."
              disabled={!isFormValid || isLoading}
              className="flex items-center space-x-2"
            >
              {!isLoading && <Save className="h-4 w-4" />}
              <span>Save Changes</span>
            </LoadingButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
