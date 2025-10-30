
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminApi } from '@/lib/api/admin-api';
import { handleApiErrorWithToast } from '@/lib/error-toast-handler';
import { useOrganizationsStore } from '@/stores/organizationsStore';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: {
    id: string;
    website: string;
    name: string;
    sopEmail: string;
  } | null;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  organization,
}: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { resetSopPassword } = useOrganizationsStore();

  const handleSubmit = async () => {
    if (!organization || !newPassword) return;

    setIsLoading(true);
    try {
      await resetSopPassword(
        organization.website,
        newPassword,
        organization.sopEmail
      );
      onClose();
    } catch (error) {
      // Error is already handled by the store
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change SOP Password</DialogTitle>
          <DialogDescription>
            Enter a new password for the SOP user of "{" "}"
            {organization?.name}".
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
