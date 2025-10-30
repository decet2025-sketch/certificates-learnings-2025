'use client';

import React, { useState, useEffect } from 'react';
import { sopApi, SopLearner } from '@/lib/api/sop-api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Mail, RefreshCw } from 'lucide-react';

interface SopLearnerManagementProps {
  organizationWebsite: string;
}

export default function SopLearnerManagement({
  organizationWebsite,
}: SopLearnerManagementProps) {
  const [learners, setLearners] = useState<SopLearner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLearners = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await sopApi.listOrganizationLearners(
        organizationWebsite
      );
      setLearners(result.learners);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch learners'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async (
    learnerEmail: string,
    courseId: string
  ) => {
    try {
      const result = await sopApi.downloadCertificate(
        learnerEmail,
        courseId
      );
      // Open download URL in new tab
      window.open(result.download_url, '_blank');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to download certificate'
      );
    }
  };

  const handleResendCertificate = async (
    learnerEmail: string,
    courseId: string
  ) => {
    try {
      const result = await sopApi.resendCertificate(
        learnerEmail,
        courseId
      );
      if (result.message) {
        // Show success message
        alert(result.message);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to resend certificate'
      );
    }
  };

  const getCertificateStatus = (course: any) => {
    if (course.certificate_status === 'generated') {
      return 'Generated';
    }
    if (course.completion_percentage === 100) {
      return 'Ready';
    }
    return 'Pending';
  };

  const getCertificateStatusColor = (status: string) => {
    switch (status) {
      case 'Generated':
        return 'bg-green-100 text-green-800';
      case 'Ready':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  useEffect(() => {
    if (organizationWebsite) {
      fetchLearners();
    }
  }, [organizationWebsite]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading learners...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-600">
            <p>Error: {error}</p>
            <Button onClick={fetchLearners} className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Learners</CardTitle>
        <p className="text-sm text-gray-600">
          Managing learners for {organizationWebsite}
        </p>
      </CardHeader>
      <CardContent>
        {learners.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No learners found for this organization.
          </div>
        ) : (
          <div className="space-y-4">
            {learners.map((learner) =>
              learner.courses.map((course, courseIndex) => {
                const status = getCertificateStatus(course);
                return (
                  <div
                    key={`${learner.learner_info.email}-${course.course_id}-${courseIndex}`}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-medium">
                            {learner.learner_info.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {learner.learner_info.email}
                          </p>
                          <p className="text-sm text-gray-500">
                            Course: {course.course_name}
                          </p>
                          <p className="text-xs text-gray-400">
                            Progress: {course.completion_percentage}%
                          </p>
                        </div>
                        <Badge
                          className={getCertificateStatusColor(
                            status
                          )}
                        >
                          {status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {course.certificate_status === 'generated' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDownloadCertificate(
                              learner.learner_info.email,
                              course.course_id
                            )
                          }
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                      {course.completion_percentage === 100 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleResendCertificate(
                              learner.learner_info.email,
                              course.course_id
                            )
                          }
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Resend
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
