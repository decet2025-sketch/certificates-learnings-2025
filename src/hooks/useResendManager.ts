import { useState } from 'react';
import { adminApi } from '@/lib/api/admin-api';
import { sopCertificateApi } from '@/lib/api/sop-api';
import { toast } from 'react-toastify';

interface ResendState {
  isResending: boolean;
  resendingItems: Set<string>;
}

export const useResendManager = () => {
  const [resendState, setResendState] = useState<ResendState>({
    isResending: false,
    resendingItems: new Set(),
  });

  const resendCertificate = async (
    learnerEmail: string,
    courseId: string,
    isAdmin: boolean = false
  ) => {
    const resendKey = `${learnerEmail}-${courseId}`;

    // Prevent duplicate requests
    if (resendState.resendingItems.has(resendKey)) {
      return;
    }

    setResendState((prev) => {
      const newResendingItems = new Set(prev.resendingItems);
      newResendingItems.add(resendKey);
      return {
        isResending: true,
        resendingItems: newResendingItems,
      };
    });

    try {
      let result;
      if (isAdmin) {
        result = await adminApi.resendCertificate(
          learnerEmail,
          courseId
        );
        // Admin API returns { success: boolean; message: string }
        if (result.success) {
          toast.success(
            `Certificate has been resent to ${learnerEmail}`,
            {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
        } else {
          // Show generic error toast for non-success responses
          toast.error(
            'Failed to resend certificate. Please try again.',
            {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
        }
      } else {
        result = await sopCertificateApi.resendCertificate(
          learnerEmail,
          courseId
        );
        // SOP API returns { ok: boolean; data: ... } or { ok: boolean; error: ... }
        if (result.ok && result.data) {
          // Use the message from the response data
          const successMessage =
            result.data.message ||
            `Certificate has been resent to ${learnerEmail}`;
          toast.success(successMessage, {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else {
          // Show generic error toast for non-success responses
          toast.error(
            'Failed to resend certificate. Please try again.',
            {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
        }
      }
    } catch (error) {
      // Log error for debugging and show generic error toast
      console.error('Resend certificate error:', error);
      toast.error('Failed to resend certificate. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setResendState((prev) => {
        const newResendingItems = new Set(prev.resendingItems);
        newResendingItems.delete(resendKey);
        return {
          isResending: newResendingItems.size > 0,
          resendingItems: newResendingItems,
        };
      });
    }
  };

  const isResending = (learnerEmail: string, courseId: string) => {
    const resendKey = `${learnerEmail}-${courseId}`;
    return resendState.resendingItems.has(resendKey);
  };

  return {
    resendCertificate,
    isResending,
    isAnyResending: resendState.isResending,
  };
};
