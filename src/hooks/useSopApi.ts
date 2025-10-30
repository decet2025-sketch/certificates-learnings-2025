import { useState, useCallback } from 'react';
import {
  sopApi,
  SopLearnerApi,
  CertificateDownloadResponse,
  CertificateResendResponse,
  LearnerStatisticsResponse,
} from '@/lib/api/sop-api';
import { handleApiErrorWithToast } from '@/lib/error-toast-handler';

export const useSopApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiCall = useCallback(
    async <T>(
      apiCall: () => Promise<T>,
      context?: string
    ): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiCall();
        return result;
      } catch (err) {
        // Show toast for the error
        handleApiErrorWithToast(err, context);

        // Set a generic error message for the state (UI won't show this due to toast)
        const errorMessage =
          'An error occurred. Please check the notification.';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const listOrganizationLearners = useCallback(
    async (
      organizationWebsite: string,
      limit: number = 50,
      offset: number = 0
    ) => {
      return handleApiCall(
        () =>
          sopApi.listOrganizationLearners(
            organizationWebsite,
            limit,
            offset
          ),
        'List Organization Learners'
      );
    },
    [handleApiCall]
  );

  const downloadCertificate = useCallback(
    async (learnerEmail: string, courseId: string) => {
      return handleApiCall(
        () => sopApi.downloadCertificate(learnerEmail, courseId),
        'Download Certificate'
      );
    },
    [handleApiCall]
  );

  const resendCertificate = useCallback(
    async (learnerEmail: string, courseId: string) => {
      return handleApiCall(
        () => sopApi.resendCertificate(learnerEmail, courseId),
        'Resend Certificate'
      );
    },
    [handleApiCall]
  );

  const getLearnerStatistics = useCallback(async () => {
    return handleApiCall(
      () => sopApi.getLearnerStatistics(),
      'Get Learner Statistics'
    );
  }, [handleApiCall]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    clearError,
    listOrganizationLearners,
    downloadCertificate,
    resendCertificate,
    getLearnerStatistics,
  };
};

export default useSopApi;
